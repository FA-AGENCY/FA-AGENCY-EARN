import React, { useState, useEffect } from 'react';

// Payment Method Logos
const bkashLogo = new URL('./assets/payment-methods/bkash.png', import.meta.url).href;
const nagadLogo = new URL('./assets/payment-methods/nagad.png', import.meta.url).href;
const rocketLogo = new URL('./assets/payment-methods/rocket.png', import.meta.url).href;

// Task Platform Circular Logos
const taskLogos = {
  telegram: new URL('./assets/task-logos/telegram.png', import.meta.url).href,
  whatsapp: new URL('./assets/task-logos/whatsapp.png', import.meta.url).href,
  youtube: new URL('./assets/task-logos/youtube.png', import.meta.url).href,
  facebook: new URL('./assets/task-logos/facebook.png', import.meta.url).href,
  tiktok: new URL('./assets/task-logos/tiktok.png', import.meta.url).href,
  twitter: new URL('./assets/task-logos/twitter.png', import.meta.url).href,
  website: new URL('./assets/task-logos/website.png', import.meta.url).href
};

// SUPER ADMIN CONFIGURATION
const SUPER_ADMIN_ID = "980047040";
const SUPER_ADMIN_USERNAME = "Md_Aman_ullah";

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminTab, setAdminTab] = useState('settings'); // 'settings' | 'tasks' | 'proofs' | 'withdraws'

  // Dynamic Dollar to BDT Rate (Admin Editable)
  const [usdToBdtRate, setUsdToBdtRate] = useState(120);

  // In-App Interstitial Ad Interval in Minutes (Default: 5 mins)
  const [adIntervalMinutes, setAdIntervalMinutes] = useState(5);

  // Financial States
  const [balance, setBalance] = useState(45.50);
  const [todayEarn, setTodayEarn] = useState(3.50);
  const [totalEarn, setTotalEarn] = useState(240.00);
  const [referrals, setReferrals] = useState(4);
  const [showBalance, setShowBalance] = useState(true);

  // Current User Context (Telegram WebApp Data Integration)
  const [currentUser, setCurrentUser] = useState({
    id: SUPER_ADMIN_ID,
    name: 'MD Aman Ullah',
    username: SUPER_ADMIN_USERNAME,
    avatar: null,
    referralCode: 'FA8829'
  });

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      setCurrentUser(prev => ({
        ...prev,
        id: String(tgUser.id),
        name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || prev.name,
        username: tgUser.username || prev.username
      }));
    }
  }, []);

  const isSuperAdmin = String(currentUser.id) === SUPER_ADMIN_ID || currentUser.username === SUPER_ADMIN_USERNAME;

  // Fully Controlled Monetag In-App Interstitial
  useEffect(() => {
    try {
      if (typeof window.show_11756404 === 'function') {
        const intervalSeconds = adIntervalMinutes * 60;
        const cappingHours = parseFloat((adIntervalMinutes / 60).toFixed(2));
        window.show_11756404({
          type: 'inApp',
          inAppSettings: {
            frequency: 1,
            capping: cappingHours,
            interval: intervalSeconds,
            timeout: 10, // 10 seconds delay after app opens
            everyPage: false
          }
        });
        console.log(`Monetag In-App initialized: Every ${adIntervalMinutes} mins.`);
      }
    } catch (err) {
      console.error('Monetag In-App error:', err);
    }
  }, [adIntervalMinutes]);

  // Fully Editable Daily Tasks
  const [dailyTasks, setDailyTasks] = useState([
    {
      id: 1,
      title: 'Join Official Telegram Channel',
      platform: 'telegram',
      rewardUSD: 0.10,
      link: 'https://t.me/',
      durationSec: 30,
      screenshotsRequired: 1,
      instructions: 'চ্যানেলে জয়েন করে একটি পরিষ্কার স্ক্রিনশট তুলে সাবমিট করুন।',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Subscribe YouTube Channel & Bell',
      platform: 'youtube',
      rewardUSD: 0.25,
      link: 'https://youtube.com/',
      durationSec: 60,
      screenshotsRequired: 1,
      instructions: 'ইউটিউব চ্যানেল সাবস্ক্রাইব করুন এবং বেল আইকন অন করে স্ক্রিনশট দিন।',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Follow Official TikTok Account',
      platform: 'tiktok',
      rewardUSD: 0.15,
      link: 'https://tiktok.com/',
      durationSec: 30,
      screenshotsRequired: 1,
      instructions: 'টিকটক অ্যাকাউন্ট ফলো দিয়ে লাইক করুন এবং প্রুফ আপলোড করুন।',
      status: 'pending'
    },
    {
      id: 4,
      title: 'Follow Official Facebook Page',
      platform: 'facebook',
      rewardUSD: 0.15,
      link: 'https://facebook.com/',
      durationSec: 30,
      screenshotsRequired: 1,
      instructions: 'ফেসবুক পেজে লাইক ও ফলো দিয়ে স্ক্রিনশট পাঠান।',
      status: 'pending'
    },
    {
      id: 5,
      title: 'Download & Install Partner App',
      platform: 'website',
      rewardUSD: 0.30,
      link: 'https://play.google.com/',
      durationSec: 120,
      screenshotsRequired: 1,
      instructions: 'অ্যাপ ডাউনলোড করে ওপেন করুন এবং হোমস্ক্রিনের স্ক্রিনশট দিন।',
      status: 'pending'
    }
  ]);

  // Video Earning Hub Tasks
  const [videoTasks, setVideoTasks] = useState([
    { id: 201, title: 'Watch Full YouTube Video (5 Min)', platform: 'youtube', rewardUSD: 0.30, link: 'https://youtube.com/', duration: '5 Min', durationSec: 300, status: 'pending' },
    { id: 202, title: 'Watch TikTok Trending Reel (1 Min)', platform: 'tiktok', rewardUSD: 0.15, link: 'https://tiktok.com/', duration: '1 Min', durationSec: 60, status: 'pending' },
    { id: 203, title: 'Watch Facebook Viral Reel (3 Min)', platform: 'facebook', rewardUSD: 0.20, link: 'https://facebook.com/reel', duration: '3 Min', durationSec: 180, status: 'pending' }
  ]);

  // Task Creation / Editing State for Admin
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    platform: 'telegram',
    rewardUSD: 0.10,
    link: '',
    durationSec: 30,
    screenshotsRequired: 1,
    instructions: ''
  });

  // Proof Submissions Queue
  const [proofSubmissions, setProofSubmissions] = useState([
    {
      id: 501,
      user: 'MD Aman Ullah',
      taskTitle: 'Watch Full YouTube Video (5 Min)',
      type: 'video',
      rewardUSD: 0.30,
      startProof: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150',
      endProof: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150',
      startTime: '04:10 AM',
      endTime: '04:15 AM'
    }
  ]);

  // Withdraw Requests Pool
  const [withdrawRequests, setWithdrawRequests] = useState([
    { id: 901, user: 'Tanvir Ahmed', method: 'BKASH', account: '01711223344', amountUSD: 10, amountBDT: 1200, time: '15 mins ago', status: 'Pending' },
    { id: 902, user: 'Sabbir Hossain', method: 'NAGAD', account: '01899887766', amountUSD: 20, amountBDT: 2400, time: '1 hour ago', status: 'Pending' }
  ]);

  // Monetag Configuration & Profit Margin
  const [monetagConfig, setMonetagConfig] = useState({
    zoneId: '11756404',
    rawApiPayout: 0.05,
    adminProfitMargin: 40
  });

  const calculatedUserAdReward = parseFloat(
    (monetagConfig.rawApiPayout * (1 - monetagConfig.adminProfitMargin / 100)).toFixed(3)
  );

  // Referral Friends Tracker
  const [referralList, setReferralList] = useState([
    { id: 1, name: 'Tanvir Ahmed', totalWithdrawn: 10, bonusPaid: true, status: 'Unlocked (৳100 Paid)' },
    { id: 2, name: 'Sabbir Hossain', totalWithdrawn: 0, bonusPaid: false, status: 'Pending ($10 Withdraw Req)' },
    { id: 3, name: 'Rabiul Islam', totalWithdrawn: 20, bonusPaid: true, status: 'Unlocked (৳100 Paid)' },
    { id: 4, name: 'Mahfuzur Rahman', totalWithdrawn: 0, bonusPaid: false, status: 'Pending ($10 Withdraw Req)' }
  ]);

  // Modals
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [gamesModalOpen, setGamesModalOpen] = useState(false);
  const [selectedGameUrl, setSelectedGameUrl] = useState('');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [socialProofModal, setSocialProofModal] = useState(null);
  const [videoProofModal, setVideoProofModal] = useState(null);
  const [walletModal, setWalletModal] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');

  // Proof Images
  const [proofImage1, setProofImage1] = useState(null);
  const [proofImage2, setProofImage2] = useState(null);

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState({ bkash: '01700000000', nagad: '', rocket: '' });
  const [kycStatus, setKycStatus] = useState('Unverified');
  const [nidNumber, setNidNumber] = useState('');
  const [nidFront, setNidFront] = useState(null);
  const [nidBack, setNidBack] = useState(null);
  const [userSelfie, setUserSelfie] = useState(null);

  // Cashout
  const [selectedMethod, setSelectedMethod] = useState('bkash');
  const [withdrawAmount, setWithdrawAmount] = useState(10);
  const [targetAccount, setTargetAccount] = useState(paymentMethods.bkash);

  // Profile Form States
  const [editName, setEditName] = useState(currentUser.name);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [editBkash, setEditBkash] = useState(paymentMethods.bkash);
  const [editNagad, setEditNagad] = useState(paymentMethods.nagad);
  const [editRocket, setEditRocket] = useState(paymentMethods.rocket);

  const primaryNeon = '#00D1FF';
  const bgDark = '#070E1E';
  const cardBg = 'rgba(15, 30, 65, 0.65)';
  const borderNeon = 'rgba(0, 209, 255, 0.2)';
  const availableSlots = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  const qualifiedReferrals = referralList.filter(f => f.bonusPaid).length;
  const milestoneTarget = 100;
  const milestonePercent = Math.min(100, Math.round((qualifiedReferrals / milestoneTarget) * 100));

  const [transactions, setTransactions] = useState([
    { type: 'Monetag Video Ad', date: '08 Sep 2026, 07:45 PM', amount: '+$0.03', positive: true, category: 'earn' },
    { type: 'Referral Bonus (Tanvir)', date: '08 Sep 2026, 07:12 PM', amount: '+$0.83', positive: true, category: 'earn' },
    { type: 'Cash Out (bKash)', date: '06 Sep 2026, 05:12 PM', amount: '-$10.00', positive: false, category: 'withdraw' }
  ]);

  // Rewarded Video Ad Execution
  const triggerMonetagAd = () => {
    if (typeof window.show_11756404 === 'function') {
      window.show_11756404().then(() => addAdBonus('Monetag Video Ad')).catch(() => fallbackAd('Video'));
    } else {
      fallbackAd('Video');
    }
  };

  // Rewarded Popup Ad Execution
  const triggerMonetagPopupAd = () => {
    if (typeof window.show_11756404 === 'function') {
      window.show_11756404('pop').then(() => addAdBonus('Monetag Popup Offer')).catch(() => fallbackAd('Popup'));
    } else {
      fallbackAd('Popup');
    }
  };

  const fallbackAd = (type) => {
    const ok = window.confirm(`[Monetag Rewarded ${type} Ad]\nবিজ্ঞাপন দেখা সম্পন্ন হয়েছে?\n\nমার্জিন কেটে ব্যালেন্সে $${calculatedUserAdReward} যোগ হবে।`);
    if (ok) addAdBonus(`Monetag ${type} Ad`);
  };

  const addAdBonus = (label) => {
    setBalance(b => b + calculatedUserAdReward);
    setTodayEarn(e => e + calculatedUserAdReward);
    setTotalEarn(t => t + calculatedUserAdReward);
    setTransactions(prev => [{
      type: label,
      date: 'Just now',
      amount: `+$${calculatedUserAdReward}`,
      positive: true,
      category: 'earn'
    }, ...prev]);
    alert(`বিজ্ঞাপন দেখার জন্য +$${calculatedUserAdReward} USD আপনার ওয়ালেটে যোগ হয়েছে!`);
  };

  // Withdraw Actions (Admin Approve / Reject)
  const handleApproveWithdraw = (reqId) => {
    setWithdrawRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Approved' } : r));
    alert('উইথড্র আবেদনটি অ্যাপ্রুভ করা হয়েছে! পেমেন্ট সম্পন্ন হয়েছে।');
  };

  const handleRejectWithdraw = (req) => {
    setBalance(b => b + req.amountUSD);
    setWithdrawRequests(prev => prev.filter(r => r.id !== req.id));
    alert(`উইথড্র বাতিল করা হয়েছে এবং $${req.amountUSD} ব্যবহারকারীর ওয়ালেটে ফেরত দেওয়া হয়েছে।`);
  };

  // Proof Approvals (Admin)
  const handleApproveProof = (sub) => {
    setBalance(b => b + sub.rewardUSD);
    setTodayEarn(e => e + sub.rewardUSD);
    setTotalEarn(t => t + sub.rewardUSD);
    setProofSubmissions(prev => prev.filter(p => p.id !== sub.id));
    setTransactions(prev => [{
      type: `Task Verified (${sub.taskTitle})`,
      date: 'Just now',
      amount: `+$${sub.rewardUSD.toFixed(2)}`,
      positive: true,
      category: 'earn'
    }, ...prev]);
    alert(`টাস্কটি অনুমোদিত হয়েছে! $${sub.rewardUSD.toFixed(2)} ইউজারের ব্যালেন্সে জমা হয়েছে।`);
  };

  const handleRejectProof = (subId) => {
    setProofSubmissions(prev => prev.filter(p => p.id !== subId));
    alert('প্রমাণপত্র সঠিক না থাকায় টাস্কটি বাতিল করা হয়েছে!');
  };

  // Save Task Form (Admin Create / Edit)
  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.link) return alert('টাস্ক শিরোনাম ও লিংক প্রদান করুন!');

    if (editingTask) {
      setDailyTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskForm } : t));
      alert('টাস্ক সফলভাবে আপডেট করা হয়েছে!');
    } else {
      const newTask = {
        id: Date.now(),
        ...taskForm,
        status: 'pending'
      };
      setDailyTasks([newTask, ...dailyTasks]);
      alert('নতুন টাস্ক সফলভাবে লাইভ যোগ করা হয়েছে!');
    }

    setEditingTask(null);
    setTaskForm({
      title: '',
      platform: 'telegram',
      rewardUSD: 0.10,
      link: '',
      durationSec: 30,
      screenshotsRequired: 1,
      instructions: ''
    });
  };

  const copyReferralLink = () => {
    const link = `https://t.me/FAAgencyEarnBot?start=${currentUser.referralCode}`;
    navigator.clipboard.writeText(link);
    alert(`রেফারেল লিংক কপি হয়েছে!\n${link}`);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectMethod = (m) => {
    setSelectedMethod(m);
    if (m === 'bkash') setTargetAccount(paymentMethods.bkash);
    if (m === 'nagad') setTargetAccount(paymentMethods.nagad);
    if (m === 'rocket') setTargetAccount(paymentMethods.rocket);
  };

  const handleKycSubmit = () => {
    if (!nidNumber || !nidFront || !nidBack || !userSelfie) {
      return alert('অনুগ্রহ করে NID নম্বর, সামনের সাইড, পিছনের সাইড ও নিজের সেলফি আপলোড করুন!');
    }
    setKycStatus('Pending');
    setProfileModal(null);
    alert('KYC সাবমিট হয়েছে! অ্যাডমিন যাচাই করে অনুমোদন দিলে ব্লু-টিক ব্যাজ পেয়ে যাবেন।');
  };

  const handleProcessCashout = () => {
    if (!targetAccount) return alert('অ্যাকাউন্ট নম্বর দিন!');
    if (withdrawAmount < 10 || withdrawAmount % 10 !== 0) return alert('উইথড্র সর্বনিম্ন $10 হতে হবে এবং $10, $20, $30 স্লটে তুলতে হবে!');
    if (balance - withdrawAmount < 1.0) return alert('পর্যাপ্ত ব্যালেন্স নেই! অ্যাকাউন্টে অন্তত $1.00 অবশিষ্ট থাকতে হবে।');

    const bdtEquivalent = withdrawAmount * usdToBdtRate;
    setBalance(prev => prev - withdrawAmount);

    setWithdrawRequests([{
      id: Date.now(),
      user: currentUser.name,
      method: selectedMethod.toUpperCase(),
      account: targetAccount,
      amountUSD: withdrawAmount,
      amountBDT: bdtEquivalent,
      time: 'Just now',
      status: 'Pending'
    }, ...withdrawRequests]);

    setTransactions(prev => [{
      type: `Cash Out (${selectedMethod.toUpperCase()})`,
      date: 'Just now',
      amount: `-$${withdrawAmount.toFixed(2)}`,
      positive: false,
      category: 'withdraw'
    }, ...prev]);

    setWalletModal(null);
    alert(`উইথড্র সফল হয়েছে!\nউত্তোলিত ডলার: $${withdrawAmount}\nটাকা: ৳ ${bdtEquivalent.toLocaleString()}`);
  };

  const handleSubmitSocialProof = () => {
    if (!proofImage1) return alert('স্ক্রিনশট সিলেক্ট করুন!');
    setDailyTasks(prev => prev.map(t => t.id === socialProofModal.id ? { ...t, status: 'reviewing' } : t));
    setProofSubmissions([{
      id: Date.now(),
      user: currentUser.name,
      taskTitle: socialProofModal.title,
      type: 'social',
      rewardUSD: socialProofModal.rewardUSD,
      startProof: proofImage1,
      endProof: null,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: ''
    }, ...proofSubmissions]);
    setSocialProofModal(null);
    setProofImage1(null);
    alert('প্রমাণপত্র জমা হয়েছে! অ্যাডমিন যাচাই করে ব্যালেন্সে টাকা যুক্ত করবেন।');
  };

  const handleSubmitVideoProof = () => {
    if (!proofImage1 || !proofImage2) return alert('ভিডিও শুরুর ও শেষের ২টি স্ক্রিনশটই আবশ্যক!');
    setVideoTasks(prev => prev.map(v => v.id === videoProofModal.id ? { ...v, status: 'reviewing' } : v));
    setProofSubmissions([{
      id: Date.now(),
      user: currentUser.name,
      taskTitle: videoProofModal.title,
      type: 'video',
      rewardUSD: videoProofModal.rewardUSD,
      startProof: proofImage1,
      endProof: proofImage2,
      startTime: '04:10 AM',
      endTime: '04:15 AM'
    }, ...proofSubmissions]);
    setVideoProofModal(null);
    setProofImage1(null);
    setProofImage2(null);
    alert('ভিডিওর ২টি স্ক্রিনশট জমা হয়েছে! সময় মিলিয়ে অ্যাডমিন অ্যাপ্রুভ করবেন।');
  };

  const filteredTransactions = transactions.filter(t => {
    if (historyFilter === 'earn') return t.category === 'earn';
    if (historyFilter === 'withdraw') return t.category === 'withdraw';
    return true;
  });

  return (
    <div style={{
      maxWidth: '430px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: bgDark,
      color: '#FFFFFF',
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      position: 'relative',
      paddingBottom: '80px',
      boxSizing: 'border-box'
    }}>

      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: `1px solid ${borderNeon}`,
        background: 'rgba(7, 14, 30, 0.85)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00D1FF, #0055FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid #00D1FF',
            overflow: 'hidden',
            boxShadow: '0 0 10px rgba(0,209,255,0.4)'
          }}>
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              'FA'
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px' }}>{currentUser.name}</span>
              {kycStatus === 'Verified' && <span style={{ color: '#00D1FF', fontSize: '13px' }}>✓</span>}
            </div>
            <span style={{ fontSize: '11px', color: '#10B981' }}>● ID: {currentUser.id}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSuperAdmin && (
            <button
              onClick={() => setIsAdminView(!isAdminView)}
              style={{
                background: isAdminView ? '#E11D48' : 'linear-gradient(90deg, #F59E0B, #D97706)',
                border: 'none',
                color: '#FFF',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.4)'
              }}>
              {isAdminView ? 'Exit Admin' : '⚡ Admin Control'}
            </button>
          )}

          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: cardBg,
            border: `1px solid ${borderNeon}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            🔔
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '16px' }}>

        {/* ================= COMPREHENSIVE ADMIN PANEL ================= */}
        {isAdminView ? (
          <div>
            <div style={{ background: '#1E293B', padding: '14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #F59E0B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 2px', color: '#FCD34D', fontSize: '16px' }}>👑 সুপার অ্যাডমিন প্যানেল</h3>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>লগইন: @{currentUser.username} ({currentUser.id})</span>
                </div>
                <span style={{ background: '#10B981', color: '#000', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px' }}>ACTIVE</span>
              </div>
            </div>

            {/* Admin Sub Navigation Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px' }}>
              {[
                { id: 'settings', label: 'সেটিংস & রেট' },
                { id: 'tasks', label: 'টাস্ক কন্ট্রোল' },
                { id: 'proofs', label: `প্রুফ (${proofSubmissions.length})` },
                { id: 'withdraws', label: `উইথড্র (${withdrawRequests.length})` }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setAdminTab(t.id)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: adminTab === t.id ? '1px solid #00D1FF' : '1px solid #334155',
                    background: adminTab === t.id ? 'rgba(0, 209, 255, 0.2)' : '#070E1E',
                    color: adminTab === t.id ? '#00D1FF' : '#94A3B8',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* 1. SETTINGS, DOLLAR RATE & AD INTERVAL */}
            {adminTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Free In-App Ad Interval Controller */}
                <div style={{ background: cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${borderNeon}` }}>
                  <h4 style={{ margin: '0 0 8px', color: '#38BDF8', fontSize: '14px' }}>⏱️ ইন-অ্যাপ ফ্রি অ্যাড ফ্রিকোয়েন্সি (Ad Interval)</h4>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 10px' }}>
                    কাস্টমারের বিরক্তি কমাতে কতক্ষণ পর পর অটো অ্যাড শো করবে তা নির্বাচন করুন:
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                      value={adIntervalMinutes}
                      onChange={(e) => setAdIntervalMinutes(parseInt(e.target.value))}
                      style={{ padding: '8px 12px', background: '#070E1E', border: '1px solid #38BDF8', color: '#38BDF8', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
                      <option value={1}>১ মিনিট পর পর</option>
                      <option value={5}>৫ মিনিট পর পর (Recommended)</option>
                      <option value={10}>১০ মিনিট পর পর</option>
                      <option value={15}>১৫ মিনিট পর পর</option>
                    </select>
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>✓ সক্রিয়: {adIntervalMinutes} মিনিট</span>
                  </div>
                </div>

                <div style={{ background: cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${borderNeon}` }}>
                  <h4 style={{ margin: '0 0 10px', color: '#10B981', fontSize: '14px' }}>💵 ডলার এক্সচেঞ্জ রেট কন্ট্রোল (USD to BDT)</h4>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 10px' }}>
                    বাজার রেট অনুযায়ী ১ ডলারের দাম কম-বেশি করুন:
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>1 USD =</span>
                    <input
                      type="number"
                      value={usdToBdtRate}
                      onChange={(e) => setUsdToBdtRate(parseFloat(e.target.value) || 120)}
                      style={{ width: '90px', padding: '8px', background: '#070E1E', border: '1px solid #10B981', color: '#10B981', fontSize: '14px', fontWeight: 'bold', borderRadius: '8px', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>BDT (টাকা)</span>
                  </div>
                </div>

                <div style={{ background: cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${borderNeon}` }}>
                  <h4 style={{ margin: '0 0 10px', color: '#F59E0B', fontSize: '14px' }}>⚙️ Monetag অ্যাড মার্জিন সেটিংস</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px' }}>অ্যাডমিন মার্জিন (%):</span>
                    <input
                      type="number"
                      value={monetagConfig.adminProfitMargin}
                      onChange={(e) => setMonetagConfig({ ...monetagConfig, adminProfitMargin: parseInt(e.target.value) || 0 })}
                      style={{ width: '70px', padding: '6px', background: '#070E1E', border: '1px solid #334155', color: '#38BDF8', textAlign: 'center', fontWeight: 'bold', borderRadius: '6px' }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#10B981' }}>ইউজার রিওয়ার্ড পাবে: ${calculatedUserAdReward} USD (≈ ৳ {(calculatedUserAdReward * usdToBdtRate).toFixed(2)} টাকা)</div>
                </div>
              </div>
            )}

            {/* 2. TASK CONTROLLER & EDITOR */}
            {adminTab === 'tasks' && (
              <div>
                <div style={{ background: cardBg, padding: '14px', borderRadius: '14px', marginBottom: '14px', border: `1px solid ${borderNeon}` }}>
                  <h4 style={{ margin: '0 0 12px', color: primaryNeon, fontSize: '14px' }}>
                    {editingTask ? '✏️ টাস্ক এডিট করুন' : '➕ নতুন টাস্ক যুক্ত করুন'}
                  </h4>

                  <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="টাস্ক শিরোনাম (যেমন: জয়েন টেলিগ্রাম গ্রুপ)"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      style={{ padding: '8px', background: '#070E1E', border: '1px solid #334155', borderRadius: '6px', color: '#FFF', fontSize: '12px' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select
                        value={taskForm.platform}
                        onChange={(e) => setTaskForm({ ...taskForm, platform: e.target.value })}
                        style={{ padding: '8px', background: '#070E1E', border: '1px solid #334155', borderRadius: '6px', color: '#FFF', fontSize: '12px' }}>
                        <option value="telegram">Telegram</option>
                        <option value="youtube">YouTube</option>
                        <option value="facebook">Facebook</option>
                        <option value="tiktok">TikTok</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="website">App/Website</option>
                      </select>

                      <input
                        type="number"
                        step="0.01"
                        placeholder="রিওয়ার্ড ($ USD)"
                        value={taskForm.rewardUSD}
                        onChange={(e) => setTaskForm({ ...taskForm, rewardUSD: parseFloat(e.target.value) || 0.05 })}
                        style={{ padding: '8px', background: '#070E1E', border: '1px solid #334155', borderRadius: '6px', color: '#FFF', fontSize: '12px' }}
                      />
                    </div>

                    <input
                      type="url"
                      placeholder="টাস্ক লিংক (https://...)"
                      value={taskForm.link}
                      onChange={(e) => setTaskForm({ ...taskForm, link: e.target.value })}
                      style={{ padding: '8px', background: '#070E1E', border: '1px solid #334155', borderRadius: '6px', color: '#FFF', fontSize: '12px' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input
                        type="number"
                        placeholder="সময়কাল (সেকেন্ড)"
                        value={taskForm.durationSec}
                        onChange={(e) => setTaskForm({ ...taskForm, durationSec: parseInt(e.target.value) || 30 })}
                        style={{ padding: '8px', background: '#070E1E', border: '1px solid #334155', borderRadius: '6px', color: '#FFF', fontSize: '12px' }}
                      />
                      <select
                        value={taskForm.screenshotsRequired}
                        onChange={(e) => setTaskForm({ ...taskForm, screenshotsRequired: parseInt(e.target.value) || 1 })}
                        style={{ padding: '8px', background: '#070E1E', border: '1px solid #334155', borderRadius: '6px', color: '#FFF', fontSize: '12px' }}>
                        <option value={1}>১টি স্ক্রিনশট প্রুফ</option>
                        <option value={2}>২টি স্ক্রিনশট প্রুফ (শুরু ও শেষ)</option>
                      </select>
                    </div>

                    <textarea
                      placeholder="কাজের বিস্তারিত নির্দেশনা (Instructions)..."
                      value={taskForm.instructions}
                      onChange={(e) => setTaskForm({ ...taskForm, instructions: e.target.value })}
                      rows={2}
                      style={{ padding: '8px', background: '#070E1E', border: '1px solid #334155', borderRadius: '6px', color: '#FFF', fontSize: '11px', resize: 'none' }}
                    />

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="submit"
                        style={{ flex: 1, padding: '10px', background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '6px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                        {editingTask ? 'আপডেট করুন' : 'পাবলিশ করুন'}
                      </button>
                      {editingTask && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTask(null);
                            setTaskForm({ title: '', platform: 'telegram', rewardUSD: 0.10, link: '', durationSec: 30, screenshotsRequired: 1, instructions: '' });
                          }}
                          style={{ padding: '10px', background: '#334155', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 'bold', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Task List Management */}
                <h5 style={{ margin: '0 0 8px', color: '#94A3B8' }}>বর্তমান লাইভ টাস্ক তালিকা ({dailyTasks.length})</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dailyTasks.map(t => (
                    <div key={t.id} style={{ background: '#070E1E', padding: '10px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{t.title}</div>
                        <div style={{ fontSize: '10px', color: '#10B981', marginTop: '2px' }}>
                          ${t.rewardUSD} (৳ {(t.rewardUSD * usdToBdtRate).toFixed(1)}) • {t.durationSec}s • {t.screenshotsRequired} Screenshot
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setEditingTask(t);
                            setTaskForm({
                              title: t.title,
                              platform: t.platform,
                              rewardUSD: t.rewardUSD,
                              link: t.link,
                              durationSec: t.durationSec,
                              screenshotsRequired: t.screenshotsRequired,
                              instructions: t.instructions
                            });
                          }}
                          style={{ padding: '4px 8px', background: '#00D1FF', border: 'none', borderRadius: '4px', color: '#000', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>
                          Edit
                        </button>
                        <button
                          onClick={() => setDailyTasks(dailyTasks.filter(x => x.id !== t.id))}
                          style={{ padding: '4px 8px', background: '#EF4444', border: 'none', borderRadius: '4px', color: '#FFF', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>
                          Del
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. TASK PROOFS VERIFIER */}
            {adminTab === 'proofs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {proofSubmissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748B', fontSize: '12px' }}>কোনো যাচাইকরণ পেন্ডিং নেই</div>
                ) : (
                  proofSubmissions.map(sub => (
                    <div key={sub.id} style={{ background: '#070E1E', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{sub.user}</span>
                        <span style={{ color: '#10B981', fontWeight: 'bold' }}>+${sub.rewardUSD} (৳ {(sub.rewardUSD * usdToBdtRate).toFixed(1)})</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>{sub.taskTitle}</div>

                      {sub.type === 'video' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <div>
                            <div style={{ fontSize: '10px', color: '#38BDF8', marginBottom: '2px' }}>শুরু ({sub.startTime})</div>
                            <img src={sub.startProof} alt="Start" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#38BDF8', marginBottom: '2px' }}>শেষ ({sub.endTime})</div>
                            <img src={sub.endProof} alt="End" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                          </div>
                        </div>
                      ) : (
                        <img src={sub.startProof} alt="Proof" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          onClick={() => handleApproveProof(sub)}
                          style={{ padding: '8px', background: '#10B981', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleRejectProof(sub.id)}
                          style={{ padding: '8px', background: '#EF4444', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. WITHDRAW REQUESTS */}
            {adminTab === 'withdraws' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {withdrawRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748B', fontSize: '12px' }}>কোনো উইথড্র রিকোয়েস্ট পেন্ডিং নেই</div>
                ) : (
                  withdrawRequests.map(req => (
                    <div key={req.id} style={{ background: '#070E1E', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{req.user}</span>
                        <span style={{ color: req.status === 'Approved' ? '#10B981' : '#F59E0B', fontWeight: 'bold', fontSize: '12px' }}>{req.status}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>মেথড: {req.method} ({req.account})</div>
                      <div style={{ fontSize: '13px', color: '#38BDF8', fontWeight: 'bold', margin: '4px 0 8px' }}>
                        ${req.amountUSD} ≈ ৳ {req.amountBDT} টাকা
                      </div>
                      {req.status === 'Pending' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <button
                            onClick={() => handleApproveWithdraw(req.id)}
                            style={{ padding: '8px', background: '#10B981', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                            ✅ Approve & Paid
                          </button>
                          <button
                            onClick={() => handleRejectWithdraw(req)}
                            style={{ padding: '8px', background: '#EF4444', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
                            ❌ Reject (Refund)
                          </button>
                        </div>
                      ) : (
                        <div style={{ color: '#10B981', fontSize: '11px', fontWeight: 'bold' }}>✓ Paid & Completed</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          /* ================= USER INTERFACE ================= */
          <div>
            {/* TAB 1: HOME */}
            {activeTab === 'home' && (
              <div>
                {/* Total Balance Card */}
                <div style={{
                  background: 'linear-gradient(145deg, #0F234D 0%, #09152F 100%)',
                  border: `1px solid ${borderNeon}`,
                  borderRadius: '20px',
                  padding: '20px',
                  marginBottom: '16px',
                  boxShadow: '0 8px 32px rgba(0, 209, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#94A3B8' }}>Total Balance</span>
                      <span
                        onClick={() => setShowBalance(!showBalance)}
                        style={{ cursor: 'pointer', fontSize: '15px', userSelect: 'none' }}>
                        {showBalance ? '👁️' : '🙈'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('wallet');
                        handleSelectMethod('bkash');
                        setWalletModal('cashout');
                      }}
                      style={{
                        background: 'linear-gradient(90deg, #00D1FF, #0084FF)',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '6px 18px',
                        color: '#000',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,209,255,0.4)'
                      }}>
                      Withdraw
                    </button>
                  </div>

                  <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '10px 0', letterSpacing: '-0.5px' }}>
                    {showBalance ? `$${balance.toFixed(2)}` : '••••••••'}
                  </h1>
                  <div style={{ fontSize: '12px', color: '#00D1FF', marginBottom: '8px' }}>
                    {showBalance ? `≈ ৳ ${(balance * usdToBdtRate).toLocaleString()} BDT` : '৳ •••••• BDT'}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '12px',
                    marginTop: '10px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Today Earn</div>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: primaryNeon }}>
                        {showBalance ? `$${todayEarn.toFixed(2)}` : '••••'}
                      </div>
                    </div>
                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Total Earn</div>
                      <div style={{ fontWeight: '700', fontSize: '13px' }}>
                        {showBalance ? `$${totalEarn.toFixed(2)}` : '••••'}
                      </div>
                    </div>
                    <div onClick={() => setReferralModalOpen(true)} style={{ cursor: 'pointer' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Referral 👥</div>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#10B981' }}>{referrals} Friends</div>
                    </div>
                  </div>
                </div>

                {/* 6 Quick Action Grid Buttons */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  marginBottom: '16px'
                }}>
                  {[
                    { title: 'Daily Tasks', sub: 'Complete & Earn', icon: '📋', action: () => setActiveTab('task') },
                    { title: 'Watch Ads', sub: 'Earn More', icon: '📺', action: triggerMonetagAd },
                    { title: 'Referral', sub: '৳100 Per Friend', icon: '👥', action: () => setReferralModalOpen(true) },
                    { title: 'Games', sub: 'Play & Win', icon: '🎮', action: () => setGamesModalOpen(true) },
                    { title: 'Offer Wall', sub: 'High Rewards', icon: '⭐', action: () => setActiveTab('task') },
                    { title: 'More', sub: 'Hub & Rewards', icon: '📦', action: () => setMoreModalOpen(true) }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={item.action}
                      style={{
                        background: cardBg,
                        border: `1px solid ${borderNeon}`,
                        borderRadius: '14px',
                        padding: '14px 8px',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{item.icon}</div>
                      <div style={{ fontSize: '12px', fontWeight: '700' }}>{item.title}</div>
                      <div style={{ fontSize: '9px', color: item.title === 'Watch Ads' ? '#10B981' : '#94A3B8', marginTop: '2px' }}>{item.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Single Bottom Mega Referral Banner */}
                <div
                  onClick={() => setReferralModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.28) 100%)',
                    border: '1.5px solid #F59E0B',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>🏆</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#FCD34D' }}>রেফারেল মেগা বোনাস</span>
                    </div>
                    <span style={{ background: '#F59E0B', color: '#000', fontSize: '11px', fontWeight: '900', padding: '3px 8px', borderRadius: '20px' }}>
                      +$10.00 USD
                    </span>
                  </div>

                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#FEF08A', lineHeight: '1.4' }}>
                    প্রতি রেফারে <b>৳১০০</b> এবং ১০০ জনকে রেফার করলে সাথে সাথে <b>$10 (৳{(10 * usdToBdtRate).toLocaleString()})</b> স্পেশাল ক্যাশ বোনাস!
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#CBD5E1', marginBottom: '4px' }}>
                    <span>আপনার অগ্রগতি (Milestone):</span>
                    <span><b>{qualifiedReferrals}</b> / {milestoneTarget} জন ({milestonePercent}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${milestonePercent}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #10B981)', borderRadius: '10px' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TASKS */}
            {activeTab === 'task' && (
              <div>
                {/* Watch Video Dedicated Header Banner */}
                <div 
                  onClick={() => setVideoModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #E11D48 0%, #9333EA 100%)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(225, 29, 72, 0.35)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>🎬</span>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Watch Video & Earn</h3>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>
                      YouTube, TikTok এবং Facebook ভিডিও দেখে আয় করুন
                    </p>
                  </div>
                  <div style={{
                    background: '#FFF',
                    color: '#000',
                    fontWeight: '800',
                    fontSize: '11px',
                    padding: '8px 14px',
                    borderRadius: '20px'
                  }}>
                    ওপেন করুন ›
                  </div>
                </div>

                {/* Rewarded Popup Bonus Ad Card */}
                <div
                  onClick={triggerMonetagPopupAd}
                  style={{
                    background: 'linear-gradient(90deg, #1F1D36 0%, #151426 100%)',
                    border: '1.5px dashed #A855F7',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    marginBottom: '14px'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>⭐</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#FFF' }}>পপআপ বোনাস অ্যাড দেখুন</div>
                      <div style={{ fontSize: '10px', color: '#A855F7', marginTop: '2px' }}>বোনাস পেআউট: +${calculatedUserAdReward} USD</div>
                    </div>
                  </div>
                  <span style={{ background: '#A855F7', color: '#FFF', fontSize: '10px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '14px' }}>
                    Claim Bonus
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', margin: 0, color: '#94A3B8' }}>ডেইলি টাস্ক ও সোশ্যাল মিশন</h4>
                  <span style={{ fontSize: '11px', color: '#10B981' }}>● Daily Active</span>
                </div>

                {/* Dynamic Social Tasks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dailyTasks.map(task => (
                    <div key={task.id} style={{
                      background: cardBg,
                      border: `1px solid ${borderNeon}`,
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.06)',
                          border: `1.5px solid ${borderNeon}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          padding: '6px'
                        }}>
                          <img
                            src={taskLogos[task.platform] || taskLogos.website}
                            alt={task.platform}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>

                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{task.title}</div>
                          <div style={{ fontSize: '12px', color: primaryNeon, fontWeight: '700' }}>
                            +${task.rewardUSD.toFixed(2)} USD (≈ ৳ {(task.rewardUSD * usdToBdtRate).toFixed(1)})
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          window.open(task.link, '_blank');
                          setSocialProofModal(task);
                        }}
                        disabled={task.status !== 'pending'}
                        style={{
                          background: task.status === 'completed' ? '#334155' : (task.status === 'reviewing' ? 'rgba(234, 179, 8, 0.2)' : 'linear-gradient(90deg, #00D1FF, #0066FF)'),
                          border: task.status === 'reviewing' ? '1px solid #EAB308' : 'none',
                          borderRadius: '20px',
                          padding: '8px 16px',
                          color: task.status === 'reviewing' ? '#EAB308' : (task.status === 'completed' ? '#94A3B8' : '#000'),
                          fontWeight: '700',
                          fontSize: '11px',
                          cursor: task.status !== 'pending' ? 'default' : 'pointer'
                        }}>
                        {task.status === 'completed' ? 'Done ✓' : (task.status === 'reviewing' ? 'Reviewing ⏳' : 'Start')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: WALLET */}
            {activeTab === 'wallet' && (
              <div>
                <div style={{
                  background: cardBg,
                  border: `1px solid ${borderNeon}`,
                  borderRadius: '20px',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>Total Balance</span>
                  <h1 style={{ fontSize: '36px', margin: '8px 0', color: primaryNeon }}>
                    ${balance.toFixed(2)}
                  </h1>
                  <div style={{
                    display: 'inline-block',
                    background: 'rgba(0, 209, 255, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    color: '#38BDF8',
                    fontSize: '12px',
                    marginBottom: '16px'
                  }}>
                    1 USD = {usdToBdtRate} BDT • ৳ {(balance * usdToBdtRate).toLocaleString()} টাকা
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={() => {
                        handleSelectMethod('bkash');
                        setWalletModal('cashout');
                      }}
                      style={{
                        background: 'linear-gradient(90deg, #00D1FF, #0084FF)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#000',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}>
                      Cash Out
                    </button>
                    <button
                      onClick={() => setWalletModal('historyFilter')}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${borderNeon}`,
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#FFF',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}>
                      Filter History
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredTransactions.map((tx, idx) => (
                    <div key={idx} style={{
                      background: cardBg,
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{tx.type}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{tx.date}</div>
                      </div>
                      <div style={{
                        fontWeight: '700',
                        fontSize: '14px',
                        color: tx.positive ? '#10B981' : '#EF4444'
                      }}>
                        {tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PROFILE */}
            {activeTab === 'profile' && (
              <div>
                <div style={{
                  background: cardBg,
                  border: `1px solid ${borderNeon}`,
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00D1FF, #0055FF)',
                    margin: '0 auto 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    fontWeight: 'bold',
                    border: '2px solid #00D1FF',
                    overflow: 'hidden',
                    boxShadow: '0 0 15px rgba(0, 209, 255, 0.4)'
                  }}>
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      'FA'
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '17px' }}>{currentUser.name}</h3>
                    {kycStatus === 'Verified' && (
                      <span style={{ color: '#00D1FF', fontSize: '14px' }}>✓</span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>@{currentUser.username} • VIP Member</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div onClick={() => { setEditName(currentUser.name); setEditUsername(currentUser.username); setEditAvatar(currentUser.avatar); setProfileModal('editProfile'); }} style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>✏️</span><span style={{ fontSize: '14px' }}>Edit Profile</span></div>
                    <span style={{ color: '#94A3B8' }}>›</span>
                  </div>

                  <div onClick={() => { setEditBkash(paymentMethods.bkash); setEditNagad(paymentMethods.nagad); setEditRocket(paymentMethods.rocket); setProfileModal('paymentSettings'); }} style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>💳</span><span style={{ fontSize: '14px' }}>Payment Settings</span></div>
                    <span style={{ color: '#94A3B8' }}>›</span>
                  </div>

                  <div onClick={() => setProfileModal('kyc')} style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>🆔</span><span style={{ fontSize: '14px' }}>KYC Verification</span></div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px', background: kycStatus === 'Verified' ? 'rgba(0, 209, 255, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: kycStatus === 'Verified' ? '#00D1FF' : '#EF4444' }}>
                      {kycStatus}
                    </span>
                  </div>

                  <div onClick={() => setProfileModal('support')} style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>🎧</span><span style={{ fontSize: '14px' }}>Support & Help</span></div>
                    <span style={{ color: '#94A3B8' }}>›</span>
                  </div>

                  <div onClick={() => setProfileModal('terms')} style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span>📜</span><span style={{ fontSize: '14px' }}>Terms & Conditions</span></div>
                    <span style={{ color: '#94A3B8' }}>›</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ================= MODAL: MORE HUB ================= */}
      {moreModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(8px)',
          zIndex: 350,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#0B1B3B',
            border: `1px solid ${borderNeon}`,
            borderRadius: '20px',
            width: '100%',
            maxWidth: '380px',
            padding: '20px',
            position: 'relative'
          }}>
            <button
              onClick={() => setMoreModalOpen(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>
              ✖
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '22px' }}>📦</span>
              <h3 style={{ margin: 0, color: primaryNeon, fontSize: '18px' }}>More Features & Explore</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { title: 'Leaderboard', desc: 'সেরা আর্নারদের তালিকা দেখুন', icon: '🥇' },
                { title: 'Lucky Spin Wheel', desc: 'প্রতিদিন ফ্রি স্পিন করে বোনাস জিতুন', icon: '🎡' },
                { title: 'VIP Membership', desc: 'ডাবল ইনকাম সুবিধা আনলক করুন', icon: '👑' },
                { title: 'Platform Rules & Safety', desc: 'আইডি নিরাপদ রাখার নির্দেশিকা', icon: '🛡️' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => alert(`${item.title} শীঘ্রই যুক্ত হচ্ছে!`)}
                  style={{
                    background: cardBg,
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.title}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>{item.desc}</div>
                    </div>
                  </div>
                  <span style={{ color: '#94A3B8' }}>›</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORIGINAL REFERRAL HUB ================= */}
      {referralModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(8px)',
          zIndex: 350,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#0B1B3B',
            border: `1px solid ${borderNeon}`,
            borderRadius: '20px',
            width: '100%',
            maxWidth: '390px',
            padding: '20px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => setReferralModalOpen(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>
              ✖
            </button>

            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '36px', marginBottom: '2px' }}>🎁</div>
              <h3 style={{ margin: 0, fontSize: '18px', color: primaryNeon }}>রেফার করুন ও ৳ ১০০ জিতুন</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94A3B8' }}>
                বন্ধু জয়েন করে <b style={{ color: '#10B981' }}>$10 উইথড্র</b> করলেই পাবেন <b style={{ color: '#10B981' }}>৳ ১০০</b>
              </p>
            </div>

            {/* 100 Referral Milestone Bonus Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
              border: '1px solid #F59E0B',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#FCD34D' }}>🏆 ১০০ জন রেফার স্পেশাল বোনাস</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#10B981' }}>+$10.00 USD</span>
              </div>
              <div style={{ fontSize: '11px', color: '#E2E8F0', lineHeight: '1.4', marginBottom: '8px' }}>
                ১০০ জন সফল রেফারেল সম্পন্ন হলে অতিরিক্ত <b style={{ color: '#FCD34D' }}>$10 বোনাস (৳{(10 * usdToBdtRate).toLocaleString()})</b> সরাসরি অ্যাকাউন্টে দেওয়া হবে!
              </div>

              {/* Progress Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8', marginBottom: '3px' }}>
                <span>অগ্রগতি (Progress):</span>
                <span>{qualifiedReferrals} / {milestoneTarget} বন্ধু ({milestonePercent}%)</span>
              </div>
              <div style={{ width: '100%', height: '7px', background: '#070E1E', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${milestonePercent}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #10B981)', borderRadius: '10px' }}></div>
              </div>
            </div>

            {/* Referral Link Box */}
            <div style={{
              background: '#070E1E',
              border: `1px dashed ${primaryNeon}`,
              borderRadius: '12px',
              padding: '10px 12px',
              marginBottom: '14px'
            }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '6px' }}>আপনার রেফারেল লিংক:</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={`https://t.me/FAAgencyEarnBot?start=${currentUser.referralCode}`}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', color: '#FFF', fontSize: '11px' }}
                />
                <button
                  onClick={copyReferralLink}
                  style={{ background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '8px', padding: '8px 14px', color: '#000', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                  Copy
                </button>
              </div>
            </div>

            {/* Referral Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: cardBg, padding: '10px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${borderNeon}` }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>মোট রেফার্ড</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: primaryNeon, marginTop: '2px' }}>{referralList.length} জন</div>
              </div>
              <div style={{ background: cardBg, padding: '10px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${borderNeon}` }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>বোনাস প্রাপ্ত</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10B981', marginTop: '2px' }}>৳ ২০০ BDT</div>
              </div>
            </div>

            {/* Friends Tracking List */}
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#CBD5E1', marginBottom: '8px' }}>
              বন্ধুদের তালিকা ও লাইভ স্ট্যাটাস:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {referralList.map(friend => (
                <div key={friend.id} style={{
                  background: 'rgba(15, 30, 65, 0.7)',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{friend.name}</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8' }}>উইথড্র: ${friend.totalWithdrawn}.00</div>
                  </div>
                  <div style={{
                    fontSize: '9px',
                    fontWeight: 'bold',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    background: friend.bonusPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.15)',
                    color: friend.bonusPaid ? '#10B981' : '#EAB308'
                  }}>
                    {friend.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORIGINAL KYC FOLDER-STYLE ================= */}
      {profileModal === 'kyc' && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(8px)',
          zIndex: 350,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#0B1B3B',
            border: `1px solid ${borderNeon}`,
            borderRadius: '20px',
            width: '100%',
            maxWidth: '390px',
            padding: '20px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => setProfileModal(null)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>
              ✖
            </button>

            <h3 style={{ margin: '0 0 12px', fontSize: '18px', color: primaryNeon }}>KYC Verification</h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#94A3B8' }}>National ID (NID) নম্বর</label>
              <input
                type="text"
                placeholder="NID নম্বর লিখুন"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginTop: '4px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Folder 1: NID Front */}
            <div style={{
              background: '#070E1E',
              border: '1px dashed #38BDF8',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#38BDF8', marginBottom: '4px' }}>১. NID সামনের সাইড</div>
              <input type="file" accept="image/*" onChange={(e) => setNidFront(e.target.files[0])} style={{ fontSize: '11px', color: '#94A3B8' }} />
            </div>

            {/* Folder 2: NID Back */}
            <div style={{
              background: '#070E1E',
              border: '1px dashed #38BDF8',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#38BDF8', marginBottom: '4px' }}>২. NID পিছনের সাইড</div>
              <input type="file" accept="image/*" onChange={(e) => setNidBack(e.target.files[0])} style={{ fontSize: '11px', color: '#94A3B8' }} />
            </div>

            {/* Folder 3: Selfie */}
            <div style={{
              background: '#070E1E',
              border: '1px dashed #10B981',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10B981', marginBottom: '4px' }}>৩. নিজের স্পষ্ট সেলফি</div>
              <input type="file" accept="image/*" onChange={(e) => setUserSelfie(e.target.files[0])} style={{ fontSize: '11px', color: '#94A3B8' }} />
            </div>

            <button
              onClick={handleKycSubmit}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
              Submit to Admin
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: LIVE GAME HUB ================= */}
      {gamesModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 400, display: 'flex', flexDirection: 'column', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: primaryNeon, fontSize: '18px' }}>🎮 Live Game Hub</h3>
            <button onClick={() => { setGamesModalOpen(false); setSelectedGameUrl(''); }} style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '20px', cursor: 'pointer' }}>✖</button>
          </div>

          {!selectedGameUrl ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { name: 'Flappy Dunk', icon: '🏀', url: 'https://games.construct.net/1034/latest' },
                { name: 'Subway Runner', icon: '🏃', url: 'https://games.construct.net/1083/latest' },
                { name: 'Tower Builder', icon: '🏗️', url: 'https://games.construct.net/1004/latest' },
                { name: 'Knife Hit 3D', icon: '🔪', url: 'https://games.construct.net/1018/latest' }
              ].map((g, i) => (
                <div key={i} onClick={() => setSelectedGameUrl(g.url)} style={{ background: cardBg, border: `1px solid ${borderNeon}`, borderRadius: '14px', padding: '16px 12px', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: '32px', marginBottom: '6px' }}>{g.icon}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{g.name}</div>
                  <div style={{ marginTop: '8px', fontSize: '10px', color: '#10B981', fontWeight: 'bold', background: 'rgba(16,185,129,0.15)', padding: '4px 8px', borderRadius: '6px' }}>Play & Earn</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <iframe src={selectedGameUrl} title="HTML5 Game" style={{ width: '100%', flex: 1, border: `1px solid ${borderNeon}`, borderRadius: '12px', background: '#000' }} />
              <button
                onClick={() => {
                  setBalance(b => b + 0.05);
                  setTodayEarn(e => e + 0.05);
                  setTotalEarn(t => t + 0.05);
                  setGamesModalOpen(false);
                  setSelectedGameUrl('');
                  alert('অভিনন্দন! গেম খেলার রিওয়ার্ড +$0.05 USD আপনার ওয়ালেটে যোগ হয়েছে!');
                }}
                style={{ marginTop: '10px', padding: '12px', background: 'linear-gradient(90deg, #10B981, #059669)', border: 'none', borderRadius: '10px', color: '#FFF', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                🎁 Claim Game Reward (+$0.05 USD)
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: WATCH VIDEO HUB ================= */}
      {videoModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '20px', width: '100%', maxWidth: '390px', padding: '20px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setVideoModalOpen(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>✖</button>
            <h3 style={{ margin: '0 0 6px', color: primaryNeon }}>🎬 Watch Video & Earn</h3>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 14px' }}>ভিডিও দেখে শুরুর ও শেষের ২টি স্ক্রিনশট জমা দিন:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {videoTasks.map(video => (
                <div key={video.id} style={{ background: 'rgba(15, 30, 65, 0.8)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{video.title}</div>
                    <div style={{ fontSize: '11px', color: '#38BDF8' }}>দৈর্ঘ্য: {video.duration} • <b style={{ color: '#10B981' }}>+${video.rewardUSD}</b></div>
                  </div>
                  <button
                    onClick={() => { window.open(video.link, '_blank'); setVideoProofModal(video); }}
                    disabled={video.status !== 'pending'}
                    style={{
                      background: video.status === 'reviewing' ? 'rgba(234, 179, 8, 0.2)' : 'linear-gradient(90deg, #E11D48, #F43F5E)',
                      border: video.status === 'reviewing' ? '1px solid #EAB308' : 'none',
                      color: video.status === 'reviewing' ? '#EAB308' : '#FFF',
                      borderRadius: '16px',
                      padding: '8px 14px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: video.status === 'pending' ? 'pointer' : 'default'
                    }}>
                    {video.status === 'reviewing' ? 'Reviewing ⏳' : 'Watch ▶'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SOCIAL PROOF ================= */}
      {socialProofModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setSocialProofModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>✖</button>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: primaryNeon }}>📸 টাস্ক প্রুফ আপলোড</h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>{socialProofModal.title}</p>
            <div style={{ background: '#070E1E', padding: '10px', borderRadius: '8px', fontSize: '11px', color: '#FCD34D', marginBottom: '12px' }}>
              💡 নির্দেশিকা: {socialProofModal.instructions}
            </div>
            <input type="file" accept="image/*" onChange={(e) => setProofImage1(URL.createObjectURL(e.target.files[0]))} style={{ marginBottom: '14px' }} />
            <button onClick={handleSubmitSocialProof} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
              সাবমিট করুন
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIDEO PROOF ================= */}
      {videoProofModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '16px', width: '100%', maxWidth: '390px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setVideoProofModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>✖</button>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: primaryNeon }}>⏱️ ভিডিওর ২টি স্ক্রিনশট</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: '#38BDF8' }}>১. ভিডিও শুরুর ঘড়ির সময়সহ স্ক্রিনশট:</label>
              <input type="file" accept="image/*" onChange={(e) => setProofImage1(URL.createObjectURL(e.target.files[0]))} style={{ marginTop: '4px' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: '#10B981' }}>২. ভিডিও শেষের ঘড়ির সময়সহ স্ক্রিনশট:</label>
              <input type="file" accept="image/*" onChange={(e) => setProofImage2(URL.createObjectURL(e.target.files[0]))} style={{ marginTop: '4px' }} />
            </div>
            <button onClick={handleSubmitVideoProof} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #10B981, #059669)', border: 'none', borderRadius: '10px', color: '#FFF', fontWeight: 'bold', cursor: 'pointer' }}>
              উভয় প্রুফ জমা দিন
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: CASH OUT ================= */}
      {walletModal === 'cashout' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '18px', width: '100%', maxWidth: '390px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setWalletModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px' }}>✖</button>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: primaryNeon }}>উইথড্র / Cash Out</h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#94A3B8' }}>মেথড ও স্লট নির্বাচন করুন (মিনিমাম $10):</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              {[
                { id: 'bkash', name: 'বিকাশ', logo: bkashLogo },
                { id: 'nagad', name: 'নগদ', logo: nagadLogo },
                { id: 'rocket', name: 'রকেট', logo: rocketLogo }
              ].map(method => (
                <div
                  key={method.id}
                  onClick={() => handleSelectMethod(method.id)}
                  style={{
                    background: selectedMethod === method.id ? 'rgba(255,255,255,0.1)' : 'rgba(15,30,65,0.6)',
                    border: `2px solid ${selectedMethod === method.id ? '#00D1FF' : 'transparent'}`,
                    borderRadius: '12px',
                    padding: '10px 6px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    margin: '0 auto 6px',
                    borderRadius: '50%',
                    background: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '4px'
                  }}>
                    <img src={method.logo} alt={method.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{method.name}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#94A3B8' }}>অ্যাকাউন্ট নম্বর:</label>
              <input
                type="text"
                value={targetAccount}
                onChange={(e) => setTargetAccount(e.target.value)}
                placeholder="01XXXXXXXXX"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginTop: '4px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#94A3B8' }}>উইথড্র স্লট (USD):</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginTop: '6px' }}>
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setWithdrawAmount(slot)}
                    style={{
                      padding: '8px 0',
                      borderRadius: '8px',
                      border: withdrawAmount === slot ? '1px solid #00D1FF' : '1px solid #334155',
                      background: withdrawAmount === slot ? 'rgba(0, 209, 255, 0.2)' : '#070E1E',
                      color: withdrawAmount === slot ? '#00D1FF' : '#FFF',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>
                    ${slot}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              background: '#070E1E',
              border: '1px dashed #334155',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#10B981', fontWeight: 'bold' }}>আপনি পাবেন (BDT):</span>
                <span style={{ color: '#10B981', fontWeight: 'bold' }}>৳ {(withdrawAmount * usdToBdtRate).toLocaleString()} টাকা</span>
              </div>
            </div>

            <button
              onClick={handleProcessCashout}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(90deg, #00D1FF, #0084FF)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontWeight: '800',
                cursor: 'pointer'
              }}>
              Confirm Cash Out
            </button>
          </div>
        </div>
      )}

      {/* ================= WALLET MODAL: HISTORY FILTER ================= */}
      {walletModal === 'historyFilter' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '16px', width: '100%', maxWidth: '350px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px', color: primaryNeon }}>হিস্ট্রি ফিল্টার করুন</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'all', label: 'সব লেনদেন (All)' },
                { id: 'earn', label: 'শুধুমাত্র আয় (Earnings)' },
                { id: 'withdraw', label: 'শুধুমাত্র উইথড্র (Cash Out)' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => { setHistoryFilter(f.id); setWalletModal(null); }}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: historyFilter === f.id ? 'rgba(0,209,255,0.2)' : '#070E1E', color: historyFilter === f.id ? primaryNeon : '#FFF', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= PROFILE MODALS ================= */}
      {profileModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '16px', width: '100%', maxWidth: '390px', padding: '20px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setProfileModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>✖</button>

            {/* 1. EDIT PROFILE */}
            {profileModal === 'editProfile' && (
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: '17px', color: primaryNeon }}>Edit Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#070E1E', border: '2px solid #00D1FF', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    {editAvatar ? <img src={editAvatar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                  </div>
                  <label style={{ background: 'rgba(0, 209, 255, 0.1)', border: '1px solid #00D1FF', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', color: '#00D1FF', cursor: 'pointer' }}>
                    📷 Upload Photo
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '10px', boxSizing: 'border-box' }} />
                <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '16px', boxSizing: 'border-box' }} />
                <button onClick={() => { setCurrentUser({ ...currentUser, name: editName, username: editUsername, avatar: editAvatar }); setProfileModal(null); }} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: '700', cursor: 'pointer' }}>
                  Save Changes
                </button>
              </div>
            )}

            {/* 2. PAYMENT SETTINGS */}
            {profileModal === 'paymentSettings' && (
              <div>
                <h3 style={{ margin: '0 0 14px', fontSize: '17px', color: primaryNeon }}>Payment Settings</h3>
                <input type="text" placeholder="বিকাশ নম্বর" value={editBkash} onChange={(e) => setEditBkash(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '10px', boxSizing: 'border-box' }} />
                <input type="text" placeholder="নগদ নম্বর" value={editNagad} onChange={(e) => setEditNagad(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '10px', boxSizing: 'border-box' }} />
                <input type="text" placeholder="রকেট নম্বর" value={editRocket} onChange={(e) => setEditRocket(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '16px', boxSizing: 'border-box' }} />
                <button onClick={() => { setPaymentMethods({ bkash: editBkash, nagad: editNagad, rocket: editRocket }); setProfileModal(null); }} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: '700', cursor: 'pointer' }}>
                  Save Accounts
                </button>
              </div>
            )}

            {/* 3. SUPPORT & HELP */}
            {profileModal === 'support' && (
              <div>
                <h3 style={{ margin: '0 0 12px', fontSize: '17px', color: primaryNeon }}>Support & Help</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href="https://t.me/fa_agency_support_bot" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: 'linear-gradient(90deg, #0088CC, #00A3FF)', borderRadius: '10px', color: '#FFF', textDecoration: 'none', fontWeight: 'bold' }}>
                    🤖 টেলিগ্রাম সাপোর্ট বট
                  </a>
                  <a href="mailto:support@faagencyearn.com" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#1E293B', border: '1px solid #38BDF8', borderRadius: '10px', color: '#38BDF8', textDecoration: 'none', fontWeight: 'bold' }}>
                    ✉️ অফিসিয়াল ইমেইল
                  </a>
                </div>
              </div>
            )}

            {/* 4. TERMS & CONDITIONS */}
            {profileModal === 'terms' && (
              <div>
                <h3 style={{ margin: '0 0 14px', fontSize: '17px', color: primaryNeon }}>Terms & Conditions</h3>
                <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.6', maxHeight: '240px', overflowY: 'auto' }}>
                  <p><b>১. কাজের নিয়মাবলী:</b> সঠিক নিয়মে টাস্ক ও ভিডিও সম্পন্ন করে আসল প্রমাণপত্র প্রদান করতে হবে।</p>
                  <p><b>২. উত্তোলন নীতি:</b> সর্বনিম্ন উত্তোলন $10 এবং $10-এর গুণিতক স্লটে উত্তোলনযোগ্য। অ্যাকাউন্টে কমপক্ষে $1 বাধ্যতামূলক থাকতে হবে।</p>
                  <p style={{ color: '#FACC15' }}>
                    <b>৩. রেফারেল বোনাস নীতি:</b> প্রতি সফল রেফারে ১০০ টাকা বোনাস প্রযোজ্য। তবে রেফার্ড বন্ধুকে বাধ্যতামূলকভাবে প্ল্যাটফর্ম থেকে সর্বনিম্ন $10 উইথড্র করতে হবে।
                  </p>
                  <p style={{ color: '#38BDF8' }}>
                    <b>৪. স্পেশাল রেফারেল রিওয়ার্ড ($10):</b> কোনো ব্যবহারকারী ১০০ জন সক্রিয় বন্ধুকে রেফার করলে এবং সেই ১০০ জন সদস্য প্রত্যেকে সর্বনিম্ন $10 উইথড্র সম্পন্ন করলে, রেফারারকে প্ল্যাটফর্মের পক্ষ থেকে এককালীন অতিরিক্ত $10 (৳{(10 * usdToBdtRate).toLocaleString()}) স্পেশাল ক্যাশ বোনাস দেওয়া হবে।
                  </p>
                  <p><b>৫. KYC ভেরিফিকেশন:</b> ব্লু-টিক পেতে আসল NID ও সেলফি দেওয়া বাধ্যতামূলক।</p>
                </div>
                <button onClick={() => setProfileModal(null)} style={{ width: '100%', padding: '10px', background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#FFF', cursor: 'pointer', marginTop: '14px' }}>
                  সম্মতি জানাচ্ছি
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        maxWidth: '430px',
        margin: '0 auto',
        height: '65px',
        backgroundColor: 'rgba(7, 14, 30, 0.95)',
        borderTop: `1px solid ${borderNeon}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
        zIndex: 100
      }}>
        {[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'task', label: 'Task', icon: '📋' },
          { id: 'wallet', label: 'Wallet', icon: '💳' },
          { id: 'profile', label: 'Profile', icon: '👤' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsAdminView(false); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                color: isActive && !isAdminView ? primaryNeon : '#64748B',
                transition: 'all 0.2s'
              }}>
              <span style={{ fontSize: '18px', filter: isActive && !isAdminView ? 'drop-shadow(0 0 8px #00D1FF)' : 'none' }}>
                {tab.icon}
              </span>
              <span style={{ fontSize: '11px', fontWeight: isActive && !isAdminView ? '700' : '500' }}>
                {tab.label}
              </span>
            </div>
          );
        })}
      </nav>

    </div>
  );
}
