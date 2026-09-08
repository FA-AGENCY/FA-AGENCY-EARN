import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import router from '../src/routes/index.js';
import { config } from '../src/config/index.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { WalletService } from '../src/services/walletService.js';
import { RewardEngine } from '../src/services/rewardEngine.js';
import { FraudService } from '../src/services/fraudService.js';
import User from '../src/models/User.js';
import Wallet from '../src/models/Wallet.js';
import AdSession from '../src/models/AdSession.js';
import AdReward from '../src/models/AdReward.js';
import LedgerTransaction from '../src/models/LedgerTransaction.js';
import Withdrawal from '../src/models/Withdrawal.js';
import FraudEvent from '../src/models/FraudEvent.js';
import AuditLog from '../src/models/AuditLog.js';

const testUri = process.env.MONGODB_TEST_URI;
const testDatabaseName = process.env.MONGODB_TEST_DB_NAME;
const integrationEnabled = Boolean(testUri && testDatabaseName);
const integrationTest = integrationEnabled ? test : test.skip;
const runId = `integration_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`;
const userIds = [];
let app;
let server;
let baseUrl;
let user;
let admin;

const createUser = async ({ isAdmin = false, adminRole = null } = {}) => {
  const created = await User.create({
    telegramId: `${runId}_${userIds.length + 1}`,
    uid: `FAE-${crypto.randomBytes(5).toString('hex').slice(0, 8).toUpperCase()}`,
    internalUid: `FAE-${crypto.randomBytes(5).toString('hex').slice(0, 8).toUpperCase()}`,
    firstName: 'Integration',
    username: `${runId}_${userIds.length + 1}`,
    referralCode: `REF-${crypto.randomBytes(5).toString('hex').slice(0, 8).toUpperCase()}`,
    isAdmin,
    adminRole
  });
  userIds.push(created._id);
  await Wallet.create({ userId: created._id, availableBalance: 1000, currency: 'BDT' });
  return created;
};

const tokenFor = (account) => jwt.sign({ id: account._id.toString(), role: account.adminRole || 'USER' }, config.jwtSecret || 'development-secret-change-me');

before(async () => {
  if (!integrationEnabled) return;
  await connectDatabase(testUri);
  assert.equal(mongoose.connection.name, testDatabaseName, 'MONGODB_TEST_URI must target the dedicated test database.');

  const hello = await mongoose.connection.getClient().db().admin().command({ hello: 1 });
  assert.ok(hello.setName || hello.isreplicaset, 'MongoDB test deployment must support replica-set transactions.');

  user = await createUser();
  admin = await createUser({ isAdmin: true, adminRole: 'ADMIN' });
  app = express();
  app.use(express.json());
  app.use(router);
  server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!integrationEnabled) return;
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  const owned = { $in: userIds };
  await Promise.all([
    User.deleteMany({ _id: owned }),
    Wallet.deleteMany({ userId: owned }),
    AdSession.deleteMany({ userId: owned }),
    AdReward.deleteMany({ userId: owned }),
    LedgerTransaction.deleteMany({ userId: owned }),
    Withdrawal.deleteMany({ userId: owned }),
    FraudEvent.deleteMany({ userId: owned }),
    AuditLog.deleteMany({ actorUserId: owned })
  ]);
  if (mongoose.connection.readyState !== 0) {
    await disconnectDatabase();
  }
});

integrationTest('wallet credit is atomic and idempotent', async () => {
  const first = await WalletService.applyBalanceChange({
    userId: user._id,
    amount: 25,
    type: 'ADMIN_ADJUSTMENT',
    direction: 'CREDIT',
    source: 'integration',
    sourceId: runId,
    idempotencyKey: `${runId}_credit`,
    referenceId: `${runId}_credit`
  });
  const duplicate = await WalletService.applyBalanceChange({
    userId: user._id,
    amount: 25,
    type: 'ADMIN_ADJUSTMENT',
    direction: 'CREDIT',
    source: 'integration',
    sourceId: runId,
    idempotencyKey: `${runId}_credit`,
    referenceId: `${runId}_credit`
  });
  const wallet = await Wallet.findById(user._id).lean();
  const ledger = await LedgerTransaction.find({ idempotencyKey: `${runId}_credit` }).lean();

  assert.equal(first.duplicate, false);
  assert.equal(duplicate.duplicate, true);
  assert.equal(wallet.availableBalance, 1025);
  assert.equal(ledger.length, 1);
  assert.equal(ledger[0].balanceBefore, 1000);
  assert.equal(ledger[0].balanceAfter, 1025);
});

integrationTest('failed debit rolls back wallet and ledger changes', async () => {
  const before = await Wallet.findById(user._id).lean();
  await assert.rejects(() => WalletService.applyBalanceChange({
    userId: user._id,
    amount: 5000,
    type: 'WITHDRAWAL',
    direction: 'DEBIT',
    source: 'integration',
    sourceId: runId,
    idempotencyKey: `${runId}_negative`,
    referenceId: `${runId}_negative`
  }), /Insufficient balance/);
  const after = await Wallet.findById(user._id).lean();
  const ledger = await LedgerTransaction.findOne({ idempotencyKey: `${runId}_negative` });
  assert.equal(after.availableBalance, before.availableBalance);
  assert.equal(ledger, null);
});

integrationTest('concurrent credits create exactly one idempotent financial mutation', async () => {
  const requests = await Promise.all(Array.from({ length: 8 }, () => RewardEngine.creditReward({
    userId: user._id,
    amount: 10,
    source: 'AD_REWARD',
    sourceId: new mongoose.Types.ObjectId().toString(),
    type: 'AD_REWARD',
    idempotencyKey: `${runId}_concurrent_credit`
  })));
  const ledger = await LedgerTransaction.find({ idempotencyKey: `${runId}_concurrent_credit` });
  const wallet = await Wallet.findById(user._id).lean();
  assert.equal(ledger.length, 1);
  assert.equal(requests.filter((item) => !item.duplicate).length, 1);
  assert.equal(wallet.availableBalance, 1035);
});

integrationTest('concurrent withdrawals reserve funds only once', async () => {
  const requests = await Promise.allSettled(Array.from({ length: 5 }, (_, index) => WalletService.reserveWithdrawal({
    userId: user._id,
    amount: 100,
    idempotencyKey: `${runId}_withdrawal_${index}`,
    withdrawal: { method: 'bKash', destination: `01700000${index}`, status: 'PENDING' }
  })));
  const successful = requests.filter((item) => item.status === 'fulfilled' && !item.value.duplicate);
  const wallet = await Wallet.findById(user._id).lean();
  const withdrawals = await Withdrawal.find({ userId: user._id, idempotencyKey: { $regex: `^${runId}_withdrawal_` } });
  assert.equal(successful.length, 1);
  assert.equal(withdrawals.length, 1);
  assert.equal(wallet.pendingBalance, 100);
  assert.ok(wallet.availableBalance >= 0);
  await WalletService.updateWithdrawalStatus({ withdrawalId: successful[0].value.withdrawal._id, status: 'REJECTED', adminUserId: admin._id });
});

integrationTest('withdrawal creation validation rolls back reservation', async () => {
  const before = await Wallet.findById(user._id).lean();
  await assert.rejects(() => WalletService.reserveWithdrawal({
    userId: user._id,
    amount: 50,
    idempotencyKey: `${runId}_rollback`,
    withdrawal: { method: 'INVALID_METHOD', destination: 'test' }
  }));
  const after = await Wallet.findById(user._id).lean();
  assert.equal(after.availableBalance, before.availableBalance);
  assert.equal(after.pendingBalance, before.pendingBalance);
  assert.equal(await Withdrawal.countDocuments({ idempotencyKey: `${runId}_rollback` }), 0);
  assert.equal(await LedgerTransaction.countDocuments({ idempotencyKey: `${runId}_rollback` }), 0);
});

integrationTest('rejected withdrawal reverses funds without increasing lifetime earnings', async () => {
  const before = await Wallet.findById(user._id).lean();
  const reservation = await WalletService.reserveWithdrawal({
    userId: user._id,
    amount: 75,
    idempotencyKey: `${runId}_reversal`,
    withdrawal: { method: 'bKash', destination: '0170000099', status: 'PENDING' }
  });
  await WalletService.updateWithdrawalStatus({ withdrawalId: reservation.withdrawal._id, status: 'REJECTED', adminUserId: admin._id });
  await assert.rejects(() => WalletService.updateWithdrawalStatus({ withdrawalId: reservation.withdrawal._id, status: 'REJECTED', adminUserId: admin._id }));
  const after = await Wallet.findById(user._id).lean();
  const reversal = await LedgerTransaction.findOne({ idempotencyKey: `withdrawal_reversal_${reservation.withdrawal._id}` }).lean();
  const withdrawal = await Withdrawal.findById(reservation.withdrawal._id).lean();
  assert.equal(withdrawal.status, 'REJECTED');
  assert.equal(after.availableBalance, before.availableBalance);
  assert.equal(after.pendingBalance, before.pendingBalance);
  assert.equal(after.lifetimeEarned, before.lifetimeEarned);
  assert.ok(reversal);
});

integrationTest('ledger records are immutable and fraud events persist', async () => {
  const transaction = await LedgerTransaction.findOne({ idempotencyKey: `${runId}_credit` });
  await assert.rejects(() => LedgerTransaction.updateOne({ _id: transaction._id }, { $set: { amount: 999 } }), /immutable/);
  const rapid = await FraudService.record({ userId: user._id, type: 'RAPID_AD_COMPLETION', riskLevel: 'MEDIUM', description: 'integration rapid', evidence: { runId }, metadata: { runId } });
  const duplicate = await FraudService.record({ userId: user._id, type: 'DUPLICATE_AD_COMPLETION', riskLevel: 'HIGH', description: 'integration duplicate', evidence: { runId }, metadata: { runId } });
  const suspicious = await FraudService.record({ userId: user._id, type: 'SUSPICIOUS_WITHDRAWAL', riskLevel: 'HIGH', description: 'integration withdrawal', evidence: { runId }, metadata: { runId } });
  const stored = await FraudEvent.find({ _id: { $in: [rapid._id, duplicate._id, suspicious._id] } }).lean();
  assert.equal(stored.length, 3);
  assert.ok(stored.every((event) => event.userId.toString() === user._id.toString() && event.createdAt));
});

integrationTest('current account status and admin RBAC are enforced through API auth', async () => {
  const normalResponse = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${tokenFor(user)}` } });
  assert.equal(normalResponse.status, 403);

  user.status = 'SUSPENDED';
  await user.save();
  const suspendedResponse = await fetch(`${baseUrl}/api/ads/session`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenFor(user)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ adType: 'REWARDED_INTERSTITIAL' })
  });
  assert.equal(suspendedResponse.status, 403);
  user.status = 'ACTIVE';
  await user.save();
});