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

// Anh/video giai tri: file tren Cloudinary thi chen bien doi vao sau "/upload/" la Cloudinary
// tu cat, nen, doi dinh dang. File luu tren may (chua co Cloudinary) thi dung nguyen goc.
const laCloudinary = (m) => m.url.includes('/upload/');
const bienDoi = (m, thamSo, duoiMoi) => {
  const url = m.url.replace('/upload/', `/upload/${thamSo}/`);
  return duoiMoi ? url.replace(/\.\w+$/, duoiMoi) : url;
};

// Video luu tren may khong co anh bia -> tra null, noi dung tu lay khung hinh dau cua video
export const anhNho = (m, rong = 440, tiLe = 0.75) => {
  if (!laCloudinary(m)) return m.loai === 'video' ? null : m.url;
  const cat = `c_fill,w_${rong},h_${Math.round(rong * tiLe)},q_auto`;
  return m.loai === 'video' ? bienDoi(m, `so_0,${cat}`, '.jpg') : bienDoi(m, `${cat},f_auto`);
};

// Ban xem truoc tren the story: cat doc 9:16, 6 giay dau, bo tieng -> nhe, tu chay duoc
export const videoNgan = (m) =>
  laCloudinary(m) ? bienDoi(m, 'c_fill,w_360,h_640,du_6,ac_none,q_auto', '.mp4') : m.url;

// Video quay iPhone hay la .mov (HEVC), Chrome tren Windows khong phat duoc -> Cloudinary doi sang mp4
export const xemDay = (m) => {
  if (!laCloudinary(m)) return m.url;
  return m.loai === 'video' ? bienDoi(m, 'q_auto', '.mp4') : bienDoi(m, 'c_limit,w_1600,q_auto,f_auto');
};

// "2026-09-15" -> "15/09/2026", ngan = true -> "15/09"
export const ngayVN = (ngay, ngan = false) => {
  const [nam, thang, ngayThang] = String(ngay).split('-');
  return ngan ? `${ngayThang}/${thang}` : `${ngayThang}/${thang}/${nam}`;
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
  async login(taiKhoan, password) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taiKhoan, password })
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

  // Giai tri (hau truong thi cong)
  async getGiaiTri() {
    const res = await fetch(`${API_BASE}/giai-tri`);
    if (!res.ok) throw new Error('Không tải được ảnh/video');
    return res.json();
  },

  getGiaiTriQuanTri: () => apiAdmin('/giai-tri'),   // kem token -> server bo qua cache
  cheDoGiaiTri: () => apiAdmin('/giai-tri/che-do'),
  suaGiaiTri: (bai) => apiAdmin('/giai-tri', { method: 'PUT', body: JSON.stringify(bai) }),
  xoaGiaiTri: (id, loai) => apiAdmin('/giai-tri', { method: 'DELETE', body: JSON.stringify({ id, loai }) }),

  // bai = { chuThich, ngay }. Server tra ve cach tai len:
  //  - co chu ky -> tai thang len Cloudinary (file nang khong di qua server minh)
  //  - khong co  -> gui nguyen file len server minh (che do luu tren may)
  // Dung XHR thay vi fetch vi fetch khong bao duoc da tai len bao nhieu %.
  async taiLenGiaiTri(file, bai, onTienDo) {
    const { uploadUrl, ...thamSo } = await apiAdmin('/giai-tri/chu-ky', {
      method: 'POST',
      body: JSON.stringify(bai)
    });

    return new Promise((xong, hong) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);
      xhr.upload.onprogress = (e) => e.lengthComputable && onTienDo(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () => {
        let data = {};
        try { data = JSON.parse(xhr.responseText); } catch { /* khong phai JSON */ }
        if (xhr.status < 300) xong(data);
        else hong(new Error(data.error?.message || data.error || 'Tải lên thất bại'));
      };
      xhr.onerror = () => hong(new Error('Mất kết nối khi đang tải lên'));

      if (thamSo.signature) {
        const form = new FormData();
        Object.entries(thamSo).forEach(([k, v]) => form.append(k, v));
        form.append('file', file);
        xhr.send(form);
      } else {
        xhr.setRequestHeader('Authorization', `Bearer ${adminToken.get() || ''}`);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.setRequestHeader('X-Ten-File', encodeURIComponent(file.name));
        xhr.setRequestHeader('X-Bai', encodeURIComponent(JSON.stringify(bai)));
        xhr.send(file);
      }
    });
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Không thể tải chi tiết sản phẩm');
    return res.json();
  },

  // San pham (quan tri) - kem token dang nhap
  createProduct: (data) => apiAdmin('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => apiAdmin(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => apiAdmin(`/products/${id}`, { method: 'DELETE' }),

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
