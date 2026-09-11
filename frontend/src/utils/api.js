const API_BASE = '/api';

// Token quan tri giu trong sessionStorage: dong tab la mat, khong dinh len may khach
const KEY_TOKEN = 'cameratd_admin_token';
export const adminToken = {
  get: () => { try { return sessionStorage.getItem(KEY_TOKEN); } catch { return null; } },
  set: (t) => { try { sessionStorage.setItem(KEY_TOKEN, t); } catch { /* trinh duyet chan */ } },
  clear: () => { try { sessionStorage.removeItem(KEY_TOKEN); } catch { /* trinh duyet chan */ } }
};

// Goi API kem token, tu bao loi neu phien het han
export const apiAdmin = async (duongDan, tuyChon = {}) => {
  const res = await fetch(`${API_BASE}${duongDan}`, {
    ...tuyChon,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken.get() || ''}`,
      ...(tuyChon.headers || {})
    }
  });
  if (res.status === 401) {
    adminToken.clear();
    throw new Error('Phiên đăng nhập đã hết, vui lòng đăng nhập lại');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Thao tác thất bại');
  return data;
};

export const formatPrice = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
    return res.json();
  },

  // Quan tri
  async login(password) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
    adminToken.set(data.token);
    return data;
  },

  async checkLogin() {
    if (!adminToken.get()) return false;
    try { await apiAdmin('/admin/check'); return true; } catch { return false; }
  },

  async logout() {
    try { await apiAdmin('/admin/logout', { method: 'POST' }); } catch { /* het han roi */ }
    adminToken.clear();
  },

  // Cai dat trang (thanh chay + anh banner)
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Không tải được cài đặt');
    return res.json();
  },

  saveSettings: (data) => apiAdmin('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Anh: gui base64, server ghi ra file va tra ve duong dan
  uploadImage: (dataUrl, name) =>
    apiAdmin('/upload', { method: 'POST', body: JSON.stringify({ data: dataUrl, name }) }),

  // Nhat ky thi cong
  createProject: (data) => apiAdmin('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => apiAdmin(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => apiAdmin(`/projects/${id}`, { method: 'DELETE' }),

  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Không thể tải nhật ký thi công');
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Không thể tải chi tiết sản phẩm');
    return res.json();
  },

  async createProduct(data) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Không thể thêm sản phẩm');
    return res.json();
  },

  async updateProduct(id, data) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Không thể cập nhật sản phẩm');
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Không thể xóa sản phẩm');
    return res.json();
  },

  // Categories & Brands
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },

  async getBrands() {
    const res = await fetch(`${API_BASE}/brands`);
    return res.json();
  },

  // Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  }
};
