/**
 * FA AGENCY™ EARN — Task Seed Script
 * 
 * Usage: node apps/api/src/scripts/seedTasks.js
 * 
 * Seeds production-ready tasks into the database.
 * Only runs if MONGODB_URI is configured.
 * Safe to re-run (upserts by title).
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Task from '../models/Task.js';

const TASKS = [
  // ─── Telegram Tasks ───────────────────────────────────────────────────────
  {
    title: 'Join FA AGENCY™ EARN Official Channel',
    description: 'আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে যোগ দিন এবং স্ক্রিনশট জমা দিন।',
    instructions: '1. চ্যানেলে যান: @FAAgencyEarn\n2. "Join" বাটন চাপুন\n3. স্ক্রিনশট নিন এবং জমা দিন।',
    reward: 10,
    category: 'Telegram',
    taskType: 'TELEGRAM_JOIN',
    verificationType: 'MANUAL',
    status: 'AVAILABLE',
    dailyLimit: 1,
    globalLimit: 0,
    icon: 'telegram'
  },
  {
    title: 'Join FA AGENCY™ Support Group',
    description: 'আমাদের সাপোর্ট গ্রুপে যোগ দিন।',
    instructions: '1. গ্রুপে যান: @FAAgencySupport\n2. "Join" বাটন চাপুন\n3. স্ক্রিনশট জমা দিন।',
    reward: 8,
    category: 'Telegram',
    taskType: 'TELEGRAM_JOIN',
    verificationType: 'MANUAL',
    status: 'AVAILABLE',
    dailyLimit: 1,
    globalLimit: 0,
    icon: 'telegram'
  },
  // ─── Facebook Tasks ────────────────────────────────────────────────────────
  {
    title: 'Follow FA AGENCY on Facebook',
    description: 'আমাদের ফেসবুক পেজ ফলো করুন।',
    instructions: '1. Facebook পেজে যান\n2. "Follow" বাটন চাপুন\n3. স্ক্রিনশট জমা দিন।',
    reward: 12,
    category: 'Web',
    taskType: 'WEBSITE_VISIT',
    verificationType: 'MANUAL',
    status: 'AVAILABLE',
    dailyLimit: 1,
    globalLimit: 0,
    icon: 'facebook'
  },
  // ─── YouTube Tasks ─────────────────────────────────────────────────────────
  {
    title: 'Subscribe to FA AGENCY YouTube',
    description: 'আমাদের YouTube চ্যানেল সাবস্ক্রাইব করুন।',
    instructions: '1. YouTube চ্যানেলে যান\n2. "Subscribe" বাটন চাপুন\n3. স্ক্রিনশট জমা দিন।',
    reward: 15,
    category: 'Web',
    taskType: 'VIDEO_WATCH',
    verificationType: 'MANUAL',
    status: 'AVAILABLE',
    dailyLimit: 1,
    globalLimit: 0,
    icon: 'youtube'
  },
  // ─── Survey Tasks ──────────────────────────────────────────────────────────
  {
    title: 'Complete User Experience Survey',
    description: 'আমাদের ছোট্ট সার্ভে সম্পন্ন করুন এবং মতামত দিন।',
    instructions: '1. সার্ভে ফর্ম পূরণ করুন (৩-৫ মিনিট)\n2. Submit করুন\n3. Confirmation স্ক্রিনশট জমা দিন।',
    reward: 20,
    category: 'Survey',
    taskType: 'SURVEY',
    verificationType: 'MANUAL',
    status: 'AVAILABLE',
    dailyLimit: 1,
    globalLimit: 0,
    icon: 'website'
  },
  // ─── WhatsApp Tasks ────────────────────────────────────────────────────────
  {
    title: 'Join FA AGENCY WhatsApp Group',
    description: 'আমাদের WhatsApp গ্রুপে যোগ দিন।',
    instructions: '1. WhatsApp গ্রুপে যোগ দিন\n2. "Joined" স্ট্যাটাসের স্ক্রিনশট জমা দিন।',
    reward: 10,
    category: 'Other',
    taskType: 'CUSTOM',
    verificationType: 'MANUAL',
    status: 'AVAILABLE',
    dailyLimit: 1,
    globalLimit: 0,
    icon: 'whatsapp'
  },
  // ─── Website Tasks ─────────────────────────────────────────────────────────
  {
    title: 'Visit FA AGENCY Official Website',
    description: 'আমাদের অফিসিয়াল ওয়েবসাইট ভিজিট করুন।',
    instructions: '1. fa-agency.online ওয়েবসাইটে যান\n2. যেকোনো পেজে ৩০ সেকেন্ড থাকুন\n3. স্ক্রিনশট জমা দিন।',
    reward: 8,
    category: 'Web',
    taskType: 'WEBSITE_VISIT',
    verificationType: 'MANUAL',
    status: 'AVAILABLE',
    dailyLimit: 1,
    globalLimit: 0,
    icon: 'website'
  },
  // ─── Instagram Tasks ───────────────────────────────────────────────────────
  {
    title: 'Follow FA AGENCY on Instagram',
    description: 'আমাদের Instagram পেজ ফলো করুন।',
    instructions: '1. Instagram-এ @FAAgencyOfficial খুঁজুন\n2. "Follow" করুন\n3. স্ক্রিনশট জমা দিন।',
    reward: 12,
    category: 'Other',
    taskType: 'CUSTOM',
    verificationType: 'MANUAL',
    status: 'AVAILABLE',
    dailyLimit: 1,
    globalLimit: 0,
    icon: 'instagram'
  }
];

async function seedTasks() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not configured. Cannot seed tasks.');
    process.exit(1);
  }

  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const taskData of TASKS) {
    const { icon, ...dbFields } = taskData;
    try {
      const existing = await Task.findOne({ title: dbFields.title });
      if (existing) {
        // Update existing task but preserve any admin customizations to reward/status
        await Task.findByIdAndUpdate(existing._id, {
          $set: {
            description: dbFields.description,
            instructions: dbFields.instructions,
            category: dbFields.category,
            taskType: dbFields.taskType,
            verificationType: dbFields.verificationType,
            dailyLimit: dbFields.dailyLimit,
            updatedAt: new Date()
          }
        });
        updated++;
        console.log(`  ↻ Updated: "${dbFields.title}"`);
      } else {
        await Task.create({ ...dbFields, createdAt: new Date(), updatedAt: new Date() });
        created++;
        console.log(`  ✓ Created: "${dbFields.title}" (৳${dbFields.reward})`);
      }
    } catch (err) {
      console.error(`  ✗ Failed: "${dbFields.title}" — ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n📋 Seed complete: ${created} created, ${updated} updated, ${skipped} skipped.`);
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
  process.exit(0);
}

seedTasks().catch((err) => {
  console.error('Seed script failed:', err.message);
  process.exit(1);
});
