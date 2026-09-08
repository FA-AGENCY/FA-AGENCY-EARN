/**
 * Dev-only admin seed utility.
 * Reads ADMIN_SEED_EMAIL + ADMIN_SEED_PASSWORD from environment.
 * Creates (or updates) one SUPER_ADMIN account on API startup.
 * Disabled in production unless ADMIN_SEED_FORCE=true is explicitly set.
 *
 * IMPORTANT: Remove ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD from .env before
 * production deployment, or rotate the password immediately after first login.
 */

import AdminUser from '../models/AdminUser.js';
import { config } from './index.js';

export async function seedDevAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD?.trim();
  const force = process.env.ADMIN_SEED_FORCE === 'true';

  if (!email || !password) {
    return; // No seed credentials configured — skip silently
  }

  if (config.env === 'production' && !force) {
    console.warn('[AdminSeed] Skipped in production. Set ADMIN_SEED_FORCE=true to override (NOT recommended).');
    return;
  }

  if (password.length < 8) {
    console.warn('[AdminSeed] ADMIN_SEED_PASSWORD must be at least 8 characters. Skipping.');
    return;
  }

  try {
    const passwordHash = AdminUser.hashPassword(password, config.jwtSecret);
    const existing = await AdminUser.findOne({ email });

    if (existing) {
      // Only update password hash if it's different (prevents needless writes)
      if (existing.passwordHash !== passwordHash) {
        existing.passwordHash = passwordHash;
        await existing.save();
        console.log(`[AdminSeed] Updated password for admin: ${email}`);
      } else {
        console.log(`[AdminSeed] Admin already exists: ${email}`);
      }
    } else {
      await AdminUser.create({
        email,
        passwordHash,
        name: process.env.ADMIN_SEED_NAME?.trim() || 'FA Admin',
        role: 'SUPER_ADMIN',
        isActive: true
      });
      console.log(`[AdminSeed] Created SUPER_ADMIN: ${email}`);
    }
  } catch (error) {
    console.error('[AdminSeed] Failed to seed admin:', error.message);
  }
}
