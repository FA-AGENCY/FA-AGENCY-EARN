const API_HOST = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://api.fa-agency.online';
const API_BASE_URL = String(API_HOST).replace(/\/$/, '').endsWith('/api')
  ? String(API_HOST).replace(/\/$/, '')
  : `${String(API_HOST).replace(/\/$/, '')}/api`;

class ApiService {
  constructor() {
    this.inFlightRequests = new Set();
  }

  getAuthHeaders() {
    const initData = window.Telegram?.WebApp?.initData || '';
    const token = localStorage.getItem('token') || '';
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      'x-telegram-init-data': initData
    };
  }

  async request(endpoint, options = {}) {
    const requestKey = `${options.method || 'GET'}:${endpoint}`;
    if (this.inFlightRequests.has(requestKey)) {
      throw new Error('দয়া করে অপেক্ষা করুন, রিকোয়েস্ট প্রক্রিয়াধীন রয়েছে।');
    }

    this.inFlightRequests.add(requestKey);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...(options.headers || {})
        }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error || 'সার্ভার সমস্যা দেখা দিয়েছে।');
      }
      return data;
    } finally {
      this.inFlightRequests.delete(requestKey);
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body || {})
    });
  }

  async authenticateTelegram() {
    const initData = window.Telegram?.WebApp?.initData || '';
    if (!initData) return null;
    const data = await this.post('/auth/telegram', { initData });
    if (data?.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  }
}

export default new ApiService();
