const ZONE_ID = import.meta.env.VITE_MONETAG_ZONE_ID || '11756404';
const SDK_FN = `show_${ZONE_ID}`;

function getAdHandler() {
  if (typeof window[SDK_FN] === 'function') return window[SDK_FN];
  if (typeof window.show_rewarded === 'function') return window.show_rewarded;
  if (typeof window.show_11756404 === 'function') return window.show_11756404;
  return null;
}

class MonetagService {
  constructor() {
    this.isShowingAd = false;
  }

  async showRewardedAd(format) {
    if (this.isShowingAd) {
      throw new Error('ইতিমধ্যে একটি বিজ্ঞাপন চালু রয়েছে।');
    }

    const handler = getAdHandler();
    if (!handler) {
      throw new Error('অ্যাড লোড হতে ব্যর্থ হয়েছে। AdBlocker বন্ধ করুন বা ইন্টারনেট চেক করুন।');
    }

    this.isShowingAd = true;
    try {
      if (format) {
        await handler(format);
      } else {
        await handler();
      }
      return { success: true };
    } catch {
      throw new Error('বিজ্ঞাপন সম্পূর্ণ দেখতে পারেননি।');
    } finally {
      this.isShowingAd = false;
    }
  }
}

export default new MonetagService();
