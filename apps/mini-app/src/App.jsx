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
  const [adminTab, setAdminTab] = useState('settings');

  // Dynamic Dollar to BDT Rate
  const [usdToBdtRate, setUsdToBdtRate] = useState(() => {
    return parseFloat(localStorage.getItem('fa_rate')) || 120;
  });

  const [adIntervalMinutes, setAdIntervalMinutes] = useState(5);

  // REAL PRODUCTION FINANCIAL STATES (FRESH ZERO START)
  const [balance, setBalance] = useState(() => {
    return parseFloat(localStorage.getItem('fa_user_balance')) || 0.00;
  });
  const [todayEarn, setTodayEarn] = useState(() => {
    return parseFloat(localStorage.getItem('fa_today_earn')) || 0.00;
  });
  const [totalEarn, setTotalEarn] = useState(() => {
    return parseFloat(localStorage.getItem('fa_total_earn')) || 0.00;
  });
  const [referrals, setReferrals] = useState(() => {
    return parseInt(localStorage.getItem('fa_user_ref_count')) || 0;
  });

  const [showBalance, setShowBalance] = useState(true);

  // Sync Financials to Storage
  useEffect(() => {
    localStorage.setItem('fa_user_balance', balance.toString());
    localStorage.setItem('fa_today_earn', todayEarn.toString());
    localStorage.setItem('fa_total_earn', totalEarn.toString());
    localStorage.setItem('fa_user_ref_count', referrals.toString());
    localStorage.setItem('fa_rate', usdToBdtRate.toString());
  }, [balance, todayEarn, totalEarn, referrals, usdToBdtRate]);

  // Real Telegram User Detection
  const [currentUser, setCurrentUser] = useState({
    id: "guest",
    name: "User",
    username: "",
    avatar: null,
    referralCode: "FA" + Math.floor(1000 + Math.random() * 9000)
  });

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser) {
        setCurrentUser({
          id: String(tgUser.id),
          name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || 'User',
          username: tgUser.username || '',
          avatar: tgUser.photo_url || null,
          referralCode: "FA" + tgUser.id.toString().slice(-4)
        });
      }
    }
  }, []);

  const isSuperAdmin = String(currentUser.id) === SUPER_ADMIN_ID || currentUser.username === SUPER_ADMIN_USERNAME;

  // Controlled Monetag In-App Interstitial
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
            timeout: 10,
            everyPage: false
          }
        });
      }
    } catch (err) {
      console.error('Monetag In-App error:', err);
    }
  }, [adIntervalMinutes]);

  // Real Tasks List
  const [dailyTasks, setDailyTasks] = useState([
    {
      id: 1,
      title: 'Join Official Telegram Channel',
      platform: 'telegram',
      rewardUSD: 0.10,
      link: 'https://t.me/fa_agency_official',
      durationSec: 30,
      screenshotsRequired: 1,
      instructions: 'অফিসিয়াল টেলিগ্রাম চ্যানেলে যুক্ত হয়ে একটি স্পষ্ট স্ক্রিনশট দিন।',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Follow Official Facebook Page',
      platform: 'facebook',
      rewardUSD: 0.15,
      link: 'https://facebook.com/',
      durationSec: 30,
      screenshotsRequired: 1,
      instructions: 'পেজে ফলো ও লাইক দিয়ে স্ক্রিনশট তুলে জমা দিন।',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Subscribe YouTube Channel & Bell',
      platform: 'youtube',
      rewardUSD: 0.20,
      link: 'https://youtube.com/',
      durationSec: 60,
      screenshotsRequired: 1,
      instructions: 'ইউটিউব চ্যানেল সাবস্ক্রাইব করে বেল আইকন চালু করা অবস্থায় স্ক্রিনশট দিন।',
      status: 'pending'
    }
  ]);

  // Video Earning Hub
  const [videoTasks, setVideoTasks] = useState([
    { id: 201, title: 'Watch YouTube Official Video (5 Min)', platform: 'youtube', rewardUSD: 0.30, link: 'https://youtube.com/', duration: '5 Min', durationSec: 300, status: 'pending' },
    { id: 202, title: 'Watch TikTok Viral Video (1 Min)', platform: 'tiktok', rewardUSD: 0.15, link: 'https://tiktok.com/', duration: '1 Min', durationSec: 60, status: 'pending' }
  ]);

  // Admin Task Form
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

  // Real Submissions & Requests (Zero initially)
  const [proofSubmissions, setProofSubmissions] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [referralList, setReferralList] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Monetag Profit Margin
  const [monetagConfig, setMonetagConfig] = useState({
    zoneId: '11756404',
    rawApiPayout: 0.05,
    adminProfitMargin: 40
  });

  const calculatedUserAdReward = parseFloat(
    (monetagConfig.rawApiPayout * (1 - monetagConfig.adminProfitMargin / 100)).toFixed(3)
  );

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

  // Saved Payment Methods
  const [paymentMethods, setPaymentMethods] = useState({ bkash: '', nagad: '', rocket: '' });
  const [kycStatus, setKycStatus] = useState('Unverified');
  const [nidNumber, setNidNumber] = useState('');
  const [nidFront, setNidFront] = useState(null);
  const [nidBack, setNidBack] = useState(null);
  const [userSelfie, setUserSelfie] = useState(null);

  // Cashout
  const [selectedMethod, setSelectedMethod] = useState('bkash');
  const [withdrawAmount, setWithdrawAmount] = useState(10);
  const [targetAccount, setTargetAccount] = useState('');

  // Temp states
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBkash, setEditBkash] = useState('');
  const [editNagad, setEditNagad] = useState('');
  const [editRocket, setEditRocket] = useState('');

  const primaryNeon = '#00D1FF';
  const bgDark = '#070E1E';
  const cardBg = 'rgba(15, 30, 65, 0.65)';
  const borderNeon = 'rgba(0, 209, 255, 0.2)';
  const availableSlots = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  const qualifiedReferrals = referralList.filter(f => f.bonusPaid).length;
  const milestoneTarget = 100;
  const milestonePercent = Math.min(100, Math.round((qualifiedReferrals / milestoneTarget) * 100));

  // Monetag Ad Actions
  const triggerMonetagAd = () => {
    if (typeof window.show_11756404 === 'function') {
      window.show_11756404().then(() => addAdBonus('Monetag Video Ad')).catch(() => fallbackAd('Video'));
    } else {
      fallbackAd('Video');
    }
  };

  const triggerMonetagPopupAd = () => {
    if (typeof window.show_11756404 === 'function') {
      window.show_11756404('pop').then(() => addAdBonus('Monetag Popup Offer')).catch(() => fallbackAd('Popup'));
    } else {
      fallbackAd('Popup');
    }
  };

  const fallbackAd = (type) => {
    const ok = window.confirm(`[Monetag ${type} Ad]\nবিজ্ঞাপন দেখা সম্পন্ন হয়েছে?\n\nমার্জিন কেটে ব্যালেন্সে $${calculatedUserAdReward} যোগ হবে।`);
    if (ok) addAdBonus(`Monetag ${type} Ad`);
  };

  const addAdBonus = (label) => {
    setBalance(b => parseFloat((b + calculatedUserAdReward).toFixed(3)));
    setTodayEarn(e => parseFloat((e + calculatedUserAdReward).toFixed(3)));
    setTotalEarn(t => parseFloat((t + calculatedUserAdReward).toFixed(3)));
    setTransactions(prev => [{
      type: label,
      date: 'Just now',
      amount: `+$${calculatedUserAdReward}`,
      positive: true,
      category: 'earn'
    }, ...prev]);
    alert(`বিজ্ঞাপন দেখার জন্য +$${calculatedUserAdReward} USD জমা হয়েছে!`);
  };

  // Withdraw Approve / Reject
  const handleApproveWithdraw = (reqId) => {
    setWithdrawRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Approved' } : r));
    alert('উইথড্র আবেদনটি অ্যাপ্রুভ ও পেইড হিসেবে চিহ্নিত করা হয়েছে।');
  };

  const handleRejectWithdraw = (req) => {
    setBalance(b => parseFloat((b + req.amountUSD).toFixed(2)));
    setWithdrawRequests(prev => prev.filter(r => r.id !== req.id));
    alert(`উইথড্র বাতিল করা হয়েছে এবং $${req.amountUSD} ব্যবহারকারীর ব্যালেন্সে রিফান্ড করা হয়েছে।`);
  };

  // Proof Approvals
  const handleApproveProof = (sub) => {
    setBalance(b => parseFloat((b + sub.rewardUSD).toFixed(2)));
    setTodayEarn(e => parseFloat((e + sub.rewardUSD).toFixed(2)));
    setTotalEarn(t => parseFloat((t + sub.rewardUSD).toFixed(2)));
    setProofSubmissions(prev => prev.filter(p => p.id !== sub.id));
    setTransactions(prev => [{
      type: `Task Reward: ${sub.taskTitle}`,
      date: 'Just now',
      amount: `+$${sub.rewardUSD.toFixed(2)}`,
      positive: true,
      category: 'earn'
    }, ...prev]);
    alert(`টাস্ক অনুমোদিত হয়েছে! $${sub.rewardUSD.toFixed(2)} ব্যালেন্সে যুক্ত হয়েছে।`);
  };

  const handleRejectProof = (subId) => {
    setProofSubmissions(prev => prev.filter(p => p.id !== subId));
    alert('টাস্ক প্রুফটি বাতিল করা হয়েছে।');
  };

  // Save Task
  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.link) return alert('শিরোনাম ও লিংক প্রদান করুন!');

    if (editingTask) {
      setDailyTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskForm } : t));
      alert('টাস্ক আপডেট করা হয়েছে!');
    } else {
      setDailyTasks([{ id: Date.now(), ...taskForm, status: 'pending' }, ...dailyTasks]);
      alert('নতুন টাস্ক যুক্ত করা হয়েছে!');
    }

    setEditingTask(null);
    setTaskForm({ title: '', platform: 'telegram', rewardUSD: 0.10, link: '', durationSec: 30, screenshotsRequired: 1, instructions: '' });
  };

  const copyReferralLink = () => {
    const link = `https://t.me/FAAgencyEarnOfficialBot?start=${currentUser.referralCode}`;
    navigator.clipboard.writeText(link);
    alert(`রেফারেল লিংক কপি হয়েছে!\n${link}`);
  };

  const handleSelectMethod = (m) => {
    setSelectedMethod(m);
    if (m === 'bkash') setTargetAccount(paymentMethods.bkash);
    if (m === 'nagad') setTargetAccount(paymentMethods.nagad);
    if (m === 'rocket') setTargetAccount(paymentMethods.rocket);
  };

  const handleKycSubmit = () => {
    if (!nidNumber || !nidFront || !nidBack || !userSelfie) {
      return alert('NID নম্বর, সামনের সাইড, পিছনের সাইড ও নিজের সেলফি দিন!');
    }
    setKycStatus('Pending');
    setProfileModal(null);
    alert('KYC সাবমিট হয়েছে! অ্যাডমিন যাচাই করে ব্লু-টিক ব্যাজ প্রদান করবেন।');
  };

  const handleProcessCashout = () => {
    if (!targetAccount) return alert('অ্যাকাউন্ট নম্বর দিন!');
    if (withdrawAmount < 10 || withdrawAmount % 10 !== 0) return alert('উইথড্র সর্বনিম্ন $10 হতে হবে এবং $10-এর গুণিতক স্লটে তুলতে হবে!');
    if (balance - withdrawAmount < 1.0) return alert('পর্যাপ্ত ব্যালেন্স নেই! অ্যাকাউন্টে অন্তত $1.00 অবশিষ্ট থাকতে হবে।');

    const bdtEquivalent = withdrawAmount * usdToBdtRate;
    setBalance(prev => parseFloat((prev - withdrawAmount).toFixed(2)));

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
    alert(`উইথড্র রিকোয়েস্ট সফল হয়েছে!\nউত্তোলিত ডলার: $${withdrawAmount}\nটাকা: ৳ ${bdtEquivalent.toLocaleString()}`);
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
    alert('প্রমাণপত্র জমা হয়েছে! অ্যাডমিন যাচাই করে ব্যালেন্সে ডলার যুক্ত করবেন।');
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
    alert('ভিডিওর ২টি স্ক্রিনশট জমা হয়েছে! অ্যাডমিন যাচাই করে অ্যাপ্রুভ করবেন।');
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
          {/* Admin Control - ONLY visible to Super Admin */}
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
              {isAdminView ? 'Exit Admin' : '⚡ Admin'}
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

        {/* ================= ADMIN VIEW ================= */}
        {isAdminView ? (
          <div>
            <div style={{ background: '#1E293B', padding: '14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #F59E0B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 2px', color: '#FCD34D', fontSize: '16px' }}>👑 সুপার অ্যাডমিন প্যানেল</h3>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>@{currentUser.username} ({currentUser.id})</span>
                </div>
                <span style={{ background: '#10B981', color: '#000', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px' }}>LIVE</span>
              </div>
            </div>

            {/* Sub Navigation */}
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

            {/* 1. SETTINGS & RATE */}
            {adminTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${borderNeon}` }}>
                  <h4 style={{ margin: '0 0 8px', color: '#38BDF8', fontSize: '14px' }}>⏱️ ইন-অ্যাপ অ্যাড বিরতি (Ad Interval)</h4>
                  <select
                    value={adIntervalMinutes}
                    onChange={(e) => setAdIntervalMinutes(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', background: '#070E1E', border: '1px solid #38BDF8', color: '#38BDF8', fontSize: '13px', fontWeight: 'bold', borderRadius: '8px' }}>
                    <option value={1}>১ মিনিট পর পর</option>
                    <option value={5}>৫ মিনিট পর পর (Standard)</option>
                    <option value={10}>১০ মিনিট পর পর</option>
                    <option value={15}>১৫ মিনিট পর পর</option>
                  </select>
                </div>

                <div style={{ background: cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${borderNeon}` }}>
                  <h4 style={{ margin: '0 0 8px', color: '#10B981', fontSize: '14px' }}>💵 ডলার এক্সচেঞ্জ রেট (USD to BDT)</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>1 USD =</span>
                    <input
                      type="number"
                      value={usdToBdtRate}
                      onChange={(e) => setUsdToBdtRate(parseFloat(e.target.value) || 120)}
                      style={{ width: '90px', padding: '8px', background: '#070E1E', border: '1px solid #10B981', color: '#10B981', fontSize: '14px', fontWeight: 'bold', borderRadius: '8px', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>BDT</span>
                  </div>
                </div>

                <div style={{ background: cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${borderNeon}` }}>
                  <h4 style={{ margin: '0 0 10px', color: '#F59E0B', fontSize: '14px' }}>⚙️ Monetag মার্জিন কন্ট্রোল</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px' }}>অ্যাডমিন লাভ (%):</span>
                    <input
                      type="number"
                      value={monetagConfig.adminProfitMargin}
                      onChange={(e) => setMonetagConfig({ ...monetagConfig, adminProfitMargin: parseInt(e.target.value) || 0 })}
                      style={{ width: '70px', padding: '6px', background: '#070E1E', border: '1px solid #334155', color: '#38BDF8', textAlign: 'center', fontWeight: 'bold', borderRadius: '6px' }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#10B981' }}>ইউজার পাবে: ${calculatedUserAdReward} USD (৳ {(calculatedUserAdReward * usdToBdtRate).toFixed(2)})</div>
                </div>
              </div>
            )}

            {/* 2. TASKS */}
            {adminTab === 'tasks' && (
              <div>
                <div style={{ background: cardBg, padding: '14px', borderRadius: '14px', marginBottom: '14px', border: `1px solid ${borderNeon}` }}>
                  <h4 style={{ margin: '0 0 12px', color: primaryNeon, fontSize: '14px' }}>
                    {editingTask ? '✏️ টাস্ক এডিট করুন' : '➕ নতুন টাস্ক যোগ করুন'}
                  </h4>
                  <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="টাস্ক শিরোনাম"
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
                        <option value="website">App/Web</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="রিওয়ার্ড ($)"
                        value={taskForm.rewardUSD}
                        onChange={(e) => setTaskForm({ ...taskForm, rewardUSD: parseFloat(e.target.value) || 0.05 })}
                        style={{ padding: '8px', background: '#070E1E', border: '1px solid #334155', borderRadius: '6px', color: '#FFF', fontSize: '12px' }}
                      />
                    </div>
                    <input
                      type="url"
                      placeholder="টাস্ক লিংক"
                      value={taskForm.link}
                      onChange={(e) => setTaskForm({ ...taskForm, link: e.target.value })}
                      style={{ padding: '8px', background: '#070E1E', border: '1px solid #334155', borderRadius: '6px', color: '#FFF', fontSize: '12px' }}
                    />
                    <textarea
                      placeholder="কাজের নির্দেশনা..."
                      value={taskForm.instructions}
                      onChange={(e) => setTaskForm({ ...taskForm, instructions: e.target.value })}
                      rows={2}
                      style={{ padding: '8px', background: '#070E1E', border: '1px solid #334155', borderRadius: '6px', color: '#FFF', fontSize: '11px', resize: 'none' }}
                    />
                    <button type="submit" style={{ padding: '10px', background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '6px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                      {editingTask ? 'আপডেট করুন' : 'পাবলিশ করুন'}
                    </button>
                  </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dailyTasks.map(t => (
                    <div key={t.id} style={{ background: '#070E1E', padding: '10px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{t.title}</div>
                        <div style={{ fontSize: '10px', color: '#10B981', marginTop: '2px' }}>${t.rewardUSD} • {t.platform}</div>
                      </div>
                      <button onClick={() => setDailyTasks(dailyTasks.filter(x => x.id !== t.id))} style={{ padding: '4px 8px', background: '#EF4444', border: 'none', borderRadius: '4px', color: '#FFF', fontSize: '10px' }}>
                        মুছুন
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. PROOFS */}
            {adminTab === 'proofs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {proofSubmissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '13px' }}>কোনো যাচাইকরণ পেন্ডিং নেই</div>
                ) : (
                  proofSubmissions.map(sub => (
                    <div key={sub.id} style={{ background: '#070E1E', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{sub.user}</span>
                        <span style={{ color: '#10B981', fontWeight: 'bold' }}>+${sub.rewardUSD}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 8px' }}>{sub.taskTitle}</div>
                      <img src={sub.startProof} alt="Proof" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button onClick={() => handleApproveProof(sub)} style={{ padding: '8px', background: '#10B981', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 'bold', fontSize: '11px' }}>✅ Approve</button>
                        <button onClick={() => handleRejectProof(sub.id)} style={{ padding: '8px', background: '#EF4444', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 'bold', fontSize: '11px' }}>❌ Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. WITHDRAWS */}
            {adminTab === 'withdraws' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {withdrawRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '13px' }}>কোনো উইথড্র রিকোয়েস্ট নেই</div>
                ) : (
                  withdrawRequests.map(req => (
                    <div key={req.id} style={{ background: '#070E1E', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{req.user}</span>
                        <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>{req.status}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#38BDF8', margin: '4px 0' }}>${req.amountUSD} ≈ ৳ {req.amountBDT} টাকা ({req.method}: {req.account})</div>
                      {req.status === 'Pending' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                          <button onClick={() => handleApproveWithdraw(req.id)} style={{ padding: '8px', background: '#10B981', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 'bold', fontSize: '11px' }}>✅ Paid</button>
                          <button onClick={() => handleRejectWithdraw(req)} style={{ padding: '8px', background: '#EF4444', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 'bold', fontSize: '11px' }}>❌ Refund</button>
                        </div>
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
                      <span onClick={() => setShowBalance(!showBalance)} style={{ cursor: 'pointer', fontSize: '15px' }}>
                        {showBalance ? '👁️' : '🙈'}
                      </span>
                    </div>
                    <button
                      onClick={() => { setActiveTab('wallet'); handleSelectMethod('bkash'); setWalletModal('cashout'); }}
                      style={{
                        background: 'linear-gradient(90deg, #00D1FF, #0084FF)',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '6px 18px',
                        color: '#000',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                      Withdraw
                    </button>
                  </div>

                  <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '10px 0' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
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
                    <span>অগ্রগতি (Milestone):</span>
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
                    cursor: 'pointer'
                  }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>🎬 Watch Video & Earn</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>ভিডিও দেখে আয় করুন</p>
                  </div>
                  <div style={{ background: '#FFF', color: '#000', fontWeight: '800', fontSize: '11px', padding: '8px 14px', borderRadius: '20px' }}>
                    ওপেন করুন ›
                  </div>
                </div>

                {/* Rewarded Popup Card */}
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
                      <div style={{ fontSize: '10px', color: '#A855F7' }}>বোনাস: +${calculatedUserAdReward} USD</div>
                    </div>
                  </div>
                  <span style={{ background: '#A855F7', color: '#FFF', fontSize: '10px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '14px' }}>
                    Claim
                  </span>
                </div>

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
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '6px' }}>
                          <img src={taskLogos[task.platform] || taskLogos.website} alt={task.platform} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{task.title}</div>
                          <div style={{ fontSize: '12px', color: primaryNeon, fontWeight: '700' }}>
                            +${task.rewardUSD.toFixed(2)} USD (৳ {(task.rewardUSD * usdToBdtRate).toFixed(1)})
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => { window.open(task.link, '_blank'); setSocialProofModal(task); }}
                        disabled={task.status !== 'pending'}
                        style={{
                          background: task.status === 'reviewing' ? 'rgba(234, 179, 8, 0.2)' : 'linear-gradient(90deg, #00D1FF, #0066FF)',
                          border: task.status === 'reviewing' ? '1px solid #EAB308' : 'none',
                          borderRadius: '20px',
                          padding: '8px 16px',
                          color: task.status === 'reviewing' ? '#EAB308' : '#000',
                          fontWeight: '700',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}>
                        {task.status === 'reviewing' ? 'Reviewing ⏳' : 'Start'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: WALLET */}
            {activeTab === 'wallet' && (
              <div>
                <div style={{ background: cardBg, border: `1px solid ${borderNeon}`, borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>Total Balance</span>
                  <h1 style={{ fontSize: '36px', margin: '8px 0', color: primaryNeon }}>${balance.toFixed(2)}</h1>
                  <div style={{ display: 'inline-block', background: 'rgba(0, 209, 255, 0.1)', padding: '4px 12px', borderRadius: '20px', color: '#38BDF8', fontSize: '12px', marginBottom: '16px' }}>
                    1 USD = {usdToBdtRate} BDT • ৳ {(balance * usdToBdtRate).toLocaleString()} টাকা
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button onClick={() => { handleSelectMethod('bkash'); setWalletModal('cashout'); }} style={{ background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '12px', padding: '12px', color: '#000', fontWeight: '800', cursor: 'pointer' }}>
                      Cash Out
                    </button>
                    <button onClick={() => setWalletModal('historyFilter')} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${borderNeon}`, borderRadius: '12px', padding: '12px', color: '#FFF', fontWeight: '600', cursor: 'pointer' }}>
                      Filter History
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredTransactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748B', fontSize: '12px' }}>এখনও কোনো লেনদেন সম্পন্ন হয়নি</div>
                  ) : (
                    filteredTransactions.map((tx, idx) => (
                      <div key={idx} style={{ background: cardBg, borderRadius: '12px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{tx.type}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{tx.date}</div>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: tx.positive ? '#10B981' : '#EF4444' }}>{tx.amount}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: PROFILE */}
            {activeTab === 'profile' && (
              <div>
                <div style={{ background: cardBg, border: `1px solid ${borderNeon}`, borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: 'linear-gradient(135deg, #00D1FF, #0055FF)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 'bold', border: '2px solid #00D1FF', overflow: 'hidden' }}>
                    {currentUser.avatar ? <img src={currentUser.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'FA'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '17px' }}>{currentUser.name}</h3>
                    {kycStatus === 'Verified' && <span style={{ color: '#00D1FF' }}>✓</span>}
                  </div>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>@{currentUser.username || 'member'} • ID: {currentUser.id}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div onClick={() => { setEditName(currentUser.name); setEditUsername(currentUser.username); setProfileModal('editProfile'); }} style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span>✏️ Edit Profile</span><span>›</span>
                  </div>
                  <div onClick={() => { setEditBkash(paymentMethods.bkash); setEditNagad(paymentMethods.nagad); setEditRocket(paymentMethods.rocket); setProfileModal('paymentSettings'); }} style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span>💳 Payment Settings</span><span>›</span>
                  </div>
                  <div onClick={() => setProfileModal('kyc')} style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span>🆔 KYC Verification</span>
                    <span style={{ fontSize: '11px', color: kycStatus === 'Verified' ? '#00D1FF' : '#EF4444' }}>{kycStatus}</span>
                  </div>
                  <div onClick={() => setProfileModal('support')} style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span>🎧 Support & Help</span><span>›</span>
                  </div>
                  <div onClick={() => setProfileModal('terms')} style={{ background: cardBg, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span>📜 Terms & Conditions</span><span>›</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modals & Popups */}
      {moreModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '20px', width: '100%', maxWidth: '380px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setMoreModalOpen(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>✖</button>
            <h3 style={{ margin: '0 0 16px', color: primaryNeon }}>📦 More Features</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Leaderboard 🥇', 'Lucky Spin Wheel 🎡', 'VIP Membership 👑', 'Platform Safety 🛡️'].map((item, i) => (
                <div key={i} onClick={() => alert(`${item} শীঘ্রই চালু হবে!`)} style={{ background: cardBg, padding: '12px', borderRadius: '10px', cursor: 'pointer' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Referral Hub */}
      {referralModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '20px', width: '100%', maxWidth: '390px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setReferralModalOpen(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px' }}>✖</button>
            <h3 style={{ margin: 0, color: primaryNeon, textAlign: 'center' }}>🎁 রেফারেল হাব</h3>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>প্রতি সফল রেফারে ৳ ১০০ এবং ১০০ জনে $10 বোনাস!</p>
            <div style={{ background: '#070E1E', border: `1px dashed ${primaryNeon}`, borderRadius: '12px', padding: '10px', margin: '14px 0', display: 'flex', gap: '8px' }}>
              <input type="text" readOnly value={`https://t.me/FAAgencyEarnOfficialBot?start=${currentUser.referralCode}`} style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFF', fontSize: '11px' }} />
              <button onClick={copyReferralLink} style={{ background: primaryNeon, border: 'none', borderRadius: '6px', padding: '6px 12px', color: '#000', fontWeight: 'bold' }}>Copy</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center' }}>
              <div style={{ background: cardBg, padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>মোট রেফার্ড</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: primaryNeon }}>{referrals} জন</div>
              </div>
              <div style={{ background: cardBg, padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>বোনাস প্রাপ্ত</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10B981' }}>৳ {referrals * 100} BDT</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC */}
      {profileModal === 'kyc' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '20px', width: '100%', maxWidth: '390px', padding: '20px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setProfileModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px' }}>✖</button>
            <h3 style={{ margin: '0 0 12px', color: primaryNeon }}>KYC Verification</h3>
            <input type="text" placeholder="NID নম্বর লিখুন" value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '10px', boxSizing: 'border-box' }} />
            <div style={{ background: '#070E1E', border: '1px dashed #38BDF8', borderRadius: '10px', padding: '10px', marginBottom: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#38BDF8', marginBottom: '4px' }}>১. NID সামনের সাইড</div>
              <input type="file" accept="image/*" onChange={(e) => setNidFront(e.target.files[0])} />
            </div>
            <div style={{ background: '#070E1E', border: '1px dashed #38BDF8', borderRadius: '10px', padding: '10px', marginBottom: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#38BDF8', marginBottom: '4px' }}>২. NID পিছনের সাইড</div>
              <input type="file" accept="image/*" onChange={(e) => setNidBack(e.target.files[0])} />
            </div>
            <div style={{ background: '#070E1E', border: '1px dashed #10B981', borderRadius: '10px', padding: '10px', marginBottom: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#10B981', marginBottom: '4px' }}>৩. নিজের স্পষ্ট সেলফি</div>
              <input type="file" accept="image/*" onChange={(e) => setUserSelfie(e.target.files[0])} />
            </div>
            <button onClick={handleKycSubmit} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 'bold' }}>
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Cashout */}
      {walletModal === 'cashout' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '18px', width: '100%', maxWidth: '390px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setWalletModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px' }}>✖</button>
            <h3 style={{ margin: '0 0 4px', color: primaryNeon }}>Cash Out</h3>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#94A3B8' }}>মেথড ও স্লট নির্বাচন করুন (মিনিমাম $10):</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {[
                { id: 'bkash', name: 'বিকাশ', logo: bkashLogo },
                { id: 'nagad', name: 'নগদ', logo: nagadLogo },
                { id: 'rocket', name: 'রকেট', logo: rocketLogo }
              ].map(m => (
                <div key={m.id} onClick={() => handleSelectMethod(m.id)} style={{ border: `2px solid ${selectedMethod === m.id ? '#00D1FF' : 'transparent'}`, borderRadius: '10px', padding: '8px', textAlign: 'center', cursor: 'pointer', background: '#070E1E' }}>
                  <img src={m.logo} alt={m.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                  <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{m.name}</div>
                </div>
              ))}
            </div>
            <input type="text" value={targetAccount} onChange={(e) => setTargetAccount(e.target.value)} placeholder="01XXXXXXXXX" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '12px', boxSizing: 'border-box' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '12px' }}>
              {availableSlots.map(slot => (
                <button key={slot} onClick={() => setWithdrawAmount(slot)} style={{ padding: '6px 0', borderRadius: '6px', border: withdrawAmount === slot ? '1px solid #00D1FF' : '1px solid #334155', background: withdrawAmount === slot ? 'rgba(0, 209, 255, 0.2)' : '#070E1E', color: '#FFF' }}>
                  ${slot}
                </button>
              ))}
            </div>
            <div style={{ background: '#070E1E', padding: '10px', borderRadius: '8px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#10B981' }}>পাবেন:</span>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>৳ {(withdrawAmount * usdToBdtRate).toLocaleString()} টাকা</span>
            </div>
            <button onClick={handleProcessCashout} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '10px', color: '#000', fontWeight: '800' }}>
              Confirm Cash Out
            </button>
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {socialProofModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setSocialProofModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px' }}>✖</button>
            <h3 style={{ margin: '0 0 8px', color: primaryNeon }}>📸 প্রুফ আপলোড</h3>
            <p style={{ fontSize: '12px', color: '#94A3B8' }}>{socialProofModal.title}</p>
            <div style={{ background: '#070E1E', padding: '8px', borderRadius: '6px', fontSize: '11px', color: '#FCD34D', marginBottom: '12px' }}>
              💡 {socialProofModal.instructions}
            </div>
            <input type="file" accept="image/*" onChange={(e) => setProofImage1(URL.createObjectURL(e.target.files[0]))} style={{ marginBottom: '14px' }} />
            <button onClick={handleSubmitSocialProof} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 'bold' }}>
              সাবমিট করুন
            </button>
          </div>
        </div>
      )}

      {/* Video Proof Modal */}
      {videoProofModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '16px', width: '100%', maxWidth: '390px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setVideoProofModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px' }}>✖</button>
            <h3 style={{ margin: '0 0 6px', color: primaryNeon }}>⏱️ ভিডিওর ২টি স্ক্রিনশট</h3>
            <div style={{ marginBottom: '8px', fontSize: '11px' }}>১. ভিডিও শুরুর স্ক্রিনশট: <input type="file" accept="image/*" onChange={(e) => setProofImage1(URL.createObjectURL(e.target.files[0]))} /></div>
            <div style={{ marginBottom: '14px', fontSize: '11px' }}>২. ভিডিও শেষের স্ক্রিনশট: <input type="file" accept="image/*" onChange={(e) => setProofImage2(URL.createObjectURL(e.target.files[0]))} /></div>
            <button onClick={handleSubmitVideoProof} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #10B981, #059669)', border: 'none', borderRadius: '10px', color: '#FFF', fontWeight: 'bold' }}>
              জমা দিন
            </button>
          </div>
        </div>
      )}

      {/* Video Hub Modal */}
      {videoModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '20px', width: '100%', maxWidth: '390px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setVideoModalOpen(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px' }}>✖</button>
            <h3 style={{ margin: '0 0 10px', color: primaryNeon }}>🎬 Watch Video & Earn</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {videoTasks.map(v => (
                <div key={v.id} style={{ background: '#070E1E', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{v.title}</div>
                    <div style={{ fontSize: '10px', color: '#10B981' }}>+${v.rewardUSD}</div>
                  </div>
                  <button onClick={() => { window.open(v.link, '_blank'); setVideoProofModal(v); }} style={{ background: '#E11D48', color: '#FFF', border: 'none', borderRadius: '14px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
                    Watch ▶
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Modal */}
      {gamesModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 400, display: 'flex', flexDirection: 'column', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: primaryNeon }}>🎮 Live Game Hub</h3>
            <button onClick={() => { setGamesModalOpen(false); setSelectedGameUrl(''); }} style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '20px' }}>✖</button>
          </div>
          {!selectedGameUrl ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { name: 'Flappy Dunk 🏀', url: 'https://games.construct.net/1034/latest' },
                { name: 'Subway Runner 🏃', url: 'https://games.construct.net/1083/latest' },
                { name: 'Tower Builder 🏗️', url: 'https://games.construct.net/1004/latest' },
                { name: 'Knife Hit 🔪', url: 'https://games.construct.net/1018/latest' }
              ].map((g, i) => (
                <div key={i} onClick={() => setSelectedGameUrl(g.url)} style={{ background: cardBg, padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{g.name}</div>
                  <div style={{ color: '#10B981', fontSize: '10px', marginTop: '6px' }}>Play & Win</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <iframe src={selectedGameUrl} title="Game" style={{ width: '100%', flex: 1, border: 'none', borderRadius: '10px' }} />
              <button onClick={() => { setBalance(b => parseFloat((b + 0.05).toFixed(2))); setGamesModalOpen(false); setSelectedGameUrl(''); alert('গেম খেলার রিওয়ার্ড +$0.05 যোগ হয়েছে!'); }} style={{ marginTop: '10px', padding: '10px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                Claim +$0.05
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {profileModal === 'editProfile' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '16px', width: '100%', maxWidth: '390px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setProfileModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px' }}>✖</button>
            <h3 style={{ margin: '0 0 14px', color: primaryNeon }}>Edit Profile</h3>
            <input type="text" placeholder="নাম" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '10px', boxSizing: 'border-box' }} />
            <input type="text" placeholder="ইউজারনেম" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '14px', boxSizing: 'border-box' }} />
            <button onClick={() => { setCurrentUser({ ...currentUser, name: editName || currentUser.name, username: editUsername || currentUser.username }); setProfileModal(null); }} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold' }}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* Payment Settings Modal */}
      {profileModal === 'paymentSettings' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '16px', width: '100%', maxWidth: '390px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setProfileModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px' }}>✖</button>
            <h3 style={{ margin: '0 0 14px', color: primaryNeon }}>Payment Settings</h3>
            <input type="text" placeholder="বিকাশ নম্বর" value={editBkash} onChange={(e) => setEditBkash(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '10px', boxSizing: 'border-box' }} />
            <input type="text" placeholder="নগদ নম্বর" value={editNagad} onChange={(e) => setEditNagad(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '10px', boxSizing: 'border-box' }} />
            <input type="text" placeholder="রকেট নম্বর" value={editRocket} onChange={(e) => setEditRocket(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#070E1E', border: '1px solid #334155', color: '#FFF', marginBottom: '14px', boxSizing: 'border-box' }} />
            <button onClick={() => { setPaymentMethods({ bkash: editBkash, nagad: editNagad, rocket: editRocket }); setProfileModal(null); }} style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg, #00D1FF, #0084FF)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold' }}>
              Save Accounts
            </button>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {profileModal === 'support' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setProfileModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px' }}>✖</button>
            <h3 style={{ margin: '0 0 12px', color: primaryNeon }}>Support & Help</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://t.me/fa_agency_support_bot" target="_blank" rel="noreferrer" style={{ padding: '12px', background: '#0088CC', color: '#FFF', textAlign: 'center', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>টেলিগ্রাম সাপোর্ট</a>
              <a href="mailto:support@fa-agency.online" style={{ padding: '12px', background: '#1E293B', color: '#38BDF8', textAlign: 'center', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #38BDF8' }}>ইমেইল সাপোর্ট</a>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {profileModal === 'terms' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0B1B3B', border: `1px solid ${borderNeon}`, borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setProfileModal(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px' }}>✖</button>
            <h3 style={{ margin: '0 0 10px', color: primaryNeon }}>শর্তাবলী</h3>
            <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.5' }}>
              ১. প্রতিটি টাস্ক সততার সাথে সম্পন্ন করতে হবে।<br/>
              ২. সর্বনিম্ন উইথড্র $10 ডলার।<br/>
              ৩. ফেক রেফারেল করলে অ্যাকাউন্ট সাসপেন্ড হতে পারে।
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation */}
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
                color: isActive && !isAdminView ? primaryNeon : '#64748B'
              }}>
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: isActive && !isAdminView ? '700' : '500' }}>{tab.label}</span>
            </div>
          );
        })}
      </nav>

    </div>
  );
}
