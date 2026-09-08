import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { config } from '../config/index.js';
import { generateInternalUid, generateReferralCode } from '../utils/telegram.js';

export class UserService {
  async findOrCreateFromTelegram(profile) {
    const user = await User.findOne({ telegramId: profile.telegramId });
    if (user) {
      user.lastLoginAt = new Date();
      user.username = profile.username || user.username;
      user.firstName = profile.firstName || user.firstName;
      user.lastName = profile.lastName || user.lastName;
      user.photoUrl = profile.photoUrl || user.photoUrl;
      await user.save();
      return user;
    }

    let uid = generateInternalUid();
    let referralCode = generateReferralCode();

    while (await User.exists({ uid })) {
      uid = generateInternalUid();
    }

    while (await User.exists({ referralCode })) {
      referralCode = generateReferralCode();
    }

    try {
      const newUser = await User.create({
        telegramId: profile.telegramId,
        uid,
        internalUid: uid,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        username: profile.username || '',
        photoUrl: profile.photoUrl || '',
        languageCode: profile.languageCode || 'bn',
        referralCode,
        lastLoginAt: new Date(),
        status: 'ACTIVE'
      });

      await Wallet.create({
        userId: newUser._id,
        availableBalance: 0,
        pendingBalance: 0,
        lifetimeEarned: 0,
        lifetimeWithdrawn: 0,
        currency: 'BDT'
      });

      return newUser;
    } catch (error) {
      if (error.code === 11000) {
        return this.findOrCreateFromTelegram(profile);
      }
      throw error;
    }
  }

  async getAuthenticatedUser(user) {
    return User.findById(user.id).lean();
  }

  issueToken(user) {
    return jwt.sign({
      id: user._id,
      telegramId: user.telegramId,
      internalUid: user.internalUid,
      uid: user.uid,
      role: user.adminRole || 'USER'
    }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  }
}
