import React, { useState, useEffect } from "react";

// Payment Method Logos
const bkashLogo = new URL("./assets/payment-methods/bkash.png", import.meta.url).href;
const nagadLogo = new URL("./assets/payment-methods/nagad.png", import.meta.url).href;
const rocketLogo = new URL("./assets/payment-methods/rocket.png", import.meta.url).href;

// Task Platform Circular Logos
const taskLogos = {
  telegram: new URL("./assets/task-logos/telegram.png", import.meta.url).href,
  whatsapp: new URL("./assets/task-logos/whatsapp.png", import.meta.url).href,
  youtube: new URL("./assets/task-logos/youtube.png", import.meta.url).href,
  facebook: new URL("./assets/task-logos/facebook.png", import.meta.url).href,
  tiktok: new URL("./assets/task-logos/tiktok.png", import.meta.url).href,
  twitter: new URL("./assets/task-logos/twitter.png", import.meta.url).href,
  website: new URL("./assets/task-logos/website.png", import.meta.url).href
};

// SUPER ADMIN CONFIGURATION
const SUPER_ADMIN_ID = "980047040";
const SUPER_ADMIN_USERNAME = "Md_Aman_ullah";

// Official Facebook Style Blue Tick Badge
const VerifiedBadge = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ verticalAlign: "middle", display: "inline-block", flexShrink: 0 }}
  >
    <path
      d="M10.29 2.308a2.5 2.5 0 0 1 3.42 0l.662.62c.414.388.95.61 1.507.625l.904.024a2.5 2.5 0 0 1 2.43 2.43l.024.904c.015.557.237 1.093.625 1.507l.62.662a2.5 2.5 0 0 1 0 3.42l-.62.662c-.388.414-.61.95-.625 1.507l-.024.904a2.5 2.5 0 0 1-2.43 2.43l-.904.024c-.557.015-1.093.237-1.507.625l-.662.62a2.5 2.5 0 0 1-3.42 0l-.662-.62c-.414-.388-.95-.61-1.507-.625l-.904-.024a2.5 2.5 0 0 1-2.43-2.43l-.024-.904c-.015-.557-.237-1.093-.625-1.507l-.62-.662a2.5 2.5 0 0 1 0-3.42l.62-.662c.388-.414.61-.95.625-1.507l.024-.904a2.5 2.5 0 0 1 2.43-2.43l.904-.024c.557-.015 1.093-.237 1.507-.625l.662-.62z"
      fill="#0084FF"
    />
    <path
      d="M9.5 12.5l2 2 4.5-5"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminTab, setAdminTab] = useState("kyc");

  const [usdToBdtRate, setUsdToBdtRate] = useState(() => {
    return parseFloat(localStorage.getItem("fa_rate")) || 120;
  });

  const [balance, setBalance] = useState(() => {
    return parseFloat(localStorage.getItem("fa_user_balance")) || 0.00;
  });
  const [todayEarn, setTodayEarn] = useState(() => {
    return parseFloat(localStorage.getItem("fa_today_earn")) || 0.00;
  });
  const [totalEarn, setTotalEarn] = useState(() => {
    return parseFloat(localStorage.getItem("fa_total_earn")) || 0.00;
  });
  const [showBalance, setShowBalance] = useState(true);

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
          name: `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim() || "User",
          username: tgUser.username || "",
          avatar: tgUser.photo_url || null,
          referralCode: "FA" + tgUser.id.toString().slice(-4)
        });
      }
      const startParam = window.Telegram.WebApp.initDataUnsafe?.start_param
        || new URLSearchParams(window.location.search).get("startapp")
        || new URLSearchParams(window.location.search).get("ref");
      if (startParam) {
        localStorage.setItem("fa_start_param", startParam);
      }
    }
  }, []);

  const isSuperAdmin = String(currentUser.id) === SUPER_ADMIN_ID || currentUser.username === SUPER_ADMIN_USERNAME;

  // Complete Referral System with Strict Withdraw & Friend History
  const [referralList, setReferralList] = useState(() => {
    const saved = localStorage.getItem("fa_referral_friends_detailed");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        friendName: "Tanvir Hasan",
        friendId: "6829104",
        joinedDate: "05 Sep, 2026",
        currentEarnUSD: 14.50,
        hasWithdrawn10USD: true,
        withdrawnAmount: 10.00,
        bonusPaid: true,
        bonusBDT: 100
      },
      {
        id: 2,
        friendName: "MD Rakib",
        friendId: "7102941",
        joinedDate: "07 Sep, 2026",
        currentEarnUSD: 10.20,
        hasWithdrawn10USD: true,
        withdrawnAmount: 10.00,
        bonusPaid: true,
        bonusBDT: 100
      },
      {
        id: 3,
        friendName: "Shakil Khan",
        friendId: "8192340",
        joinedDate: "08 Sep, 2026",
        currentEarnUSD: 6.40,
        hasWithdrawn10USD: false,
        withdrawnAmount: 0.00,
        bonusPaid: false,
        bonusBDT: 0
      }
    ];
  });

  const referrals = referralList.length;
  const qualifiedReferrals = referralList.filter(f => f.hasWithdrawn10USD).length;
  const totalReferralBonusEarnedBDT = referralList.filter(f => f.bonusPaid).reduce((acc, curr) => acc + curr.bonusBDT, 0);
  const pendingBonusBDT = referralList.filter(f => !f.bonusPaid).length * 100;
  const requiredReferralsForWithdraw = 10;
  const milestoneTarget = 100;
  const milestonePercent = Math.min(100, Math.round((qualifiedReferrals / milestoneTarget) * 100));

  useEffect(() => {
    localStorage.setItem("fa_user_balance", balance.toString());
    localStorage.setItem("fa_today_earn", todayEarn.toString());
    localStorage.setItem("fa_total_earn", totalEarn.toString());
    localStorage.setItem("fa_rate", usdToBdtRate.toString());
    localStorage.setItem("fa_referral_friends_detailed", JSON.stringify(referralList));
  }, [balance, todayEarn, totalEarn, usdToBdtRate, referralList]);

  // KYC Submissions Queue & Status
  const [kycQueue, setKycQueue] = useState(() => {
    const saved = localStorage.getItem("fa_kyc_queue");
    return saved ? JSON.parse(saved) : [];
  });

  const [userKycStatus, setUserKycStatus] = useState(() => {
    return localStorage.getItem("fa_my_kyc_status") || "Unverified";
  });

  const [nidNumber, setNidNumber] = useState("");
  const [nidFront, setNidFront] = useState(null);
  const [nidBack, setNidBack] = useState(null);
  const [userSelfie, setUserSelfie] = useState(null);

  // Complete Social Tasks
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, title: "Join Official Telegram Channel", platform: "telegram", rewardUSD: 0.10, link: "https://t.me/FAAgencyEarnAppBot", status: "pending" },
    { id: 2, title: "Join Official WhatsApp Group", platform: "whatsapp", rewardUSD: 0.10, link: "https://chat.whatsapp.com/", status: "pending" },
    { id: 3, title: "Follow Official Facebook Page", platform: "facebook", rewardUSD: 0.15, link: "https://facebook.com/", status: "pending" },
    { id: 4, title: "Subscribe YouTube Channel & Bell", platform: "youtube", rewardUSD: 0.20, link: "https://youtube.com/", status: "pending" },
    { id: 5, title: "Follow Official TikTok Account", platform: "tiktok", rewardUSD: 0.15, link: "https://tiktok.com/", status: "pending" },
    { id: 6, title: "Follow on Twitter (X)", platform: "twitter", rewardUSD: 0.10, link: "https://twitter.com/", status: "pending" },
    { id: 7, title: "Visit Agency Website (1 Min)", platform: "website", rewardUSD: 0.12, link: "https://apps.fa-agency.online", status: "pending" }
  ]);

  // Video Earning Hub
  const [videoTasks, setVideoTasks] = useState([
    { id: 201, title: "Watch YouTube Official Video (5 Min)", rewardUSD: 0.30, link: "https://youtube.com/", duration: "5 Min", status: "pending" },
    { id: 202, title: "Watch TikTok Viral Video (1 Min)", rewardUSD: 0.15, link: "https://tiktok.com/", duration: "1 Min", status: "pending" }
  ]);

  // Modals & Popups
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [gamesModalOpen, setGamesModalOpen] = useState(false);
  const [selectedGameUrl, setSelectedGameUrl] = useState("");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [socialProofModal, setSocialProofModal] = useState(null);
  const [videoProofModal, setVideoProofModal] = useState(null);
  const [walletModal, setWalletModal] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
  const [proofImage1, setProofImage1] = useState(null);
  const [proofImage2, setProofImage2] = useState(null);

  const [proofSubmissions, setProofSubmissions] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [paymentMethods, setPaymentMethods] = useState({ bkash: "", nagad: "", rocket: "" });
  const [selectedMethod, setSelectedMethod] = useState("bkash");
  const [withdrawAmount, setWithdrawAmount] = useState(10);
  const [targetAccount, setTargetAccount] = useState("");

  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBkash, setEditBkash] = useState("");
  const [editNagad, setEditNagad] = useState("");
  const [editRocket, setEditRocket] = useState("");

  const primaryNeon = "#00D1FF";
  const bgDark = "#070E1E";
  const cardBg = "rgba(15, 30, 65, 0.65)";
  const borderNeon = "rgba(0, 209, 255, 0.2)";
  const availableSlots = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const calculatedUserAdReward = 0.03;

  // Zero Auto Ads (Only deliberate user clicks)
  const getMonetagHandler = () => {
    if (typeof window.show_11756404 === "function") return window.show_11756404;
    if (typeof window.show_rewarded === "function") return window.show_rewarded;
    return null;
  };

  const triggerMonetagAd = () => {
    const handler = getMonetagHandler();
    if (handler) {
      handler().then(() => addAdBonus("Monetag Video Ad")).catch(() => fallbackAd("Video"));
    } else {
      fallbackAd("Video");
    }
  };

  const triggerMonetagPopupAd = () => {
    const handler = getMonetagHandler();
    if (handler) {
      handler("pop").then(() => addAdBonus("Monetag Popup Offer")).catch(() => fallbackAd("Popup"));
    } else {
      fallbackAd("Popup");
    }
  };

  const fallbackAd = (type) => {
    const ok = window.confirm(`[Monetag ${type} Ad]\nবিজ্ঞাপন দেখা সম্পন্ন হয়েছে?\n\nব্যালেন্সে $${calculatedUserAdReward} যোগ হবে।`);
    if (ok) addAdBonus(`Monetag ${type} Ad`);
  };

  const addAdBonus = (label) => {
    setBalance(b => parseFloat((b + calculatedUserAdReward).toFixed(3)));
    setTodayEarn(e => parseFloat((e + calculatedUserAdReward).toFixed(3)));
    setTotalEarn(t => parseFloat((t + calculatedUserAdReward).toFixed(3)));
    setTransactions(prev => [{
      type: label,
      date: "Just now",
      amount: `+$${calculatedUserAdReward}`,
      positive: true,
      category: "earn"
    }, ...prev]);
    alert(`বিজ্ঞাপন দেখার জন্য +$${calculatedUserAdReward} USD জমা হয়েছে!`);
  };

  // Lucky Spin Action
  const handleSpinWheel = () => {
    const rewards = [0.02, 0.05, 0.10, 0.01, 0.03];
    const won = rewards[Math.floor(Math.random() * rewards.length)];
    setBalance(b => parseFloat((b + won).toFixed(3)));
    setTodayEarn(e => parseFloat((e + won).toFixed(3)));
    setTotalEarn(t => parseFloat((t + won).toFixed(3)));
    setTransactions(prev => [{
      type: "Lucky Spin Bonus",
      date: "Just now",
      amount: `+$${won.toFixed(2)}`,
      positive: true,
      category: "earn"
    }, ...prev]);
    alert(`অভিনন্দন! আপনি লাকি স্পিন করে $${won.toFixed(2)} USD জিতে নিয়েছেন!`);
    setSpinModalOpen(false);
  };

  // KYC User Submit
  const handleKycSubmit = () => {
    if (!nidNumber || !nidFront || !nidBack || !userSelfie) {
      return alert("অনুগ্রহ করে NID নম্বর, সামনের ছবি, পেছনের ছবি ও নিজের সেলফি আপলোড করুন!");
    }

    const newEntry = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      username: currentUser.username,
      nidNumber: nidNumber,
      nidFront: nidFront,
      nidBack: nidBack,
      userSelfie: userSelfie,
      submittedAt: new Date().toLocaleString(),
      status: "Pending"
    };

    const updated = [newEntry, ...kycQueue];
    setKycQueue(updated);
    localStorage.setItem("fa_kyc_queue", JSON.stringify(updated));

    setUserKycStatus("Pending");
    localStorage.setItem("fa_my_kyc_status", "Pending");
    setProfileModal(null);
    alert("KYC সাবমিট হয়েছে! FA AGENCY™ সাপোর্ট টিম বিষয়টি পর্যবেক্ষণ করে ব্লু টিক প্রদান করবে।");
  };

  // Admin KYC Actions
  const handleApproveKyc = (kyc) => {
    const updated = kycQueue.filter(k => k.id !== kyc.id);
    setKycQueue(updated);
    localStorage.setItem("fa_kyc_queue", JSON.stringify(updated));

    if (String(kyc.userId) === String(currentUser.id)) {
      setUserKycStatus("Verified");
      localStorage.setItem("fa_my_kyc_status", "Verified");
    }
    alert(`ব্যবহারকারী ${kyc.userName}-এর KYC অনুমোদিত হয়েছে!`);
  };

  const handleRejectKyc = (kyc) => {
    const updated = kycQueue.filter(k => k.id !== kyc.id);
    setKycQueue(updated);
    localStorage.setItem("fa_kyc_queue", JSON.stringify(updated));

    if (String(kyc.userId) === String(currentUser.id)) {
      setUserKycStatus("Rejected");
      localStorage.setItem("fa_my_kyc_status", "Rejected");
    }
    alert(`ব্যবহারকারী ${kyc.userName}-এর KYC বাতিল করা হয়েছে।`);
  };

  // Cashout with Strict $10 and 10 Referrals Criteria
  const handleProcessCashout = () => {
    if (!targetAccount) return alert("অ্যাকাউন্ট নম্বর দিন!");
    if (withdrawAmount < 10 || withdrawAmount % 10 !== 0) {
      return alert("উইথড্র সর্বনিম্ন $10 হতে হবে এবং $10-এর গুণিতক স্লটে (যেমন: $10, $20, $30...) তুলতে হবে!");
    }
    if (qualifiedReferrals < requiredReferralsForWithdraw) {
      return alert(`উইথড্র করার শর্ত: আপনাকে অন্তত ${requiredReferralsForWithdraw} জন এমন বন্ধুকে রেফার করতে হবে যারা প্রত্যেকে $10 উইথড্র সফল করেছে!\nবর্তমানে শর্ত পূরণকারী ফ্রেন্ড: ${qualifiedReferrals} জন।`);
    }
    if (balance - withdrawAmount < 1.0) {
      return alert("পর্যাপ্ত ব্যালেন্স নেই! ক্যাশআউটের পর অ্যাকাউন্টে অন্তত $1.00 অবশিষ্ট থাকতে হবে।");
    }

    const bdtEquivalent = withdrawAmount * usdToBdtRate;
    setBalance(prev => parseFloat((prev - withdrawAmount).toFixed(2)));

    setWithdrawRequests([{
      id: Date.now(),
      user: currentUser.name,
      method: selectedMethod.toUpperCase(),
      account: targetAccount,
      amountUSD: withdrawAmount,
      amountBDT: bdtEquivalent,
      time: "Just now",
      status: "Pending"
    }, ...withdrawRequests]);

    setTransactions(prev => [{
      type: `Cash Out (${selectedMethod.toUpperCase()})`,
      date: "Just now",
      amount: `-$${withdrawAmount.toFixed(2)}`,
      positive: false,
      category: "withdraw"
    }, ...prev]);

    setWalletModal(null);
    alert(`উইথড্র সফল হয়েছে!\nপরিমাণ: $${withdrawAmount} (৳ ${bdtEquivalent.toLocaleString()} টাকা)\nFA AGENCY™ টিম সর্বোচ্চ ২৪ ঘণ্টার মধ্যে পেমেন্ট পাঠিয়ে দেবে।`);
  };

  const copyReferralLink = () => {
    const link = `https://t.me/FAAgencyEarnAppBot?start=${currentUser.referralCode}`;
    navigator.clipboard.writeText(link);
    alert(`রেফারেল লিংক কপি হয়েছে!\n${link}`);
  };

  return (
    <div style={{
      maxWidth: "430px",
      margin: "0 auto",
      minHeight: "100vh",
      backgroundColor: bgDark,
      color: "#FFFFFF",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      position: "relative",
      paddingBottom: "80px",
      boxSizing: "border-box"
    }}>

      {/* Top Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: `1px solid ${borderNeon}`,
        background: "rgba(7, 14, 30, 0.85)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00D1FF, #0055FF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            border: "2px solid #00D1FF",
            overflow: "hidden"
          }}>
            {currentUser.avatar ? <img src={currentUser.avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "FA"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: "700", fontSize: "15px" }}>{currentUser.name}</span>
              {userKycStatus === "Verified" && <VerifiedBadge size={16} />}
            </div>
            <span style={{ fontSize: "11px", color: "#10B981" }}>● ID: {currentUser.id}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isSuperAdmin && (
            <button
              onClick={() => setIsAdminView(!isAdminView)}
              style={{
                background: isAdminView ? "#E11D48" : "linear-gradient(90deg, #F59E0B, #D97706)",
                border: "none",
                color: "#FFF",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer"
              }}>
              {isAdminView ? "Exit Admin" : "⚡ Admin"}
            </button>
          )}
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: cardBg, border: `1px solid ${borderNeon}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            🔔
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "16px" }}>

        {/* ADMIN PANEL VIEW */}
        {isAdminView ? (
          <div>
            <div style={{ background: "#1E293B", padding: "14px", borderRadius: "12px", marginBottom: "14px", border: "1px solid #F59E0B" }}>
              <h3 style={{ margin: "0 0 2px", color: "#FCD34D", fontSize: "16px" }}>👑 সুপার অ্যাডমিন প্যানেল</h3>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>লগইন: @{currentUser.username} ({currentUser.id})</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "14px" }}>
              {["kyc", "proofs", "withdraws"].map(t => (
                <button
                  key={t}
                  onClick={() => setAdminTab(t)}
                  style={{
                    padding: "8px 4px",
                    borderRadius: "8px",
                    border: adminTab === t ? "1px solid #00D1FF" : "1px solid #334155",
                    background: adminTab === t ? "rgba(0, 209, 255, 0.2)" : "#070E1E",
                    color: adminTab === t ? "#00D1FF" : "#94A3B8",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {adminTab === "kyc" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {kycQueue.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px", color: "#64748B" }}>কোনো KYC রিকোয়েস্ট পেন্ডিং নেই</div>
                ) : (
                  kycQueue.map(k => (
                    <div key={k.id} style={{ background: "#070E1E", padding: "12px", borderRadius: "10px", border: "1px solid #334155" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <b>{k.userName}</b>
                        <span style={{ color: "#F59E0B" }}>NID: {k.nidNumber}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                        <img src={k.nidFront} alt="Front" style={{ width: "100%", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                        <img src={k.nidBack} alt="Back" style={{ width: "100%", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                        <img src={k.userSelfie} alt="Selfie" style={{ width: "100%", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        <button onClick={() => handleApproveKyc(k)} style={{ padding: "6px", background: "#10B981", border: "none", borderRadius: "4px", color: "#FFF", fontWeight: "bold" }}>Approve (Blue-Tick)</button>
                        <button onClick={() => handleRejectKyc(k)} style={{ padding: "6px", background: "#EF4444", border: "none", borderRadius: "4px", color: "#FFF", fontWeight: "bold" }}>Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          /* USER VIEW */
          <div>
            {/* TAB: HOME */}
            {activeTab === "home" && (
              <div>
                {/* Balance Card */}
                <div style={{
                  background: "linear-gradient(145deg, #0F234D 0%, #09152F 100%)",
                  border: `1px solid ${borderNeon}`,
                  borderRadius: "20px",
                  padding: "20px",
                  marginBottom: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "13px", color: "#94A3B8" }}>Total Balance</span>
                      <span onClick={() => setShowBalance(!showBalance)} style={{ cursor: "pointer" }}>{showBalance ? "👁️" : "🙈"}</span>
                    </div>
                    <button
                      onClick={() => { setActiveTab("wallet"); setWalletModal("cashout"); }}
                      style={{
                        background: "linear-gradient(90deg, #00D1FF, #0084FF)",
                        border: "none",
                        borderRadius: "20px",
                        padding: "6px 18px",
                        color: "#000",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}>
                      Withdraw
                    </button>
                  </div>

                  <h1 style={{ fontSize: "36px", fontWeight: "800", margin: "10px 0" }}>
                    {showBalance ? `$${balance.toFixed(2)}` : "••••••••"}
                  </h1>
                  <div style={{ fontSize: "12px", color: "#00D1FF", marginBottom: "8px" }}>
                    {showBalance ? `≈ ৳ ${(balance * usdToBdtRate).toLocaleString()} BDT` : "৳ •••••• BDT"}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px", marginTop: "10px", textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#94A3B8" }}>Today Earn</div>
                      <div style={{ fontWeight: "700", fontSize: "13px", color: primaryNeon }}>{showBalance ? `$${todayEarn.toFixed(2)}` : "••••"}</div>
                    </div>
                    <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ fontSize: "11px", color: "#94A3B8" }}>Total Earn</div>
                      <div style={{ fontWeight: "700", fontSize: "13px" }}>{showBalance ? `$${totalEarn.toFixed(2)}` : "••••"}</div>
                    </div>
                    <div onClick={() => setReferralModalOpen(true)} style={{ cursor: "pointer" }}>
                      <div style={{ fontSize: "11px", color: "#94A3B8" }}>Referral 👥</div>
                      <div style={{ fontWeight: "700", fontSize: "13px", color: "#10B981" }}>{referrals} Friends</div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                  {[
                    { title: "Daily Tasks", sub: "Complete & Earn", icon: "📋", action: () => setActiveTab("task") },
                    { title: "Watch Ads", sub: "Earn More", icon: "📺", action: triggerMonetagAd },
                    { title: "Referral", sub: "৳100 Per Friend", icon: "👥", action: () => setReferralModalOpen(true) },
                    { title: "Games", sub: "Play & Win", icon: "🎮", action: () => setGamesModalOpen(true) },
                    { title: "Offer Wall", sub: "High Rewards", icon: "⭐", action: () => setActiveTab("task") },
                    { title: "More", sub: "Spin & Perks", icon: "📦", action: () => setMoreModalOpen(true) }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={item.action}
                      style={{
                        background: cardBg,
                        border: `1px solid ${borderNeon}`,
                        borderRadius: "14px",
                        padding: "14px 8px",
                        textAlign: "center",
                        cursor: "pointer"
                      }}>
                      <div style={{ fontSize: "24px", marginBottom: "4px" }}>{item.icon}</div>
                      <div style={{ fontSize: "12px", fontWeight: "700" }}>{item.title}</div>
                      <div style={{ fontSize: "9px", color: item.title === "Watch Ads" ? "#10B981" : "#94A3B8", marginTop: "2px" }}>{item.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Detailed Referral Mega Banner */}
                <div
                  onClick={() => setReferralModalOpen(true)}
                  style={{
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.28) 100%)",
                    border: "1.5px solid #F59E0B",
                    borderRadius: "16px",
                    padding: "14px 16px",
                    cursor: "pointer"
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "18px" }}>🏆</span>
                      <span style={{ fontSize: "13px", fontWeight: "bold", color: "#FCD34D" }}>রেফারেল নিয়ম ও মেগা বোনাস</span>
                    </div>
                    <span style={{ background: "#F59E0B", color: "#000", fontSize: "11px", fontWeight: "900", padding: "3px 8px", borderRadius: "20px" }}>
                      +$10.00 USD
                    </span>
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#FEF08A", lineHeight: "1.5" }}>
                    • রেফারকৃত ব্যক্তি <b>$10 ডলার উইথড্র সফল করলে</b> আপনি পাবেন <b>৳ ১০০ টাকা বোনাস</b>!<br/>
                    • উইথড্র আনলক করতে অন্তত <b>১০ জনের $10 উইথড্র সফল</b> হতে হবে।<br/>
                    • ১০০ জন সফল রেফারারে অতিরিক্ত <b>$10 ক্যাশ বোনাস</b>!
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#CBD5E1", marginBottom: "4px" }}>
                    <span>শর্ত পূরণকারী ফ্রেন্ডস:</span>
                    <span><b>{qualifiedReferrals}</b> / {milestoneTarget} জন ({milestonePercent}%)</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.5)", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ width: `${milestonePercent}%`, height: "100%", background: "linear-gradient(90deg, #F59E0B, #10B981)", borderRadius: "10px" }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TASKS */}
            {activeTab === "task" && (
              <div>
                <div 
                  onClick={() => setVideoModalOpen(true)}
                  style={{
                    background: "linear-gradient(135deg, #E11D48 0%, #9333EA 100%)",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer"
                  }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>🎬 Watch Video & Earn</h3>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.9 }}>ভিডিও দেখে আয় করুন</p>
                  </div>
                  <div style={{ background: "#FFF", color: "#000", fontWeight: "800", fontSize: "11px", padding: "8px 14px", borderRadius: "20px" }}>
                    ওপেন করুন ›
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {dailyTasks.map(task => (
                    <div key={task.id} style={{
                      background: cardBg,
                      border: `1px solid ${borderNeon}`,
                      borderRadius: "16px",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "6px" }}>
                          <img src={taskLogos[task.platform] || taskLogos.website} alt={task.platform} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600" }}>{task.title}</div>
                          <div style={{ fontSize: "12px", color: primaryNeon, fontWeight: "700" }}>
                            +${task.rewardUSD.toFixed(2)} USD (৳ {(task.rewardUSD * usdToBdtRate).toFixed(1)})
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => { window.open(task.link, "_blank"); setSocialProofModal(task); }}
                        style={{
                          background: "linear-gradient(90deg, #00D1FF, #0066FF)",
                          border: "none",
                          borderRadius: "20px",
                          padding: "8px 16px",
                          color: "#000",
                          fontWeight: "700",
                          fontSize: "11px",
                          cursor: "pointer"
                        }}>
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: WALLET */}
            {activeTab === "wallet" && (
              <div>
                <div style={{ background: cardBg, border: `1px solid ${borderNeon}`, borderRadius: "20px", padding: "20px", textAlign: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", color: "#94A3B8" }}>Total Balance</span>
                  <h1 style={{ fontSize: "36px", margin: "8px 0", color: primaryNeon }}>${balance.toFixed(2)}</h1>
                  <div style={{ display: "inline-block", background: "rgba(0, 209, 255, 0.1)", padding: "4px 12px", borderRadius: "20px", color: "#38BDF8", fontSize: "12px", marginBottom: "16px" }}>
                    1 USD = {usdToBdtRate} BDT • ৳ {(balance * usdToBdtRate).toLocaleString()} টাকা
                  </div>
                  <button onClick={() => setWalletModal("cashout")} style={{ width: "100%", background: "linear-gradient(90deg, #00D1FF, #0084FF)", border: "none", borderRadius: "12px", padding: "12px", color: "#000", fontWeight: "800", cursor: "pointer" }}>
                    Cash Out
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: "#94A3B8", marginBottom: "4px" }}>উইথড্র হিস্ট্রি ও ট্রানজেকশন:</div>
                  {transactions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "#64748B", fontSize: "12px" }}>এখনও কোনো লেনদেন সম্পন্ন হয়নি</div>
                  ) : (
                    transactions.map((tx, idx) => (
                      <div key={idx} style={{ background: cardBg, borderRadius: "12px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600" }}>{tx.type}</div>
                          <div style={{ fontSize: "11px", color: "#94A3B8" }}>{tx.date}</div>
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "14px", color: tx.positive ? "#10B981" : "#EF4444" }}>{tx.amount}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === "profile" && (
              <div>
                <div style={{ background: cardBg, border: `1px solid ${borderNeon}`, borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "16px" }}>
                  <div style={{ width: "74px", height: "74px", borderRadius: "50%", background: "linear-gradient(135deg, #00D1FF, #0055FF)", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: "bold", border: "2px solid #00D1FF", overflow: "hidden" }}>
                    {currentUser.avatar ? <img src={currentUser.avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "FA"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "17px" }}>{currentUser.name}</h3>
                    {userKycStatus === "Verified" && <VerifiedBadge size={18} />}
                  </div>
                  <span style={{ fontSize: "12px", color: "#94A3B8" }}>@{currentUser.username || "member"} • ID: {currentUser.id}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div onClick={() => setProfileModal("editProfile")} style={{ background: cardBg, borderRadius: "12px", padding: "14px 16px", display: "flex", justifyContent: "space-between", cursor: "pointer" }}>
                    <span>✏️ Edit Profile</span><span>›</span>
                  </div>
                  <div onClick={() => setProfileModal("paymentSettings")} style={{ background: cardBg, borderRadius: "12px", padding: "14px 16px", display: "flex", justifyContent: "space-between", cursor: "pointer" }}>
                    <span>💳 Payment Settings</span><span>›</span>
                  </div>
                  <div onClick={() => setProfileModal("kyc")} style={{ background: cardBg, borderRadius: "12px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                    <span>🆔 KYC Verification</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", color: userKycStatus === "Verified" ? "#00D1FF" : (userKycStatus === "Pending" ? "#F59E0B" : "#EF4444"), fontWeight: "bold" }}>
                        {userKycStatus}
                      </span>
                      {userKycStatus === "Verified" && <VerifiedBadge size={14} />}
                    </div>
                  </div>
                  <div onClick={() => setProfileModal("support")} style={{ background: cardBg, borderRadius: "12px", padding: "14px 16px", display: "flex", justifyContent: "space-between", cursor: "pointer" }}>
                    <span>🎧 Support & Help</span><span>›</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ================= MODAL: MORE HUB (GORGEOUS COLORING CARDS) ================= */}
      {moreModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 350, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1.5px solid ${primaryNeon}`, borderRadius: "24px", width: "100%", maxWidth: "390px", padding: "22px", position: "relative", boxShadow: "0 0 30px rgba(0,209,255,0.25)" }}>
            <button onClick={() => setMoreModalOpen(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "20px", cursor: "pointer" }}>✖</button>
            <h3 style={{ margin: "0 0 16px", color: primaryNeon, fontSize: "18px" }}>📦 More Feature Hub</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div 
                onClick={() => { setMoreModalOpen(false); setSpinModalOpen(true); }}
                style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.45) 100%)",
                  border: "1px solid #10B981",
                  borderRadius: "16px",
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🎡</div>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px", color: "#FFF" }}>Lucky Spin Wheel</div>
                    <div style={{ fontSize: "11px", color: "#A7F3D0" }}>প্রতিদিন জিতে নিন ফ্রি ক্যাশ বোনাস</div>
                  </div>
                </div>
                <span style={{ background: "#10B981", color: "#000", fontWeight: "800", fontSize: "11px", padding: "4px 10px", borderRadius: "20px" }}>SPIN ›</span>
              </div>

              <div 
                onClick={() => { setMoreModalOpen(false); setLeaderboardModalOpen(true); }}
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.45) 100%)",
                  border: "1px solid #F59E0B",
                  borderRadius: "16px",
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🥇</div>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px", color: "#FFF" }}>Top Earners Leaderboard</div>
                    <div style={{ fontSize: "11px", color: "#FDE68A" }}>শীর্ষ উপার্জনকারীদের র‍্যাংক তালিকা</div>
                  </div>
                </div>
                <span style={{ background: "#F59E0B", color: "#000", fontWeight: "800", fontSize: "11px", padding: "4px 10px", borderRadius: "20px" }}>RANK ›</span>
              </div>

              <div 
                onClick={() => { setMoreModalOpen(false); setVipModalOpen(true); }}
                style={{
                  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(126, 34, 206, 0.45) 100%)",
                  border: "1px solid #A855F7",
                  borderRadius: "16px",
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>👑</div>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px", color: "#FFF" }}>VIP Membership Club</div>
                    <div style={{ fontSize: "11px", color: "#E9D5FF" }}>ডাবল ইনকাম ও এক্সপ্রেস ক্যাশআউট</div>
                  </div>
                </div>
                <span style={{ background: "#A855F7", color: "#FFF", fontWeight: "800", fontSize: "11px", padding: "4px 10px", borderRadius: "20px" }}>VIP ›</span>
              </div>

              <div 
                onClick={() => { setMoreModalOpen(false); setSecurityModalOpen(true); }}
                style={{
                  background: "linear-gradient(135deg, rgba(0, 209, 255, 0.2) 0%, rgba(0, 102, 255, 0.35) 100%)",
                  border: "1px solid #00D1FF",
                  borderRadius: "16px",
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#00D1FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#000" }}>🛡️</div>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px", color: "#FFF" }}>Security & Guarantees</div>
                    <div style={{ fontSize: "11px", color: "#BAE6FD" }}>১০০% নিরাপদ আর্নিং ও ডেটা সুরক্ষা</div>
                  </div>
                </div>
                <span style={{ background: "#00D1FF", color: "#000", fontWeight: "800", fontSize: "11px", padding: "4px 10px", borderRadius: "20px" }}>SAFE ›</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAILED REFERRAL HUB ================= */}
      {referralModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1.5px solid ${borderNeon}`, borderRadius: "22px", width: "100%", maxWidth: "410px", padding: "20px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setReferralModalOpen(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px", cursor: "pointer" }}>✖</button>
            
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: "0 0 4px", color: primaryNeon, fontSize: "18px" }}>👥 রেফারেল নেটওয়ার্ক ও ট্র্যাকিং</h3>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>FA AGENCY™ রেফারেল শর্ত ও লাইভ হিস্ট্রি</span>
            </div>

            {/* Official Terms & Condition Callout */}
            <div style={{ background: "rgba(245, 158, 11, 0.12)", border: "1.5px solid #F59E0B", borderRadius: "14px", padding: "12px 14px", marginBottom: "14px", fontSize: "11px", color: "#FEF08A", lineHeight: "1.6" }}>
              <div style={{ fontWeight: "bold", fontSize: "12px", color: "#FCD34D", marginBottom: "4px" }}>📜 রেফারেল ও বোনাস নীতিমালা:</div>
              • <b>১০০ টাকা বোনাস শর্ত:</b> যাকে রেফার করবেন, সে অ্যাকাউন্ট খুলে কাজ করে <b>$10 ডলার উইথড্র সফলভাবে সম্পন্ন করলে</b> তবেই আপনি প্রতি রেফারে ১০০ টাকা বোনাস পাবেন।<br/>
              • <b>উইথড্র করার শর্ত:</b> আপনাকে অবশ্যই <b>সর্বনিম্ন ১০ জনকে রেফার করতে হবে</b> এবং সেই ১০ জনকেই নিজ অ্যাকাউন্ট থেকে $10 করে উইথড্র দিতে হবে। তবেই আপনার উইথড্র আনলক হবে।<br/>
              • <b>মেগা রিওয়ার্ড:</b> ১০০ জন ইউজার $10 উইথড্র সফল করলে অতিরিক্ত <b>$10 ডলার ক্যাশ বোনাস</b> সরাসরি প্রদান করা হবে।
            </div>

            {/* Unlock Status Progress */}
            <div style={{
              background: qualifiedReferrals >= 10 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.15)",
              border: `1px solid ${qualifiedReferrals >= 10 ? "#10B981" : "#EF4444"}`,
              borderRadius: "12px",
              padding: "10px 14px",
              marginBottom: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: qualifiedReferrals >= 10 ? "#10B981" : "#FCA5A5" }}>
                  {qualifiedReferrals >= 10 ? "✅ রেফারেল উইথড্র আনলক হয়েছে" : "🔒 রেফারেল উইথড্র লক রয়েছে"}
                </div>
                <div style={{ fontSize: "10px", color: "#CBD5E1" }}>
                  {qualifiedReferrals >= 10 ? "১০ জনের $10 উইথড্র সম্পন্ন হয়েছে" : `আরও ${10 - qualifiedReferrals} জন বন্ধুর $10 উইথড্র প্রয়োজন`}
                </div>
              </div>
              <span style={{ fontSize: "14px", fontWeight: "900", color: qualifiedReferrals >= 10 ? "#10B981" : "#EF4444" }}>
                {qualifiedReferrals}/10 জন
              </span>
            </div>

            {/* Invite Link */}
            <div style={{ background: "#070E1E", border: `1px dashed ${primaryNeon}`, borderRadius: "10px", padding: "8px 12px", display: "flex", gap: "8px", alignItems: "center", marginBottom: "14px" }}>
              <input type="text" readOnly value={`https://t.me/FAAgencyEarnAppBot?start=${currentUser.referralCode}`} style={{ width: "100%", background: "transparent", border: "none", color: "#FFF", fontSize: "11px", outline: "none" }} />
              <button onClick={copyReferralLink} style={{ background: primaryNeon, border: "none", borderRadius: "6px", padding: "6px 14px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>Copy</button>
            </div>

            {/* Summary Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", textAlign: "center", marginBottom: "16px" }}>
              <div style={{ background: cardBg, padding: "10px", borderRadius: "10px", border: `1px solid ${borderNeon}` }}>
                <div style={{ fontSize: "10px", color: "#94A3B8" }}>প্রাপ্ত বোনাস (পেইড)</div>
                <div style={{ fontSize: "15px", fontWeight: "bold", color: "#10B981" }}>৳ {totalReferralBonusEarnedBDT} BDT</div>
                <div style={{ fontSize: "9px", color: "#64748B" }}>{qualifiedReferrals} জন সফল উইথড্র</div>
              </div>
              <div style={{ background: cardBg, padding: "10px", borderRadius: "10px", border: `1px solid ${borderNeon}` }}>
                <div style={{ fontSize: "10px", color: "#94A3B8" }}>পেন্ডিং বোনাস</div>
                <div style={{ fontSize: "15px", fontWeight: "bold", color: "#F59E0B" }}>৳ {pendingBonusBDT} BDT</div>
                <div style={{ fontSize: "9px", color: "#64748B" }}>$10 উইথড্রর অপেক্ষায়</div>
              </div>
            </div>

            {/* A to Z Friend Referral History */}
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#38BDF8", marginBottom: "8px" }}>
              📋 রেফারেল হিস্ট্রি (কে কত আয় করল ও উইথড্র দিল):
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {referralList.map(f => (
                <div key={f.id} style={{ background: "#070E1E", border: "1px solid #1E293B", borderRadius: "12px", padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div>
                      <span style={{ fontWeight: "bold", fontSize: "13px", color: "#FFF" }}>{f.friendName}</span>
                      <span style={{ fontSize: "10px", color: "#94A3B8", marginLeft: "6px" }}>ID: {f.friendId}</span>
                    </div>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: "bold",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: f.hasWithdrawn10USD ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                      color: f.hasWithdrawn10USD ? "#10B981" : "#F59E0B",
                      border: `1px solid ${f.hasWithdrawn10USD ? "#10B981" : "#F59E0B"}`
                    }}>
                      {f.hasWithdrawn10USD ? "উইথড্র সম্পন্ন ($10)" : "উইথড্র পেন্ডিং"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px", color: "#CBD5E1", background: "rgba(255,255,255,0.02)", padding: "8px", borderRadius: "8px" }}>
                    <div>তার বর্তমান আয়: <b>${f.currentEarnUSD.toFixed(2)}</b></div>
                    <div>মোট উইথড্র: <b>${f.withdrawnAmount.toFixed(2)}</b></div>
                    <div>যুক্ত হওয়ার তারিখ: <b>{f.joinedDate}</b></div>
                    <div>আপনার বোনাস: <b style={{ color: f.bonusPaid ? "#10B981" : "#F59E0B" }}>{f.bonusPaid ? "+৳১০০ (জমা)" : "৳০ (পেন্ডিং)"}</b></div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Lucky Spin Modal */}
      {spinModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1px solid ${borderNeon}`, borderRadius: "20px", width: "100%", maxWidth: "360px", padding: "24px", textAlign: "center", position: "relative" }}>
            <button onClick={() => setSpinModalOpen(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px" }}>✖</button>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>🎡</div>
            <h3 style={{ margin: "0 0 8px", color: primaryNeon }}>Lucky Spin Wheel</h3>
            <p style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "20px" }}>স্পিন বাটনে চাপ দিয়ে জিতে নিন $0.01 থেকে $0.10 ডলার পর্যন্ত ক্যাশ বোনাস!</p>
            <button onClick={handleSpinWheel} style={{ width: "100%", padding: "12px", background: "linear-gradient(90deg, #10B981, #059669)", border: "none", borderRadius: "10px", color: "#FFF", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}>
              স্পিন করুন 🎯
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {leaderboardModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1px solid ${borderNeon}`, borderRadius: "20px", width: "100%", maxWidth: "380px", padding: "20px", position: "relative" }}>
            <button onClick={() => setLeaderboardModalOpen(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px" }}>✖</button>
            <h3 style={{ margin: "0 0 14px", color: primaryNeon }}>🥇 শীর্ষ উপার্জনকারী (Leaderboard)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { rank: 1, name: "Tanvir Ahmed", earn: "$142.50", badge: "🥇" },
                { rank: 2, name: "Sabbir Hossain", earn: "$118.20", badge: "🥈" },
                { rank: 3, name: "Rifat Karim", earn: "$94.00", badge: "🥉" },
                { rank: 4, name: "Mehedi Hasan", earn: "$75.30", badge: "⭐" },
                { rank: 5, name: currentUser.name, earn: `$${totalEarn.toFixed(2)}`, badge: "👤 (You)" }
              ].map(u => (
                <div key={u.rank} style={{ background: cardBg, padding: "10px 12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px" }}><b>{u.badge}</b> {u.name}</span>
                  <span style={{ color: "#10B981", fontWeight: "bold", fontSize: "12px" }}>{u.earn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIP Modal */}
      {vipModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1px solid ${borderNeon}`, borderRadius: "20px", width: "100%", maxWidth: "380px", padding: "20px", position: "relative" }}>
            <button onClick={() => setVipModalOpen(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px" }}>✖</button>
            <h3 style={{ margin: "0 0 10px", color: "#F59E0B" }}>👑 VIP Membership Club</h3>
            <p style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: "1.5" }}>
              ভিআইপি মেম্বাররা প্রতিটি টাস্কে পাবেন <b>দ্বিগুণ (2X) রিওয়ার্ড</b>, তাৎক্ষণিক ক্যাশআউট সুবিধা এবং ২৪/৭ ডেডিকেটেড অ্যাডমিন সাপোর্ট।<br/><br/>
              খুব শীঘ্রই ভিআইপি ক্লাবের নতুন স্লট উন্মুক্ত করা হবে!
            </p>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {securityModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1px solid ${borderNeon}`, borderRadius: "20px", width: "100%", maxWidth: "380px", padding: "20px", position: "relative" }}>
            <button onClick={() => setSecurityModalOpen(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px" }}>✖</button>
            <h3 style={{ margin: "0 0 10px", color: primaryNeon }}>🛡️ নিরাপত্তা ও বিশ্বস্ততা</h3>
            <p style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: "1.6" }}>
              FA AGENCY আপনার উপার্জিত অর্থের শতভাগ নিশ্চয়তা প্রদান করে। আপনার ওয়ালেট ডাটা, NID এবং পেমেন্ট নম্বর এনক্রিপ্টেড আকারে ডাটাবেজে সুরক্ষিত থাকে।
            </p>
          </div>
        </div>
      )}

      {/* KYC Modal */}
      {profileModal === "kyc" && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 350, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1px solid ${borderNeon}`, borderRadius: "20px", width: "100%", maxWidth: "390px", padding: "20px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setProfileModal(null)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px" }}>✖</button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <h3 style={{ margin: 0, color: primaryNeon }}>KYC Verification</h3>
              <VerifiedBadge size={20} />
            </div>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "0 0 12px", lineHeight: "1.5" }}>
              সঠিক ডকুমেন্টস প্রদান করে অ্যাকাউন্ট ভেরিফাই করুন। <b>FA AGENCY™</b> সাপোর্ট টিম বিষয়টি পর্যবেক্ষণ করে ব্লু টিক প্রদান করবে।
            </p>

            <input
              type="text"
              placeholder="National ID (NID) নম্বর"
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#070E1E", border: "1px solid #334155", color: "#FFF", marginBottom: "10px", boxSizing: "border-box" }}
            />

            <div style={{ background: "#070E1E", border: "1px dashed #38BDF8", borderRadius: "10px", padding: "10px", marginBottom: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#38BDF8", marginBottom: "4px" }}>১. NID সামনের দিক</div>
              <input type="file" accept="image/*" onChange={(e) => {
                const reader = new FileReader();
                reader.onloadend = () => setNidFront(reader.result);
                if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
              }} />
            </div>

            <div style={{ background: "#070E1E", border: "1px dashed #38BDF8", borderRadius: "10px", padding: "10px", marginBottom: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#38BDF8", marginBottom: "4px" }}>২. NID পেছনের দিক</div>
              <input type="file" accept="image/*" onChange={(e) => {
                const reader = new FileReader();
                reader.onloadend = () => setNidBack(reader.result);
                if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
              }} />
            </div>

            <div style={{ background: "#070E1E", border: "1px dashed #10B981", borderRadius: "10px", padding: "10px", marginBottom: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#10B981", marginBottom: "4px" }}>৩. নিজের স্পষ্ট সেলফি</div>
              <input type="file" accept="image/*" onChange={(e) => {
                const reader = new FileReader();
                reader.onloadend = () => setUserSelfie(reader.result);
                if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
              }} />
            </div>

            <button
              onClick={handleKycSubmit}
              style={{ width: "100%", padding: "12px", background: "linear-gradient(90deg, #00D1FF, #0084FF)", border: "none", borderRadius: "10px", color: "#000", fontWeight: "bold", cursor: "pointer" }}>
              সাবমিট করুন
            </button>
          </div>
        </div>
      )}

      {/* Cashout Modal */}
      {walletModal === "cashout" && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.88)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1px solid ${borderNeon}`, borderRadius: "18px", width: "100%", maxWidth: "390px", padding: "20px", position: "relative" }}>
            <button onClick={() => setWalletModal(null)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px" }}>✖</button>
            <h3 style={{ margin: "0 0 4px", color: primaryNeon }}>Cash Out</h3>
            <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#FCD34D" }}>
              শর্ত: ১০ জন রেফারারের $10 উইথড্র সফল হওয়া আবশ্যক এবং মিনিমাম $10 স্লট।
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
              {[
                { id: "bkash", name: "বিকাশ", logo: bkashLogo },
                { id: "nagad", name: "নগদ", logo: nagadLogo },
                { id: "rocket", name: "রকেট", logo: rocketLogo }
              ].map(m => (
                <div key={m.id} onClick={() => { setSelectedMethod(m.id); setTargetAccount(paymentMethods[m.id]); }} style={{ border: `2px solid ${selectedMethod === m.id ? "#00D1FF" : "transparent"}`, borderRadius: "10px", padding: "8px", textAlign: "center", cursor: "pointer", background: "#070E1E" }}>
                  <img src={m.logo} alt={m.name} style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                  <div style={{ fontSize: "11px", fontWeight: "bold" }}>{m.name}</div>
                </div>
              ))}
            </div>
            <input type="text" value={targetAccount} onChange={(e) => setTargetAccount(e.target.value)} placeholder="01XXXXXXXXX" style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#070E1E", border: "1px solid #334155", color: "#FFF", marginBottom: "12px", boxSizing: "border-box" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", marginBottom: "12px" }}>
              {availableSlots.map(slot => (
                <button key={slot} onClick={() => setWithdrawAmount(slot)} style={{ padding: "6px 0", borderRadius: "6px", border: withdrawAmount === slot ? "1px solid #00D1FF" : "1px solid #334155", background: withdrawAmount === slot ? "rgba(0, 209, 255, 0.2)" : "#070E1E", color: "#FFF" }}>
                  ${slot}
                </button>
              ))}
            </div>
            <div style={{ background: "#070E1E", padding: "10px", borderRadius: "8px", marginBottom: "14px", display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#10B981" }}>পাবেন:</span>
              <span style={{ color: "#10B981", fontWeight: "bold" }}>৳ {(withdrawAmount * usdToBdtRate).toLocaleString()} টাকা</span>
            </div>
            <button onClick={handleProcessCashout} style={{ width: "100%", padding: "12px", background: "linear-gradient(90deg, #00D1FF, #0084FF)", border: "none", borderRadius: "10px", color: "#000", fontWeight: "800", cursor: "pointer" }}>
              Confirm Cash Out
            </button>
          </div>
        </div>
      )}

      {gamesModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1px solid ${borderNeon}`, borderRadius: "20px", width: "100%", maxWidth: "380px", padding: "20px", position: "relative" }}>
            <button onClick={() => setGamesModalOpen(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px" }}>✖</button>
            <h3 style={{ margin: "0 0 10px", color: primaryNeon }}>🎮 Games Hub</h3>
            <p style={{ fontSize: "12px", color: "#94A3B8" }}>খেলার মাধ্যমে আয়ের অফার খুব শীঘ্রই যুক্ত হবে। এখন Daily Tasks ও Watch Ads ব্যবহার করুন।</p>
            <button onClick={() => { setGamesModalOpen(false); setActiveTab("task"); }} style={{ width: "100%", padding: "12px", background: "linear-gradient(90deg, #00D1FF, #0084FF)", border: "none", borderRadius: "10px", color: "#000", fontWeight: "bold" }}>টাস্কে যান</button>
          </div>
        </div>
      )}

      {videoModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1px solid ${borderNeon}`, borderRadius: "20px", width: "100%", maxWidth: "380px", padding: "20px", position: "relative" }}>
            <button onClick={() => setVideoModalOpen(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px" }}>✖</button>
            <h3 style={{ margin: "0 0 10px", color: primaryNeon }}>🎬 Watch Video & Earn</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {videoTasks.map((task) => (
                <div key={task.id} style={{ background: cardBg, padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontWeight: "700", fontSize: "13px" }}>{task.title}</div>
                  <div style={{ color: primaryNeon, fontSize: "12px", margin: "4px 0 8px" }}>+${task.rewardUSD.toFixed(2)} • {task.duration}</div>
                  <button onClick={() => { window.open(task.link, "_blank"); setVideoProofModal(task); }} style={{ width: "100%", padding: "8px", border: "none", borderRadius: "8px", background: "#00D1FF", color: "#000", fontWeight: "700" }}>ভিডিও দেখুন</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {profileModal === "editProfile" && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1px solid ${borderNeon}`, borderRadius: "20px", width: "100%", maxWidth: "380px", padding: "20px", position: "relative" }}>
            <button onClick={() => setProfileModal(null)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px" }}>✖</button>
            <h3 style={{ margin: "0 0 12px", color: primaryNeon }}>Edit Profile</h3>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="নাম" style={{ width: "100%", marginBottom: "8px", padding: "10px", borderRadius: "8px", background: "#070E1E", border: "1px solid #334155", color: "#FFF", boxSizing: "border-box" }} />
            <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="ইউজারনেম" style={{ width: "100%", marginBottom: "12px", padding: "10px", borderRadius: "8px", background: "#070E1E", border: "1px solid #334155", color: "#FFF", boxSizing: "border-box" }} />
            <button onClick={() => {
              setCurrentUser((prev) => ({ ...prev, name: editName || prev.name, username: editUsername || prev.username }));
              setProfileModal(null);
            }} style={{ width: "100%", padding: "12px", background: "linear-gradient(90deg, #00D1FF, #0084FF)", border: "none", borderRadius: "10px", color: "#000", fontWeight: "bold" }}>সেভ করুন</button>
          </div>
        </div>
      )}

      {profileModal === "paymentSettings" && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1px solid ${borderNeon}`, borderRadius: "20px", width: "100%", maxWidth: "380px", padding: "20px", position: "relative" }}>
            <button onClick={() => setProfileModal(null)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px" }}>✖</button>
            <h3 style={{ margin: "0 0 12px", color: primaryNeon }}>Payment Settings</h3>
            <input value={editBkash} onChange={(e) => setEditBkash(e.target.value)} placeholder="বিকাশ নম্বর" style={{ width: "100%", marginBottom: "8px", padding: "10px", borderRadius: "8px", background: "#070E1E", border: "1px solid #334155", color: "#FFF", boxSizing: "border-box" }} />
            <input value={editNagad} onChange={(e) => setEditNagad(e.target.value)} placeholder="নগদ নম্বর" style={{ width: "100%", marginBottom: "8px", padding: "10px", borderRadius: "8px", background: "#070E1E", border: "1px solid #334155", color: "#FFF", boxSizing: "border-box" }} />
            <input value={editRocket} onChange={(e) => setEditRocket(e.target.value)} placeholder="রকেট নম্বর" style={{ width: "100%", marginBottom: "12px", padding: "10px", borderRadius: "8px", background: "#070E1E", border: "1px solid #334155", color: "#FFF", boxSizing: "border-box" }} />
            <button onClick={() => {
              setPaymentMethods({ bkash: editBkash, nagad: editNagad, rocket: editRocket });
              setProfileModal(null);
            }} style={{ width: "100%", padding: "12px", background: "linear-gradient(90deg, #00D1FF, #0084FF)", border: "none", borderRadius: "10px", color: "#000", fontWeight: "bold" }}>সেভ করুন</button>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {profileModal === "support" && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#0B1B3B", border: `1px solid ${borderNeon}`, borderRadius: "16px", width: "100%", maxWidth: "380px", padding: "20px", position: "relative" }}>
            <button onClick={() => setProfileModal(null)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94A3B8", fontSize: "18px" }}>✖</button>
            <h3 style={{ margin: "0 0 12px", color: primaryNeon }}>Support & Help</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href="https://t.me/fa_agency_support_bot" target="_blank" rel="noreferrer" style={{ padding: "12px", background: "#0088CC", color: "#FFF", textAlign: "center", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>টেলিগ্রাম সাপোর্ট</a>
              <a href="mailto:agency.official@outlook.com" style={{ padding: "12px", background: "#1E293B", color: "#38BDF8", textAlign: "center", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", border: "1px solid #38BDF8" }}>
                ইমেইল: agency.official@outlook.com
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        maxWidth: "430px",
        margin: "0 auto",
        height: "65px",
        backgroundColor: "rgba(7, 14, 30, 0.95)",
        borderTop: `1px solid ${borderNeon}`,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 100
      }}>
        {[
          { id: "home", label: "Home", icon: "🏠" },
          { id: "task", label: "Task", icon: "📋" },
          { id: "wallet", label: "Wallet", icon: "💳" },
          { id: "profile", label: "Profile", icon: "👤" }
        ].map(tab => (
          <div
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setIsAdminView(false); }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
              color: activeTab === tab.id && !isAdminView ? primaryNeon : "#64748B"
            }}>
            <span style={{ fontSize: "18px" }}>{tab.icon}</span>
            <span style={{ fontSize: "11px", fontWeight: activeTab === tab.id && !isAdminView ? "700" : "500" }}>{tab.label}</span>
          </div>
        ))}
      </nav>

    </div>
  );
}