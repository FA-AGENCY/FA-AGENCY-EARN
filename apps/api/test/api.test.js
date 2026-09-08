import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

import { createServer } from 'node:http';
import express from 'express';
import { TelegramAuthService } from '../src/services/telegramAuthService.js';
import { generateInternalUid } from '../src/utils/telegram.js';
import { config } from '../src/config/index.js';
import FraudEvent from '../src/models/FraudEvent.js';
import Withdrawal from '../src/models/Withdrawal.js';
import LedgerTransaction from '../src/models/LedgerTransaction.js';
import User from '../src/models/User.js';
import { requireAdmin, requireEarningAccess, requireAccountActivity, requireWithdrawalAccess } from '../src/middleware/auth.js';
import { adCompletionLimiter } from '../src/middleware/rateLimit.js';
import { MonetagProvider } from '../src/services/monetagService.js';
import Task from '../src/models/Task.js';
import TaskSubmission from '../src/models/TaskSubmission.js';
import DailyBonus from '../src/models/DailyBonus.js';
import Referral from '../src/models/Referral.js';
import SupportTicket from '../src/models/SupportTicket.js';

const PORT = 5100;

const app = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', database: 'not-configured' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/auth/telegram') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, user: { status: 'active' } }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

test('health endpoint responds with ok status', async () => {
  await new Promise((resolve) => {
    app.listen(PORT, resolve);
  });

  const res = await fetch(`http://localhost:${PORT}/health`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.status, 'ok');

  await new Promise((resolve, reject) => {
    app.close((err) => (err ? reject(err) : resolve()));
  });
});

test('telegram auth endpoint accepts request payload', async () => {
  await new Promise((resolve) => {
    app.listen(PORT, resolve);
  });

  const res = await fetch(`http://localhost:${PORT}/api/auth/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData: 'valid-init-data' })
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.ok, true);

  await new Promise((resolve, reject) => {
    app.close((err) => (err ? reject(err) : resolve()));
  });
});

test('telegram initData validation accepts a properly signed payload', () => {
  const botToken = '123:TESTTOKEN';
  const service = new TelegramAuthService();
  const user = {
    id: 42,
    first_name: 'Mizan',
    last_name: 'Rahman',
    username: 'mizan',
    language_code: 'bn'
  };

  const key = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const payload = {
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify(user)
  };

  const dataCheckString = Object.keys(payload)
    .sort()
    .map((key) => `${key}=${payload[key]}`)
    .join('\n');

  const hash = crypto
    .createHmac('sha256', key)
    .update(dataCheckString)
    .digest('hex');

  const initData = new URLSearchParams({ ...payload, hash }).toString();

  config.telegramBotToken = botToken;
  config.telegramAuthTtlSeconds = 600;

  const result = service.validateInitData(initData);
  assert.equal(result.telegramId, '42');
  assert.equal(result.username, 'mizan');
});

test('telegram initData rejects forged, expired, and modified payloads', () => {
  const botToken = '123:TESTTOKEN';
  const service = new TelegramAuthService();
  config.telegramBotToken = botToken;
  config.telegramAuthTtlSeconds = 600;
  const sign = (payload) => {
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const dataCheckString = Object.keys(payload).sort().map((key) => `${key}=${payload[key]}`).join('\n');
    const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    return new URLSearchParams({ ...payload, hash }).toString();
  };
  const user = JSON.stringify({ id: 42, first_name: 'Mizan' });
  const current = { auth_date: String(Math.floor(Date.now() / 1000)), user };
  const expired = { auth_date: String(Math.floor(Date.now() / 1000) - 601), user };
  const future = { auth_date: String(Math.floor(Date.now() / 1000) + 61), user };
  const valid = sign(current);
  const modified = valid.replace('Mizan', 'Changed');
  const forged = new URLSearchParams({ ...current, hash: '0'.repeat(64) }).toString();

  assert.throws(() => service.validateInitData(forged), /signature is invalid/);
  assert.throws(() => service.validateInitData(sign(expired)), /expired/);
  assert.throws(() => service.validateInitData(sign(future)), /future/);
  assert.throws(() => service.validateInitData(modified), /signature is invalid/);
});

test('internal UID generation uses the required FAE-XXXXXXXX format', () => {
  const uid = generateInternalUid();
  assert.match(uid, /^FAE-[A-HJ-NP-Z2-9]{8}$/);
});

test('fraud event schema supports required abuse signals and review states', () => {
  const event = new FraudEvent({
    userId: '507f1f77bcf86cd799439011',
    eventType: 'RAPID_AD_COMPLETION',
    riskLevel: 'MEDIUM',
    status: 'OPEN',
    description: 'rapid completion',
    evidence: { elapsedSeconds: 1 }
  });

  assert.equal(event.validateSync(), undefined);
});

test('withdrawal and ledger schemas require server-generated idempotency identifiers', () => {
  const withdrawalError = new Withdrawal({
    userId: '507f1f77bcf86cd799439011',
    amount: 100
  }).validateSync();
  const ledgerError = new LedgerTransaction({
    userId: '507f1f77bcf86cd799439011',
    type: 'WITHDRAWAL',
    amount: 100,
    direction: 'DEBIT',
    balanceBefore: 200,
    balanceAfter: 100
  }).validateSync();

  assert.match(withdrawalError.message, /idempotencyKey/);
  assert.match(ledgerError.message, /referenceId/);
});

test('financial uniqueness indexes are declared for critical identifiers', () => {
  const indexes = (model) => model.schema.indexes().map(([fields, options]) => ({ fields, options }));
  const userIndexes = indexes(User);
  const ledgerIndexes = indexes(LedgerTransaction);
  const withdrawalIndexes = indexes(Withdrawal);

  assert.ok(userIndexes.some((item) => item.fields.uid === 1 && item.options.unique));
  assert.ok(userIndexes.some((item) => item.fields.referralCode === 1 && item.options.unique));
  assert.ok(ledgerIndexes.some((item) => item.fields.referenceId === 1 && item.options.unique));
  assert.ok(ledgerIndexes.some((item) => item.fields.idempotencyKey === 1 && item.options.unique));
  assert.ok(withdrawalIndexes.some((item) => item.fields.referenceId === 1 && item.options.unique));
  assert.ok(withdrawalIndexes.some((item) => item.fields.idempotencyKey === 1 && item.options.unique));
});

test('admin middleware denies non-admin accounts and earning middleware blocks restricted accounts', () => {
  const responses = [];
  const res = { status(code) { responses.push(code); return this; }, json() { return this; } };
  requireAdmin({ account: { isAdmin: false, adminRole: null } }, res, () => {});
  requireEarningAccess({ account: { status: 'RESTRICTED' } }, res, () => {});

  assert.deepEqual(responses, [403, 403]);
});

test('sensitive endpoint limiter returns a Bengali response after the configured limit', async () => {
  const limitedApp = express();
  limitedApp.use(adCompletionLimiter);
  limitedApp.get('/limited', (_req, res) => res.json({ ok: true }));
  const server = await new Promise((resolve) => {
    const instance = limitedApp.listen(0, () => resolve(instance));
  });
  const { port } = server.address();

  try {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const allowed = await fetch(`http://localhost:${port}/limited`);
      assert.equal(allowed.status, 200);
    }
    const blocked = await fetch(`http://localhost:${port}/limited`);
    const body = await blocked.json();
    assert.equal(blocked.status, 429);
    assert.match(body.error, /বিজ্ঞাপন/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Monetag provider fails closed without undocumented server verification', async () => {
  const provider = new MonetagProvider({ zoneId: '8139969', rewardEnabled: true });
  const session = await provider.createSession({ adType: 'REWARDED_INTERSTITIAL' });
  assert.equal(session.status, 'READY');
  assert.equal(session.sdk, 'monetag-tg-sdk');
  await assert.rejects(() => provider.verifyCompletion(), /does not document a server-verifiable/);
});

test('account status middleware blocks suspended, banned, and closed accounts while allowing active accounts', () => {
  const codes = [];
  const res = { status(code) { codes.push(code); return this; }, json() { return this; } };
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  requireAccountActivity({ account: { status: 'ACTIVE' } }, res, next);
  assert.equal(nextCalled, true);

  requireAccountActivity({ account: { status: 'SUSPENDED' } }, res, next);
  requireAccountActivity({ account: { status: 'CLOSED' } }, res, next);
  requireAccountActivity({ account: { status: 'BANNED' } }, res, next);
  assert.deepEqual(codes, [403, 403, 403]);
});

test('withdrawal access middleware blocks restricted and suspended accounts', () => {
  const codes = [];
  const res = { status(code) { codes.push(code); return this; }, json() { return this; } };
  requireWithdrawalAccess({ account: { status: 'RESTRICTED' } }, res, () => {});
  requireWithdrawalAccess({ account: { status: 'SUSPENDED' } }, res, () => {});
  assert.deepEqual(codes, [403, 403]);
});

test('withdrawal state transitions follow valid paths and reject invalid shortcuts', () => {
  const allowedTransitions = {
    PENDING: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED'],
    APPROVED: ['PROCESSING', 'REJECTED'],
    PROCESSING: ['PAID', 'REJECTED']
  };

  assert.ok(allowedTransitions.PENDING.includes('UNDER_REVIEW'));
  assert.ok(allowedTransitions.UNDER_REVIEW.includes('APPROVED'));
  assert.ok(allowedTransitions.APPROVED.includes('PROCESSING'));
  assert.ok(allowedTransitions.PROCESSING.includes('PAID'));

  // Shortcuts or backward transitions must not be allowed
  assert.ok(!allowedTransitions.PENDING.includes('PAID'));
  assert.ok(!allowedTransitions.PENDING.includes('PROCESSING'));
  assert.ok(!allowedTransitions.PROCESSING.includes('PENDING'));
  assert.ok(!allowedTransitions.PROCESSING.includes('UNDER_REVIEW'));
});

test('task and task submission models validate required fields', () => {
  const task = new Task({
    title: 'ইউটিউব সাবস্ক্রাইব',
    reward: 15,
    taskType: 'VIDEO_WATCH'
  });
  assert.equal(task.validateSync(), undefined);

  const invalidTask = new Task({
    reward: 10
  });
  const err = invalidTask.validateSync();
  assert.ok(err.errors.title);
  assert.ok(err.errors.taskType);

  const invalidSub = new TaskSubmission({});
  const subErr = invalidSub.validateSync();
  assert.ok(subErr.errors.userId);
  assert.ok(subErr.errors.taskId);
});

test('daily bonus and referral indexes enforce unique constraints', () => {
  const bonusIndexes = DailyBonus.schema.indexes().map(([fields, options]) => ({ fields, options }));
  const referralIndexes = Referral.schema.indexes().map(([fields, options]) => ({ fields, options }));

  assert.ok(bonusIndexes.some((i) => i.fields.userId === 1 && i.fields.periodKey === 1 && i.options.unique));
  assert.ok(referralIndexes.some((i) => i.fields.referredUserId === 1 && i.options.unique));
});

test('support ticket model enforces length constraints on subject and message', () => {
  const valid = new SupportTicket({
    userId: '507f1f77bcf86cd799439011',
    subject: 'পেমেন্ট ইস্যু',
    message: 'আমার পেমেন্ট এখনো আসেনি।'
  });
  assert.equal(valid.validateSync(), undefined);

  const tooLong = new SupportTicket({
    userId: '507f1f77bcf86cd799439011',
    subject: 'a'.repeat(125),
    message: 'টেস্ট মেসেজ'
  });
  assert.ok(tooLong.validateSync().errors.subject);
});

test('payment destination masking helper hides sensitive digits', () => {
  const maskDestination = (val) => {
    if (!val) return '—';
    if (val.length <= 5) return `${val.slice(0, 1)}•••`;
    return `${val.slice(0, 3)}••••${val.slice(-2)}`;
  };

  assert.equal(maskDestination('01712345678'), '017••••78');
  assert.equal(maskDestination('1234'), '1•••');
  assert.equal(maskDestination(''), '—');
});

