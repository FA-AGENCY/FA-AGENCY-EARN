import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const API_BASE = (import.meta.env.DEV || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')))
  ? 'http://localhost:5000'
  : (import.meta.env.VITE_API_URL || '');
const unavailable = 'তথ্য পাওয়া যায়নি';

const tabs = [
  ['dashboard', 'ড্যাশবোর্ড', '📊'],
  ['users', 'ব্যবহারকারী', '👥'],
  ['withdrawals', 'উত্তোলন', '💳'],
  ['funds', 'Fund Center', '🏦'],
  ['fraud', 'Fraud Center', '🛡️'],
  ['tasks', 'টাস্ক রিভিউ', '✅'],
  ['support', 'সাপোর্ট টিকেট', '🆘'],
  ['audit', 'অডিট লগ', '📜']
];

const statusTransitions = {
  PENDING: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PROCESSING', 'REJECTED'],
  PROCESSING: ['PAID', 'REJECTED']
};

const labels = {
  ACTIVE: 'সক্রিয়',
  RESTRICTED: 'সীমাবদ্ধ',
  SUSPENDED: 'স্থগিত',
  CLOSED: 'বন্ধ',
  PENDING: 'অপেক্ষমাণ',
  UNDER_REVIEW: 'পর্যালোচনায়',
  APPROVED: 'অনুমোদিত',
  PROCESSING: 'প্রসেসিং',
  PAID: 'পেমেন্ট সম্পন্ন',
  REJECTED: 'প্রত্যাখ্যাত',
  OPEN: 'খোলা',
  IN_PROGRESS: 'প্রক্রিয়াধীন',
  REVIEWING: 'পর্যালোচনায়',
  RESOLVED: 'সমাধানকৃত',
  FALSE_POSITIVE: 'ভুল সংকেত',
  SUPER_ADMIN: 'সুপার অ্যাডমিন',
  ADMIN: 'অ্যাডমিন',
  SUPPORT: 'সাপোর্ট'
};

const statusLabel = (val) => labels[val] || val || unavailable;
const formatMoney = (val) => (val === null || val === undefined ? unavailable : `৳${Number(val).toFixed(2)}`);
const formatCount = (val) => (val === null || val === undefined ? unavailable : Number(val).toLocaleString('bn-BD'));
const maskDestination = (val) => {
  if (!val) return unavailable;
  if (val.length <= 5) return `${val.slice(0, 1)}•••`;
  return `${val.slice(0, 3)}••••${val.slice(-2)}`;
};

// Dedicated Admin Login View (Rendered strictly when unauthenticated)
function AdminLoginView({ onLogin, error, setError, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    onLogin(email.trim(), password);
  }

  return (
    <div className="login-screen-wrap">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-title">
            <span>FA AGENCY</span>
            <b>™</b>
          </div>
          <span className="brand-badge">EARN ADMIN</span>
        </div>
        <h2 className="login-title">সুরক্ষিত অ্যাডমিন পোর্টাল</h2>
        <p className="login-subtitle">সেন্ট্রাল অপারেশনাল ড্যাশবোর্ডে প্রবেশ করতে লগইন করুন</p>

        {error && (
          <div className="login-alert danger">
            <span>{error}</span>
            <button type="button" className="alert-close" onClick={() => setError('')}>✕</button>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-email">ইমেইল ঠিকানা</label>
            <input
              id="admin-email"
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fa-agency.local"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">পাসওয়ার্ড</label>
            <input
              id="admin-password"
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading || !email || !password}
          >
            {loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন →'}
          </button>
        </form>

        <div className="login-footer-note">
          <span>🔒 এন্ড-টু-এন্ড এনক্রিপ্টেড সেশন ও কেন্দ্রীয় RBAC দ্বারা সুরক্ষিত</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('fae_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fae_admin_user') || 'null');
    } catch (_) {
      return null;
    }
  });
  const [tab, setTab] = useState('dashboard');
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Reason / Confirmation Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    title: '',
    promptLabel: '',
    required: true,
    value: '',
    onConfirm: null
  });

  async function request(path, options = {}) {
    const currentToken = token || localStorage.getItem('fae_admin_token') || '';
    if (!currentToken) {
      handleLogout('অ্যাডমিন অ্যাক্সেসের জন্য লগইন করুন।');
      throw new Error('অ্যাডমিন অ্যাক্সেসের জন্য লগইন করুন।');
    }

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
          ...(options.headers || {})
        }
      });
      const body = await response.json().catch(() => ({}));

      if (response.status === 401) {
        const isExpired = body.error?.includes('সেশন শেষ') || body.error?.includes('expired');
        const msg = isExpired
          ? 'আপনার অ্যাডমিন সেশন শেষ হয়েছে। আবার লগইন করুন।'
          : (body.error || 'অ্যাডমিন অ্যাক্সেসের জন্য লগইন করুন।');
        handleLogout(msg);
        throw new Error(msg);
      }

      if (response.status === 403) {
        throw new Error(body.error || 'অ্যাডমিন অ্যাক্সেসের জন্য লগইন করুন।');
      }

      if (!response.ok) {
        throw new Error(body.error || 'অনুরোধ সম্পন্ন করা যায়নি।');
      }
      return body;
    } catch (err) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        throw new Error('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। API চালু আছে কিনা পরীক্ষা করুন।');
      }
      throw err;
    }
  }

  function handleLogout(msg = '') {
    localStorage.removeItem('fae_admin_token');
    localStorage.removeItem('fae_admin_user');
    setToken('');
    setAdminUser(null);
    setTab('dashboard');
    setError('');
    setSuccessNotice('');
    if (msg) setLoginError(msg);
  }

  async function handleLogin(email, password) {
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'ইমেইল/পাসওয়ার্ড সঠিক নয়।');
      }
      localStorage.setItem('fae_admin_token', data.token);
      if (data.admin) {
        localStorage.setItem('fae_admin_user', JSON.stringify(data.admin));
        setAdminUser(data.admin);
      }
      setToken(data.token);
      setLoginError('');
      setTab('dashboard');
    } catch (err) {
      setLoginError(err.message || 'ইমেইল/পাসওয়ার্ড সঠিক নয়।');
    } finally {
      setLoginLoading(false);
    }
  }

  function promptAction(config) {
    setActionModal({
      isOpen: true,
      title: config.title || 'অনুরোধ নিশ্চিতকরণ',
      promptLabel: config.promptLabel || 'কারণ লিখুন:',
      required: config.required ?? true,
      value: '',
      onConfirm: async (val) => {
        setActionModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await config.onProceed(val);
          setSuccessNotice(config.successMessage || 'কার্যক্রম সফল হয়েছে।');
          setTimeout(() => setSuccessNotice(''), 3000);
        } catch (err) {
          setError(err.message || 'কার্যক্রম ব্যর্থ হয়েছে।');
        }
      }
    });
  }

  // Strict Unauthenticated Access Guard
  if (!token) {
    return (
      <AdminLoginView
        onLogin={handleLogin}
        error={loginError}
        setError={setLoginError}
        loading={loginLoading}
      />
    );
  }

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-title">
            <span>FA AGENCY</span>
            <b>™</b>
          </div>
          <span className="brand-badge">EARN ADMIN</span>
        </div>
        <div className="side-caption">সেন্ট্রাল অপারেশন কন্ট্রোল</div>
        <nav className="side-nav">
          {tabs.map(([key, label, icon]) => (
            <button
              key={key}
              className={`nav-item ${tab === key ? 'active' : ''}`}
              onClick={() => { setTab(key); setError(''); }}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-footer">
          <div className="user-profile-badge">
            <div className="user-profile-avatar">👤</div>
            <div className="user-profile-info">
              <strong className="user-profile-name">{adminUser?.name || 'অ্যাডমিন'}</strong>
              <small className="user-profile-role">{statusLabel(adminUser?.role || 'ADMIN')}</small>
            </div>
          </div>
          <button className="logout-side-btn" onClick={() => handleLogout('সফলভাবে লগআউট হয়েছে।')}>
            🚪 লগআউট
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">FA AGENCY™ EARN / ADMINISTRATIVE SUITE</p>
            <h1>{tabs.find(([key]) => key === tab)?.[1]}</h1>
          </div>
          <div className="top-actions">
            <span className="connection-pill online">
              🟢 {adminUser?.name || 'অনুমোদিত অ্যাডমিন'} ({statusLabel(adminUser?.role || 'ADMIN')})
            </span>
            <button className="logout-top-btn" onClick={() => handleLogout('সফলভাবে লগআউট হয়েছে।')}>
              লগআউট
            </button>
          </div>
        </header>

        {/* Global Alerts */}
        {error && (
          <div className="alert-box danger">
            <span>{error}</span>
            <button className="alert-close" onClick={() => setError('')}>✕</button>
          </div>
        )}
        {successNotice && (
          <div className="alert-box success">
            <span>{successNotice}</span>
            <button className="alert-close" onClick={() => setSuccessNotice('')}>✕</button>
          </div>
        )}

        {/* Tab Components */}
        {tab === 'dashboard' && <DashboardView request={request} onNavigate={setTab} />}
        {tab === 'users' && <UsersView request={request} promptAction={promptAction} />}
        {tab === 'withdrawals' && <WithdrawalsView request={request} promptAction={promptAction} />}
        {tab === 'funds' && <FundCenterView request={request} promptAction={promptAction} />}
        {tab === 'fraud' && <FraudView request={request} promptAction={promptAction} />}
        {tab === 'tasks' && <TasksView request={request} promptAction={promptAction} />}
        {tab === 'support' && <SupportView request={request} promptAction={promptAction} />}
        {tab === 'audit' && <AuditView request={request} />}
      </main>

      {/* Global Reason & Confirmation Modal */}
      {actionModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setActionModal((p) => ({ ...p, isOpen: false }))}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{actionModal.title}</h3>
            <p className="modal-prompt">{actionModal.promptLabel}</p>
            <textarea
              className="modal-input"
              rows="3"
              value={actionModal.value}
              onChange={(e) => setActionModal((p) => ({ ...p, value: e.target.value }))}
              placeholder="বিস্তারিত কারণ লিখুন..."
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={() => setActionModal((p) => ({ ...p, isOpen: false }))}
              >
                বাতিল
              </button>
              <button
                className="modal-confirm-btn"
                disabled={actionModal.required && actionModal.value.trim().length < 3}
                onClick={() => actionModal.onConfirm(actionModal.value.trim())}
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 1. Dashboard View
function DashboardView({ request, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      setData(await request('/api/admin/dashboard'));
    } catch (e) {
      setErr(e.message || 'ড্যাশবোর্ড ডেটা লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading-state">তথ্য লোড হচ্ছে...</div>;
  if (err) return <div className="alert-box danger">{err}</div>;
  if (!data) return null;

  const cards = [
    ['মোট ব্যবহারকারী', data.totalUsers, 'count'],
    ['সক্রিয় ব্যবহারকারী', data.activeUsers, 'count'],
    ['সীমাবদ্ধ ব্যবহারকারী', data.restrictedUsers, 'count'],
    ['স্থগিত ব্যবহারকারী', data.suspendedUsers, 'count'],
    ['বন্ধ ব্যবহারকারী', data.closedUsers, 'count'],
    ['মোট রিওয়ার্ড প্রদান', data.totalRewards, 'money'],
    ['অপেক্ষমাণ উত্তোলন', data.pendingWithdrawals?.count, 'count'],
    ['পর্যালোচনায় উত্তোলন', data.underReviewWithdrawals?.count, 'count'],
    ['পেইড উত্তোলন', data.paidWithdrawals?.count, 'count'],
    ['প্রত্যাখ্যাত উত্তোলন', data.rejectedWithdrawals?.count, 'count'],
    ['ওপেন ফ্রড সংকেত', data.openFraudEvents, 'count'],
    ['হাই / ক্রিটিক্যাল ঝুঁকি', data.highRiskEvents, 'count']
  ];

  return (
    <section>
      <div className="section-head-bar">
        <div>
          <h2>সিস্টেম ও আর্থিক অবস্থা</h2>
          <span className="sub-note">রিয়েল-টাইম কেন্দ্রীয় ডেটাবেজ রিপোর্ট</span>
        </div>
        <button className="refresh-btn" onClick={load}>🔄 রিফ্রেশ</button>
      </div>

      <div className="metrics-grid">
        {cards.map(([label, value, type]) => (
          <div className="metric-card" key={label}>
            <span className="metric-label">{label}</span>
            <strong className="metric-value">
              {type === 'money' ? formatMoney(value) : formatCount(value)}
            </strong>
          </div>
        ))}
      </div>

      <div className="split-panels">
        <div className="panel-card">
          <div className="panel-header">
            <h3>আর্থিক উত্তোলন পরিস্থিতি</h3>
            <button className="text-btn" onClick={() => onNavigate('withdrawals')}>সব দেখুন →</button>
          </div>
          <div className="compact-stat-row">
            <span>অপেক্ষমাণ পরিমাণ:</span>
            <strong>{formatMoney(data.pendingWithdrawals?.amount)}</strong>
          </div>
          <div className="compact-stat-row">
            <span>পেইড পরিমাণ:</span>
            <strong>{formatMoney(data.paidWithdrawals?.amount)}</strong>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>নিরাপত্তা ও অ্যান্টি-ফ্রড</h3>
            <button className="text-btn" onClick={() => onNavigate('fraud')}>সব দেখুন →</button>
          </div>
          <div className="compact-stat-row">
            <span>ক্রিটিক্যাল ফ্রড সংকেত:</span>
            <strong className="risk-text-critical">{data.criticalRiskEvents || 0} টি</strong>
          </div>
          <div className="compact-stat-row">
            <span>আজকের নতুন ইউজার:</span>
            <strong>{formatCount(data.newUsersToday)} জন</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

// 2. Users View with Search, Pagination, Detail Drawer & Status Transition
function UsersView({ request, promptAction }) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [query, setQuery] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  async function loadUsers(p = 1, q = query) {
    setLoading(true);
    try {
      const res = await request(`/api/admin/users?page=${p}&limit=20&q=${encodeURIComponent(q)}`);
      setUsers(res.users || []);
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (_e) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(1, query); }, [query]);

  function handleSearch(e) {
    e.preventDefault();
    setQuery(searchDraft.trim());
  }

  async function openUserDetail(u) {
    setDrawerLoading(true);
    setSelectedUser({ user: u });
    try {
      const full = await request(`/api/admin/users/${u._id}`);
      setSelectedUser(full);
    } catch (_e) {
      // keep basic
    } finally {
      setDrawerLoading(false);
    }
  }

  function handleStatusChange(user, targetStatus) {
    const isRestricting = ['RESTRICTED', 'SUSPENDED', 'CLOSED'].includes(targetStatus);
    promptAction({
      title: `অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন: ${statusLabel(targetStatus)}`,
      promptLabel: isRestricting
        ? `অ্যাকাউন্ট ${statusLabel(targetStatus)} করার বাধ্যতামূলক কারণ লিখুন (ন্যূনতম ৩ অক্ষর):`
        : 'স্ট্যাটাস সক্রিয় করার বিবরণ বা নোট লিখুন:',
      required: isRestricting,
      onProceed: async (reason) => {
        await request(`/api/admin/users/${user._id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: targetStatus, reason })
        });
        loadUsers(pagination.page);
        if (selectedUser?.user?._id === user._id) {
          setSelectedUser((prev) => ({
            ...prev,
            user: { ...prev.user, status: targetStatus }
          }));
        }
      },
      successMessage: `ব্যবহারকারীর স্ট্যাটাস সফলভাবে ${statusLabel(targetStatus)} করা হয়েছে।`
    });
  }

  return (
    <section>
      <div className="section-head-bar">
        <div>
          <h2>ব্যবহারকারী নিয়ন্ত্রণ ও প্রোফাইল</h2>
          <span className="sub-note">মোট: {formatCount(pagination.total)} জন</span>
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="UID / ইউজারনেম / টেলিগ্রাম আইডি..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
          />
          <button type="submit" className="search-btn">🔍 খুঁজুন</button>
        </form>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ইন্টারনাল UID</th>
              <th>নাম ও টেলিগ্রাম আইডি</th>
              <th>স্ট্যাটাস</th>
              <th>ঝুঁকি স্কোর</th>
              <th>তৈরির তারিখ</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <button className="link-text-btn" onClick={() => openUserDetail(u)}>
                    {u.internalUid || u.uid}
                  </button>
                </td>
                <td>
                  <strong>{[u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '—'}</strong>
                  <div className="cell-sub">ID: {u.telegramId} {u.username ? `(@${u.username})` : ''}</div>
                </td>
                <td>
                  <span className={`status-pill status-${(u.status || 'ACTIVE').toLowerCase()}`}>
                    {statusLabel(u.status)}
                  </span>
                </td>
                <td>
                  <span className={`risk-pill risk-${(u.riskLevel || 'LOW').toLowerCase()}`}>
                    {u.riskLevel || 'LOW'} ({u.fraudScore || 0})
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString('bn-BD')}</td>
                <td>
                  <div className="action-button-row">
                    {['ACTIVE', 'RESTRICTED', 'SUSPENDED', 'CLOSED'].filter((s) => s !== u.status).map((s) => (
                      <button
                        key={s}
                        className={`table-action-btn ${['SUSPENDED', 'CLOSED'].includes(s) ? 'danger' : ''}`}
                        onClick={() => handleStatusChange(u, s)}
                      >
                        {statusLabel(s)}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && users.length === 0 && (
          <div className="table-empty">কোনো ব্যবহারকারী পাওয়া যায়নি।</div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-bar">
        <span>পৃষ্ঠা {pagination.page} / {pagination.pages}</span>
        <div className="page-buttons">
          <button
            disabled={pagination.page <= 1}
            onClick={() => loadUsers(pagination.page - 1)}
          >
            ← পূর্ববর্তী
          </button>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => loadUsers(pagination.page + 1)}
          >
            পরবর্তী →
          </button>
        </div>
      </div>

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="drawer-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <h2>{selectedUser.user?.firstName || 'ইউজার প্রোফাইল'}</h2>
                <span className="drawer-sub">{selectedUser.user?.internalUid || selectedUser.user?.uid}</span>
              </div>
              <button className="close-btn" onClick={() => setSelectedUser(null)}>✕</button>
            </div>

            {drawerLoading ? (
              <p className="loading-state">বিস্তারিত লোড হচ্ছে...</p>
            ) : (
              <div className="drawer-body">
                {/* Balance Grid */}
                <div className="drawer-section">
                  <h4>ওয়ালেট স্থিতি</h4>
                  <div className="drawer-grid">
                    <div><span>উপলব্ধ ব্যালেন্স:</span> <strong>{formatMoney(selectedUser.wallet?.availableBalance)}</strong></div>
                    <div><span>অপেক্ষমাণ ব্যালেন্স:</span> <strong>{formatMoney(selectedUser.wallet?.pendingBalance)}</strong></div>
                    <div><span>মোট অর্জিত আয়:</span> <strong>{formatMoney(selectedUser.wallet?.lifetimeEarned)}</strong></div>
                    <div><span>মোট উত্তোলন:</span> <strong>{formatMoney(selectedUser.wallet?.lifetimeWithdrawn)}</strong></div>
                  </div>
                </div>

                {/* Status Transitions in Drawer */}
                <div className="drawer-section">
                  <h4>অ্যাকাউন্ট স্ট্যাটাস অ্যাকশন</h4>
                  <div className="action-button-row">
                    {['ACTIVE', 'RESTRICTED', 'SUSPENDED', 'CLOSED'].map((s) => (
                      <button
                        key={s}
                        disabled={selectedUser.user?.status === s}
                        className={`table-action-btn ${['SUSPENDED', 'CLOSED'].includes(s) ? 'danger' : ''}`}
                        onClick={() => handleStatusChange(selectedUser.user, s)}
                      >
                        {statusLabel(s)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* History Lists */}
                <div className="drawer-section">
                  <h4>সাম্প্রতিক আর্থিক আয় ({selectedUser.earnings?.length || 0})</h4>
                  {selectedUser.earnings?.slice(0, 5).map((tx) => (
                    <div className="drawer-compact-item" key={tx._id}>
                      <span>{tx.type}</span>
                      <strong>+{formatMoney(tx.amount)}</strong>
                      <small>{new Date(tx.createdAt).toLocaleDateString('bn-BD')}</small>
                    </div>
                  ))}
                </div>

                <div className="drawer-section">
                  <h4>উত্তোলনের রেকর্ড ({selectedUser.withdrawals?.length || 0})</h4>
                  {selectedUser.withdrawals?.slice(0, 5).map((w) => (
                    <div className="drawer-compact-item" key={w._id}>
                      <span>{w.method} ({maskDestination(w.destination)})</span>
                      <strong>{formatMoney(w.amount)}</strong>
                      <span className={`status-pill status-${w.status.toLowerCase()}`}>{statusLabel(w.status)}</span>
                    </div>
                  ))}
                </div>

                <div className="drawer-section">
                  <h4>জালিয়াতি সংকেত ({selectedUser.fraudEvents?.length || 0})</h4>
                  {selectedUser.fraudEvents?.slice(0, 5).map((f) => (
                    <div className="drawer-compact-item" key={f._id}>
                      <span className={`risk-pill risk-${f.riskLevel.toLowerCase()}`}>{f.riskLevel}</span>
                      <span>{f.eventType}</span>
                      <small>{new Date(f.createdAt).toLocaleDateString('bn-BD')}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// 3. Withdrawals View with Filter, Transition & Rejection Note
function WithdrawalsView({ request, promptAction }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  async function loadWithdrawals(p = 1) {
    setLoading(true);
    try {
      const res = await request(`/api/admin/withdrawals?page=${p}&limit=20`);
      setWithdrawals(res.withdrawals || []);
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (_e) {
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadWithdrawals(1); }, []);

  async function openDetail(w) {
    try {
      const res = await request(`/api/admin/withdrawals/${w._id}`);
      setSelectedWithdrawal(res);
    } catch (e) {
      alert(e.message || 'উত্তোলনের তথ্য লোড করা যায়নি।');
    }
  }

  function handleTransition(withdrawal, targetStatus) {
    const isRejecting = targetStatus === 'REJECTED';
    promptAction({
      title: `উত্তোলন স্ট্যাটাস পরিবর্তন: ${statusLabel(targetStatus)}`,
      promptLabel: isRejecting
        ? 'প্রত্যাখ্যানের কারণ লিখুন (বাধ্যতামূলক, ন্যূনতম ৩ অক্ষর):'
        : 'নোট বা মন্তব্যের বিবরণ (ঐচ্ছিক):',
      required: isRejecting,
      onProceed: async (note) => {
        await request(`/api/admin/withdrawals/${withdrawal._id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: targetStatus, note })
        });
        loadWithdrawals(pagination.page);
        if (selectedWithdrawal?.withdrawal?._id === withdrawal._id) {
          setSelectedWithdrawal(null);
        }
      },
      successMessage: `উত্তোলন সফলভাবে ${statusLabel(targetStatus)} করা হয়েছে।`
    });
  }

  const filtered = statusFilter
    ? withdrawals.filter((w) => w.status === statusFilter)
    : withdrawals;

  return (
    <section>
      <div className="section-head-bar">
        <div>
          <h2>আর্থিক উত্তোলন রিভিউ ও প্রসেসিং</h2>
          <span className="sub-note">মোট রেকর্ড: {formatCount(pagination.total)} টি</span>
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">সব স্ট্যাটাস</option>
            {Object.keys(statusTransitions).concat(['PAID', 'REJECTED']).map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
          <button className="refresh-btn" onClick={() => loadWithdrawals(pagination.page)}>🔄</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>রেফারেন্স</th>
              <th>ইউজার UID</th>
              <th>পরিমাণ</th>
              <th>পেমেন্ট মেথড</th>
              <th>স্ট্যাটাস</th>
              <th>তারিখ</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w._id}>
                <td>
                  <button className="link-text-btn" onClick={() => openDetail(w)}>
                    {w.referenceId || w._id}
                  </button>
                </td>
                <td>{w.userId?.uid || w.userId?.internalUid || '—'}</td>
                <td><strong>{formatMoney(w.amount)}</strong></td>
                <td>
                  {w.method}
                  <div className="cell-sub">{maskDestination(w.destination)}</div>
                </td>
                <td>
                  <span className={`status-pill status-${w.status.toLowerCase()}`}>
                    {statusLabel(w.status)}
                  </span>
                </td>
                <td>{new Date(w.createdAt).toLocaleString('bn-BD')}</td>
                <td>
                  <div className="action-button-row">
                    {(statusTransitions[w.status] || []).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        className={`table-action-btn ${nextStatus === 'REJECTED' ? 'danger' : ''}`}
                        onClick={() => handleTransition(w, nextStatus)}
                      >
                        {statusLabel(nextStatus)}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="table-empty">কোনো উত্তোলনের তথ্য পাওয়া যায়নি।</div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-bar">
        <span>পৃষ্ঠা {pagination.page} / {pagination.pages}</span>
        <div className="page-buttons">
          <button
            disabled={pagination.page <= 1}
            onClick={() => loadWithdrawals(pagination.page - 1)}
          >
            ← পূর্ববর্তী
          </button>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => loadWithdrawals(pagination.page + 1)}
          >
            পরবর্তী →
          </button>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedWithdrawal && (
        <div className="drawer-backdrop" onClick={() => setSelectedWithdrawal(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <h2>উত্তোলন পর্যালোচনা</h2>
                <span className="drawer-sub">{selectedWithdrawal.withdrawal?.referenceId}</span>
              </div>
              <button className="close-btn" onClick={() => setSelectedWithdrawal(null)}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <h4>মূল তথ্য</h4>
                <div className="drawer-grid">
                  <div><span>ব্যবহারকারী:</span> <strong>{selectedWithdrawal.withdrawal?.userId?.uid}</strong></div>
                  <div><span>অ্যাকাউন্ট স্ট্যাটাস:</span> <strong>{statusLabel(selectedWithdrawal.withdrawal?.userId?.status)}</strong></div>
                  <div><span>পরিমাণ:</span> <strong>{formatMoney(selectedWithdrawal.withdrawal?.amount)}</strong></div>
                  <div><span>মাধ্যম:</span> <strong>{selectedWithdrawal.withdrawal?.method} ({maskDestination(selectedWithdrawal.withdrawal?.destination)})</strong></div>
                  <div><span>বর্তমান স্ট্যাটাস:</span> <span className={`status-pill status-${selectedWithdrawal.withdrawal?.status?.toLowerCase()}`}>{statusLabel(selectedWithdrawal.withdrawal?.status)}</span></div>
                  <div><span>নোট:</span> <strong>{selectedWithdrawal.withdrawal?.note || '—'}</strong></div>
                </div>
              </div>

              <div className="drawer-section">
                <h4>অবস্থা রূপান্তর</h4>
                <div className="action-button-row">
                  {(statusTransitions[selectedWithdrawal.withdrawal?.status] || []).map((nextStatus) => (
                    <button
                      key={nextStatus}
                      className={`table-action-btn ${nextStatus === 'REJECTED' ? 'danger' : ''}`}
                      onClick={() => handleTransition(selectedWithdrawal.withdrawal, nextStatus)}
                    >
                      {statusLabel(nextStatus)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="drawer-section">
                <h4>ব্যবহারকারীর পূর্ববর্তী উত্তোলনসমূহ</h4>
                {selectedWithdrawal.withdrawalHistory?.slice(0, 4).map((item) => (
                  <div className="drawer-compact-item" key={item._id}>
                    <span>{item.method}</span>
                    <strong>{formatMoney(item.amount)}</strong>
                    <span className={`status-pill status-${item.status.toLowerCase()}`}>{statusLabel(item.status)}</span>
                  </div>
                ))}
              </div>

              <div className="drawer-section">
                <h4>ঝুঁকি সংকেত (Fraud Signals)</h4>
                {selectedWithdrawal.fraudSignals?.length > 0 ? (
                  selectedWithdrawal.fraudSignals.slice(0, 4).map((f) => (
                    <div className="drawer-compact-item" key={f._id}>
                      <span className={`risk-pill risk-${f.riskLevel.toLowerCase()}`}>{f.riskLevel}</span>
                      <span>{f.eventType}</span>
                      <small>{new Date(f.createdAt).toLocaleDateString('bn-BD')}</small>
                    </div>
                  ))
                ) : (
                  <p className="empty-sub">কোনো ঝুঁকি সংকেত নেই।</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// 4. Fund Center View (Platform Treasury, Balances, Liabilities & Ledger)
function FundCenterView({ request }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');

  async function load(p = page) {
    setLoading(true);
    setError('');
    try {
      const q = new URLSearchParams({ page: p, limit: 25 });
      if (typeFilter) q.set('type', typeFilter);
      if (directionFilter) q.set('direction', directionFilter);
      const res = await request(`/api/admin/fund-center?${q.toString()}`);
      setData(res);
      setPage(p);
    } catch (e) {
      setError(e.message || 'Fund Center তথ্য লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, [typeFilter, directionFilter]);

  if (loading && !data) return <div className="loading-state">Fund Center ডেটা লোড হচ্ছে...</div>;
  if (error && !data) return <div className="alert-box danger">{error}</div>;

  const treasury = data?.treasury || {};
  const summary = data?.withdrawalsSummary || {};
  const transactions = data?.recentTransactions || [];
  const pagination = data?.pagination || { page: 1, limit: 25, total: 0, pages: 1 };

  return (
    <section>
      <div className="section-head-bar">
        <div>
          <h2>Fund Center ও কেন্দ্রীয় ট্রেজারি</h2>
          <span className="sub-note">ব্যবহারকারীদের ওয়ালেট ব্যালেন্স, উত্তোলন দায়বদ্ধতা ও লেজার ট্র্যাকিং</span>
        </div>
        <button className="refresh-btn" onClick={() => load(page)}>🔄 রিফ্রেশ</button>
      </div>

      {/* Treasury Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">মোট ওয়ালেট ব্যালেন্স</span>
          <strong className="metric-value">{formatMoney(treasury.totalAvailableBalance)}</strong>
          <span className="cell-sub">ব্যবহারকারীদের তাৎক্ষণিক উত্তোলনযোগ্য তহবিল</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">মোট অপেক্ষমাণ ব্যালেন্স</span>
          <strong className="metric-value">{formatMoney(treasury.totalPendingBalance)}</strong>
          <span className="cell-sub">উত্তোলন প্রক্রিয়ায় লকড তহবিল</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">মোট অর্জিত প্ল্যাটফর্ম আয়</span>
          <strong className="metric-value">{formatMoney(treasury.totalLifetimeEarned)}</strong>
          <span className="cell-sub">সিস্টেম লাইফটাইম ইউজার রিওয়ার্ড</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">মোট পরিশোধিত উত্তোলন</span>
          <strong className="metric-value">{formatMoney(treasury.totalLifetimeWithdrawn)}</strong>
          <span className="cell-sub">সিস্টেম থেকে ক্যাশ-আউট সম্পন্ন</span>
        </div>
      </div>

      {/* Withdrawal Liabilities Breakdown */}
      <div className="panel-card" style={{ marginTop: '20px' }}>
        <div className="panel-header">
          <h3>উত্তোলন দায়বদ্ধতা ও স্ট্যাটাস সামারি</h3>
          <span className="brand-badge">মোট দায়: {formatMoney(summary.totalLiability)}</span>
        </div>
        <div className="fund-summary-grid">
          <div className="fund-summary-item">
            <span className="status-pill status-pending">অপেক্ষমাণ (Pending)</span>
            <div className="fund-stat-val">{formatMoney(summary.pending?.amount)}</div>
            <small>{summary.pending?.count || 0} টি অনুরোধ</small>
          </div>
          <div className="fund-summary-item">
            <span className="status-pill status-under_review">পর্যালোচনায় (Under Review)</span>
            <div className="fund-stat-val">{formatMoney(summary.underReview?.amount)}</div>
            <small>{summary.underReview?.count || 0} টি অনুরোধ</small>
          </div>
          <div className="fund-summary-item">
            <span className="status-pill status-approved">অনুমোদিত (Approved)</span>
            <div className="fund-stat-val">{formatMoney(summary.approved?.amount)}</div>
            <small>{summary.approved?.count || 0} টি অনুরোধ</small>
          </div>
          <div className="fund-summary-item">
            <span className="status-pill status-processing">প্রসেসিং (Processing)</span>
            <div className="fund-stat-val">{formatMoney(summary.processing?.amount)}</div>
            <small>{summary.processing?.count || 0} টি অনুরোধ</small>
          </div>
          <div className="fund-summary-item">
            <span className="status-pill status-paid">পেইড (Paid)</span>
            <div className="fund-stat-val">{formatMoney(summary.paid?.amount)}</div>
            <small>{summary.paid?.count || 0} টি অনুরোধ</small>
          </div>
          <div className="fund-summary-item">
            <span className="status-pill status-rejected">প্রত্যাখ্যাত (Rejected)</span>
            <div className="fund-stat-val">{formatMoney(summary.rejected?.amount)}</div>
            <small>{summary.rejected?.count || 0} টি অনুরোধ</small>
          </div>
        </div>
      </div>

      {/* Ledger Transactions Table */}
      <div className="section-head-bar" style={{ marginTop: '28px' }}>
        <div>
          <h3>কেন্দ্রীয় লেজার ট্রানজ্যাকশন হিস্ট্রি</h3>
          <span className="sub-note">অপরিবর্তনীয় আর্থিক খতিয়ান (মোট: {formatCount(pagination.total)} টি)</span>
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">সব ট্রানজ্যাকশন ধরন</option>
            <option value="AD_REWARD">বিজ্ঞাপন আয় (AD_REWARD)</option>
            <option value="TASK_REWARD">টাস্ক রিওয়ার্ড (TASK_REWARD)</option>
            <option value="DAILY_BONUS">দৈনিক বোনাস (DAILY_BONUS)</option>
            <option value="REFERRAL_REWARD">রেফারেল (REFERRAL_REWARD)</option>
            <option value="WITHDRAWAL">উত্তোলন (WITHDRAWAL)</option>
            <option value="WITHDRAWAL_REVERSAL">উত্তোলন রিভার্সাল</option>
          </select>
          <select
            className="filter-select"
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
          >
            <option value="">সব দিক</option>
            <option value="CREDIT">ক্রেডিট (+)</option>
            <option value="DEBIT">ডেবিট (-)</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>সময়</th>
              <th>ইউজার UID</th>
              <th>ধরন</th>
              <th>পরিমাণ</th>
              <th>পূর্বের ব্যালেন্স</th>
              <th>পরবর্তী ব্যালেন্স</th>
              <th>রেফারেন্স আইডি</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{new Date(tx.createdAt).toLocaleString('bn-BD')}</td>
                <td>{tx.userId?.uid || tx.userId?.internalUid || '—'}</td>
                <td><span className="entity-tag">{tx.type}</span></td>
                <td>
                  <strong className={tx.direction === 'CREDIT' ? 'credit-text' : 'debit-text'}>
                    {tx.direction === 'CREDIT' ? '+' : '-'}{formatMoney(tx.amount)}
                  </strong>
                </td>
                <td>{formatMoney(tx.balanceBefore)}</td>
                <td>{formatMoney(tx.balanceAfter)}</td>
                <td><code className="metadata-snippet">{tx.referenceId || tx.idempotencyKey || '—'}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && transactions.length === 0 && (
          <div className="table-empty">কোনো আর্থিক লেজার ট্রানজ্যাকশন পাওয়া যায়নি।</div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-bar">
        <span>পৃষ্ঠা {pagination.page} / {pagination.pages || 1}</span>
        <div className="page-buttons">
          <button
            disabled={pagination.page <= 1}
            onClick={() => load(pagination.page - 1)}
          >
            ← পূর্ববর্তী
          </button>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => load(pagination.page + 1)}
          >
            পরবর্তী →
          </button>
        </div>
      </div>
    </section>
  );
}

// 5. Fraud Center View
function FraudView({ request, promptAction }) {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState({ status: '', riskLevel: '' });
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (filter.status) q.set('status', filter.status);
      if (filter.riskLevel) q.set('riskLevel', filter.riskLevel);
      const res = await request(`/api/admin/fraud-events?${q.toString()}`);
      setEvents(res.events || []);
    } catch (_e) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEvents(); }, [filter]);

  function handleFraudAction(event, targetStatus) {
    const isResolving = ['RESOLVED', 'FALSE_POSITIVE'].includes(targetStatus);
    promptAction({
      title: `ফ্রড ইভেন্ট স্ট্যাটাস: ${statusLabel(targetStatus)}`,
      promptLabel: isResolving ? 'সমাধান বা সিদ্ধান্তের কারণ লিখুন (বাধ্যতামূলক):' : 'নোট লিখুন:',
      required: isResolving,
      onProceed: async (resolutionNote) => {
        await request(`/api/admin/fraud-events/${event._id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: targetStatus, resolutionNote })
        });
        loadEvents();
      },
      successMessage: `ফ্রড ইভেন্ট সফলভাবে ${statusLabel(targetStatus)} চিহ্নিত করা হয়েছে।`
    });
  }

  return (
    <section>
      <div className="section-head-bar">
        <div>
          <h2>Fraud Center ও ঝুঁকি ব্যবস্থাপনা</h2>
          <span className="sub-note">সংরক্ষিত ঝুঁকি ও অপব্যবহারের সংকেতসমূহ</span>
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">সব স্ট্যাটাস</option>
            {['OPEN', 'REVIEWING', 'RESOLVED', 'FALSE_POSITIVE'].map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filter.riskLevel}
            onChange={(e) => setFilter({ ...filter, riskLevel: e.target.value })}
          >
            <option value="">সব ঝুঁকি লেভেল</option>
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button className="refresh-btn" onClick={loadEvents}>🔄</button>
        </div>
      </div>

      <div className="event-cards-grid">
        {events.map((ev) => (
          <div className="event-card" key={ev._id}>
            <div className="event-head">
              <div>
                <strong>{ev.eventType}</strong>
                <div className="cell-sub">ইউজার UID: {ev.userId?.uid || ev.userId?.internalUid || unavailable}</div>
              </div>
              <div className="pill-wrap">
                <span className={`risk-pill risk-${ev.riskLevel.toLowerCase()}`}>{ev.riskLevel}</span>
                <span className={`status-pill status-${ev.status.toLowerCase()}`}>{statusLabel(ev.status)}</span>
              </div>
            </div>
            <p className="event-desc">{ev.description}</p>
            <small className="event-time">{new Date(ev.createdAt).toLocaleString('bn-BD')}</small>

            {ev.resolutionNote && (
              <div className="resolution-note">
                <strong>নিষ্পত্তির নোট:</strong> {ev.resolutionNote}
              </div>
            )}

            <details className="evidence-details">
              <summary>প্রমাণ ও মেটাডেটা দেখুন</summary>
              <pre>{JSON.stringify({ evidence: ev.evidence, metadata: ev.metadata }, null, 2)}</pre>
            </details>

            {['OPEN', 'REVIEWING'].includes(ev.status) && (
              <div className="event-actions">
                {ev.status === 'OPEN' && (
                  <button
                    className="table-action-btn"
                    onClick={() => handleFraudAction(ev, 'REVIEWING')}
                  >
                    পর্যালোচনায় নিন
                  </button>
                )}
                <button
                  className="table-action-btn"
                  onClick={() => handleFraudAction(ev, 'RESOLVED')}
                >
                  সমাধান করুন
                </button>
                <button
                  className="table-action-btn danger"
                  onClick={() => handleFraudAction(ev, 'FALSE_POSITIVE')}
                >
                  ভুল সংকেত
                </button>
              </div>
            )}
          </div>
        ))}
        {!loading && events.length === 0 && (
          <div className="table-empty">কোনো ফ্রড সংকেত পাওয়া যায়নি।</div>
        )}
      </div>
    </section>
  );
}

// 5. Tasks View (Admin Task Submissions Review)
function TasksView({ request, promptAction }) {
  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  async function loadSubmissions() {
    setLoading(true);
    try {
      const q = statusFilter ? `?status=${statusFilter}` : '';
      const res = await request(`/api/admin/task-submissions${q}`);
      setSubmissions(res.submissions || []);
    } catch (_e) {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSubmissions(); }, [statusFilter]);

  function handleReview(sub, nextStatus) {
    const isRejecting = nextStatus === 'REJECTED';
    promptAction({
      title: `টাস্ক ${statusLabel(nextStatus)}করণ`,
      promptLabel: isRejecting ? 'প্রত্যাখ্যানের কারণ লিখুন (ঐচ্ছিক):' : 'অনুমোদন নোট লিখুন:',
      required: false,
      onProceed: async (note) => {
        await request(`/api/admin/task-submissions/${sub._id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: nextStatus, note })
        });
        loadSubmissions();
      },
      successMessage: `টাস্ক সফলভাবে ${statusLabel(nextStatus)} করা হয়েছে।`
    });
  }

  return (
    <section>
      <div className="section-head-bar">
        <div>
          <h2>টাস্ক সাবমিশন ও ভেরিফিকেশন</h2>
          <span className="sub-note">ব্যবহারকারীদের সম্পন্নকৃত কাজের প্রমাণ যাচাই</span>
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">সব সাবমিশন</option>
            <option value="PENDING">অপেক্ষমাণ (Pending)</option>
            <option value="APPROVED">অনুমোদিত (Approved)</option>
            <option value="REJECTED">প্রত্যাখ্যাত (Rejected)</option>
          </select>
          <button className="refresh-btn" onClick={loadSubmissions}>🔄</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>টাস্ক শিরোনাম</th>
              <th>ইউজার UID</th>
              <th>পুরস্কার</th>
              <th>জমা দেওয়া প্রমাণ</th>
              <th>তারিখ</th>
              <th>স্ট্যাটাস</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub._id}>
                <td><strong>{sub.taskId?.title || 'টাস্ক'}</strong></td>
                <td>{sub.userId?.uid || '—'}</td>
                <td>{formatMoney(sub.taskId?.reward)}</td>
                <td>
                  <div className="proof-text">{sub.payload?.proof || '—'}</div>
                </td>
                <td>{new Date(sub.submittedAt).toLocaleDateString('bn-BD')}</td>
                <td>
                  <span className={`status-pill status-${sub.status.toLowerCase()}`}>
                    {statusLabel(sub.status)}
                  </span>
                </td>
                <td>
                  {sub.status === 'PENDING' ? (
                    <div className="action-button-row">
                      <button
                        className="table-action-btn"
                        onClick={() => handleReview(sub, 'APPROVED')}
                      >
                        অনুমোদন
                      </button>
                      <button
                        className="table-action-btn danger"
                        onClick={() => handleReview(sub, 'REJECTED')}
                      >
                        প্রত্যাখ্যান
                      </button>
                    </div>
                  ) : (
                    <small>{sub.reviewNote || 'পর্যালোচনা সম্পন্ন'}</small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && submissions.length === 0 && (
          <div className="table-empty">কোনো টাস্ক সাবমিশন পাওয়া যায়নি।</div>
        )}
      </div>
    </section>
  );
}

// 6. Support View (Admin Support Tickets Management)
function SupportView({ request, promptAction }) {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadTickets() {
    setLoading(true);
    try {
      const q = statusFilter ? `?status=${statusFilter}` : '';
      const res = await request(`/api/admin/support/tickets${q}`);
      setTickets(res.tickets || []);
    } catch (_e) {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTickets(); }, [statusFilter]);

  function handleReply(ticket) {
    promptAction({
      title: `সাপোর্ট টিকেটে উত্তর দিন: ${ticket.subject}`,
      promptLabel: 'ব্যবহারকারীকে প্রেরণের জন্য উত্তর লিখুন:',
      required: true,
      onProceed: async (adminReply) => {
        await request(`/api/admin/support/tickets/${ticket._id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'RESOLVED', adminReply })
        });
        loadTickets();
      },
      successMessage: 'সাপোর্ট টিকেটে সফলভাবে উত্তর দেওয়া হয়েছে এবং সমাধান করা হয়েছে।'
    });
  }

  return (
    <section>
      <div className="section-head-bar">
        <div>
          <h2>সহায়তা টিকেট ইনবক্স</h2>
          <span className="sub-note">ব্যবহারকারীদের সহায়তা অনুরোধ ব্যবস্থাপনা</span>
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">সব টিকেট</option>
            <option value="OPEN">খোলা (Open)</option>
            <option value="IN_PROGRESS">প্রক্রিয়াধীন</option>
            <option value="RESOLVED">সমাধানকৃত</option>
            <option value="CLOSED">বন্ধ</option>
          </select>
          <button className="refresh-btn" onClick={loadTickets}>🔄</button>
        </div>
      </div>

      <div className="ticket-admin-list">
        {tickets.map((t) => (
          <div className="ticket-admin-card" key={t._id}>
            <div className="ticket-admin-top">
              <div>
                <strong>{t.subject}</strong>
                <div className="cell-sub">ইউজার UID: {t.userId?.uid || '—'}</div>
              </div>
              <span className={`status-pill status-${t.status.toLowerCase()}`}>
                {statusLabel(t.status)}
              </span>
            </div>
            <p className="ticket-admin-msg">{t.message}</p>
            <small className="cell-sub">{new Date(t.createdAt).toLocaleString('bn-BD')}</small>

            {t.adminReply && (
              <div className="admin-reply-box">
                <strong>প্রেরিত উত্তর:</strong>
                <p>{t.adminReply}</p>
              </div>
            )}

            {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
              <div className="ticket-action-bar">
                <button className="primary-btn" onClick={() => handleReply(t)}>
                  💬 উত্তর দিন ও সমাধান করুন
                </button>
              </div>
            )}
          </div>
        ))}
        {!loading && tickets.length === 0 && (
          <div className="table-empty">কোনো সহায়তা টিকেট পাওয়া যায়নি।</div>
        )}
      </div>
    </section>
  );
}

// 7. Audit View (Audit Logs Traceability)
function AuditView({ request }) {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, pages: 1 });
  const [entityType, setEntityType] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadLogs(p = 1) {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: p, limit: 30 });
      if (entityType) q.set('entityType', entityType);
      const res = await request(`/api/admin/audit-logs?${q.toString()}`);
      setLogs(res.logs || []);
      setPagination(res.pagination || { page: 1, limit: 30, total: 0, pages: 1 });
    } catch (_e) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLogs(1); }, [entityType]);

  return (
    <section>
      <div className="section-head-bar">
        <div>
          <h2>অডিট লগ ও ট্রেসেবিলিটি</h2>
          <span className="sub-note">অপরিবর্তনীয় ও সুরক্ষিত অ্যাডমিন কার্যকলাপের প্রমাণ</span>
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          >
            <option value="">সব এন্টিটি</option>
            <option value="User">User</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="FraudEvent">FraudEvent</option>
            <option value="TaskSubmission">TaskSubmission</option>
            <option value="SupportTicket">SupportTicket</option>
          </select>
          <button className="refresh-btn" onClick={() => loadLogs(pagination.page)}>🔄</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>সময়</th>
              <th>অ্যাকশন</th>
              <th>পারফর্মার (অভিনেতা)</th>
              <th>টার্গেট এন্টিটি</th>
              <th>বিবরণ ও মেটাডেটা</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{new Date(log.createdAt).toLocaleString('bn-BD')}</td>
                <td><strong>{log.action}</strong></td>
                <td>{log.actorUserId?.uid || log.actorUserId?.username || 'সিস্টেম'}</td>
                <td>
                  <span className="entity-tag">{log.entityType}</span>
                  <div className="cell-sub">{log.entityId}</div>
                </td>
                <td>
                  <code className="metadata-snippet">{JSON.stringify(log.details || {})}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && logs.length === 0 && (
          <div className="table-empty">কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।</div>
        )}
      </div>

      <div className="pagination-bar">
        <span>পৃষ্ঠা {pagination.page} / {pagination.pages}</span>
        <div className="page-buttons">
          <button
            disabled={pagination.page <= 1}
            onClick={() => loadLogs(pagination.page - 1)}
          >
            ← পূর্ববর্তী
          </button>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => loadLogs(pagination.page + 1)}
          >
            পরবর্তী →
          </button>
        </div>
      </div>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
