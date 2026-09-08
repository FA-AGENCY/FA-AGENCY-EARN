import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'অনেকবার লগইন চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।' }
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'অনেকগুলো অনুরোধ হয়েছে। অনুগ্রহ করে ধীরে চেষ্টা করুন।' }
});

const createLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: message }
});

export const adSessionLimiter = createLimiter(60 * 1000, 10, 'বিজ্ঞাপন সেশন তৈরির সীমা অতিক্রম হয়েছে।');
export const adCompletionLimiter = createLimiter(60 * 1000, 12, 'বিজ্ঞাপন সম্পন্ন করার সীমা অতিক্রম হয়েছে।');
export const bonusLimiter = createLimiter(24 * 60 * 60 * 1000, 3, 'আজকের বোনাসের অনুরোধ সীমা অতিক্রম হয়েছে।');
export const taskLimiter = createLimiter(60 * 1000, 20, 'টাস্ক অনুরোধের সীমা অতিক্রম হয়েছে।');
export const withdrawalLimiter = createLimiter(60 * 60 * 1000, 5, 'উত্তোলনের অনুরোধের সীমা অতিক্রম হয়েছে।');
export const adminLimiter = createLimiter(60 * 1000, 60, 'অ্যাডমিন অনুরোধের সীমা অতিক্রম হয়েছে।');
