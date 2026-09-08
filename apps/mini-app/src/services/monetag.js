class MonetagService {
  constructor() {
    this.isShowingAd = false;
  }

  async showRewardedAd() {
    if (this.isShowingAd) {
      throw new Error('ইতিমধ্যে একটি বিজ্ঞাপন চালু রয়েছে।');
    }

    this.isShowingAd = true;

    return new Promise((resolve, reject) => {
      if (typeof window.show_rewarded === 'undefined') {
        this.isShowingAd = false;
        return reject(new Error('অ্যাড লোড হতে ব্যর্থ হয়েছে। AdBlocker বন্ধ করুন বা ইন্টারনেট চেক করুন।'));
      }

      try {
        window.show_rewarded()
          .then(() => {
            this.isShowingAd = false;
            resolve({ success: true });
          })
          .catch((err) => {
            this.isShowingAd = false;
            reject(new Error('বিজ্ঞাপন সম্পূর্ণ দেখতে পারেননি।'));
          });
      } catch (error) {
        this.isShowingAd = false;
        reject(new Error('বিজ্ঞাপন লোড হতে সমস্যা হয়েছে।'));
      }
    });
  }
}

export default new MonetagService();
