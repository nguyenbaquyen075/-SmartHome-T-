const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '12mb' }));

// Paths
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

// Helper to read/write JSON safely
const readJson = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

const writeJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

// ================= XAC THUC QUAN TRI =================
// Mat khau dat qua bien moi truong ADMIN_PASSWORD (tren Render: Environment).
// Khong dat thi dung mat khau tam - chi hop khi chay o may minh.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'diennuoc@2026';
if (!process.env.ADMIN_PASSWORD) {
  console.warn('[CANH BAO] Chua dat ADMIN_PASSWORD, dang dung mat khau tam.');
}

// Token giu trong bo nho. Server khoi dong lai la phai dang nhap lai -
// du dung cho 1 nguoi quan tri, khong can them thu vien phien dang nhap.
const phienDangNhap = new Set();

const laToken = (req) => (req.headers.authorization || '').replace('Bearer ', '');

const canQuyen = (req, res, next) => {
  if (phienDangNhap.has(laToken(req))) return next();
  res.status(401).json({ error: 'Cần đăng nhập quản trị' });
};

app.post('/api/admin/login', (req, res) => {
  if (req.body?.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mật khẩu không đúng' });
  }
  const token = require('crypto').randomBytes(24).toString('hex');
  phienDangNhap.add(token);
  res.json({ token });
});

app.post('/api/admin/logout', canQuyen, (req, res) => {
  phienDangNhap.delete(laToken(req));
  res.json({ success: true });
});

// Kiem tra token con hieu luc (dung khi tai lai trang)
app.get('/api/admin/check', canQuyen, (req, res) => res.json({ ok: true }));

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET /api/projects (Nhat ky thi cong - moi nhat truoc)
app.get('/api/projects', (req, res) => {
  const projects = readJson(PROJECTS_FILE);
  projects.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  res.json(projects);
});

// POST /api/projects (them cong trinh)
app.post('/api/projects', canQuyen, (req, res) => {
  const projects = readJson(PROJECTS_FILE);
  const moi = {
    id: req.body.id || 'ct-' + Date.now(),
    title: req.body.title || '',
    address: req.body.address || '',
    customerType: req.body.customerType || '',
    startDate: req.body.startDate || new Date().toISOString().slice(0, 10),
    durationDays: Number(req.body.durationDays) || 0,
    status: req.body.status || 'Hoàn thành',
    image: req.body.image || '/images/cat_tools.jpg'
  };
  projects.push(moi);
  writeJson(PROJECTS_FILE, projects);
  res.status(201).json(moi);
});

// PUT /api/projects/:id (sua cong trinh)
app.put('/api/projects/:id', canQuyen, (req, res) => {
  const projects = readJson(PROJECTS_FILE);
  const i = projects.findIndex((p) => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy công trình' });
  projects[i] = { ...projects[i], ...req.body, id: projects[i].id };
  writeJson(PROJECTS_FILE, projects);
  res.json(projects[i]);
});

// DELETE /api/projects/:id
app.delete('/api/projects/:id', canQuyen, (req, res) => {
  const projects = readJson(PROJECTS_FILE);
  const con = projects.filter((p) => p.id !== req.params.id);
  if (con.length === projects.length) return res.status(404).json({ error: 'Không tìm thấy công trình' });
  writeJson(PROJECTS_FILE, con);
  res.json({ success: true });
});

// GET /api/settings (thanh chay + anh banner) - ai cung doc duoc
app.get('/api/settings', (req, res) => {
  const s = readJson(SETTINGS_FILE);
  res.json(Array.isArray(s) ? { ticker: [], banner: null } : s);
});

// PUT /api/settings
app.put('/api/settings', canQuyen, (req, res) => {
  const hienTai = readJson(SETTINGS_FILE);
  const moi = {
    ticker: Array.isArray(req.body.ticker) ? req.body.ticker.filter((t) => t.trim()) : hienTai.ticker,
    banner: 'banner' in req.body ? req.body.banner : hienTai.banner
  };
  writeJson(SETTINGS_FILE, moi);
  res.json(moi);
});

// POST /api/upload - nhan anh dang base64 roi ghi ra file.
// Dung base64 thay vi multipart de khoi them thu vien multer.
app.post('/api/upload', canQuyen, (req, res) => {
  const { data, name } = req.body || {};
  const khop = /^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(data || '');
  if (!khop) return res.status(400).json({ error: 'Chỉ nhận ảnh PNG, JPG hoặc WEBP' });

  const duoi = khop[1] === 'jpeg' ? 'jpg' : khop[1];
  const buf = Buffer.from(khop[2], 'base64');
  if (buf.length > 6 * 1024 * 1024) {
    return res.status(413).json({ error: 'Ảnh quá nặng, tối đa 6MB. Nén bớt rồi tải lại.' });
  }

  const anToan = String(name || 'anh').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const tenFile = `${anToan}-${Date.now()}.${duoi}`;
  const thuMuc = path.join(__dirname, '..', 'frontend', 'public', 'images', 'tai-len');

  try {
    fs.mkdirSync(thuMuc, { recursive: true });
    fs.writeFileSync(path.join(thuMuc, tenFile), buf);
    res.json({ url: `/images/tai-len/${tenFile}` });
  } catch (err) {
    console.error('Lỗi lưu ảnh:', err);
    res.status(500).json({ error: 'Không lưu được ảnh' });
  }
});

// GET /api/categories
app.get('/api/categories', (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  const categories = ['Tất cả', ...new Set(products.map((p) => p.category))];
  res.json(categories);
});

// GET /api/brands
app.get('/api/brands', (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  const brands = ['Tất cả', ...new Set(products.map((p) => p.brand))];
  res.json(brands);
});

// GET /api/products
app.get('/api/products', (req, res) => {
  let products = readJson(PRODUCTS_FILE);
  const { search, category, brand, minPrice, maxPrice, sort, featured, sensor } = req.query;

  // Search by name, brand, description, category
  if (search) {
    const q = search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Filter by category
  if (category && category !== 'Tất cả') {
    const cat = category.toLowerCase();
    if (cat === 'điện dân dụng' || cat === 'thiết bị điện') {
      products = products.filter(
        (p) =>
          p.category.toLowerCase() === 'thiết bị điện' ||
          p.category.toLowerCase() === 'đèn chiếu sáng' ||
          p.name.toLowerCase().includes('điện') ||
          p.name.toLowerCase().includes('aptomat') ||
          p.name.toLowerCase().includes('đèn') ||
          p.name.toLowerCase().includes('cadivi')
      );
    } else if (cat === 'nước & thiết bị vệ sinh' || cat === 'thiết bị nước') {
      products = products.filter(
        (p) =>
          p.category.toLowerCase() === 'thiết bị nước' ||
          p.category.toLowerCase() === 'vật tư phụ' ||
          p.name.toLowerCase().includes('nước') ||
          p.name.toLowerCase().includes('bơm') ||
          p.name.toLowerCase().includes('vòi') ||
          p.name.toLowerCase().includes('ống')
      );
    } else if (cat === 'camera & an ninh' || cat === 'camera an ninh' || cat === 'thiết bị mạng') {
      products = products.filter(
        (p) =>
          p.category.toLowerCase() === 'camera an ninh' ||
          p.category.toLowerCase() === 'thiết bị mạng' ||
          p.name.toLowerCase().includes('camera') ||
          p.name.toLowerCase().includes('wifi')
      );
    } else if (cat === 'thiết bị thông minh') {
      products = products.filter(
        (p) =>
          p.category.toLowerCase() === 'camera an ninh' ||
          p.category.toLowerCase() === 'thiết bị điện' ||
          p.name.toLowerCase().includes('camera') ||
          p.name.toLowerCase().includes('wifi') ||
          p.name.toLowerCase().includes('imou')
      );
    } else if (cat === 'phụ kiện & linh kiện' || cat === 'phụ kiện') {
      products = products.filter(
        (p) =>
          p.category.toLowerCase() === 'phụ kiện' ||
          p.category.toLowerCase() === 'vật tư phụ' ||
          p.name.toLowerCase().includes('phụ kiện') ||
          p.name.toLowerCase().includes('dây') ||
          p.name.toLowerCase().includes('ống')
      );
    } else {
      products = products.filter((p) => p.category.toLowerCase() === cat);
    }
  }

  // Filter by brand
  if (brand && brand !== 'Tất cả') {
    products = products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  // Filter by sensor type
  if (sensor && sensor !== 'Tất cả') {
    products = products.filter(
      (p) => p.specs?.sensor && p.specs.sensor.toLowerCase().includes(sensor.toLowerCase())
    );
  }

  // Filter by price range
  if (minPrice) {
    products = products.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    products = products.filter((p) => p.price <= Number(maxPrice));
  }

  // Filter by featured
  if (featured === 'true') {
    products = products.filter((p) => p.featured);
  }

  // Sort
  if (sort === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating-desc') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'name-asc') {
    products.sort((a, b) => a.name.localeCompare(b.name));
  }

  res.json(products);
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  }
  res.json(product);
});

// POST /api/products (Add product)
app.post('/api/products', canQuyen, (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  const newProduct = {
    id: `cam-${Date.now().toString().slice(-6)}`,
    name: req.body.name || 'Máy ảnh mới',
    brand: req.body.brand || 'Khác',
    category: req.body.category || 'Mirrorless',
    price: Number(req.body.price) || 0,
    originalPrice: Number(req.body.originalPrice) || Number(req.body.price) || 0,
    rating: 5.0,
    reviewsCount: 1,
    inStock: Number(req.body.inStock) || 10,
    featured: Boolean(req.body.featured),
    tag: req.body.tag || 'Mới',
    image: req.body.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    images: req.body.images || [req.body.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'],
    description: req.body.description || '',
    specs: req.body.specs || {
      sensor: 'Full-Frame CMOS',
      video: '4K 60p',
      ibis: '5 trục',
      mount: 'E-mount / RF / Z'
    }
  };

  products.unshift(newProduct);
  writeJson(PRODUCTS_FILE, products);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id (Update product)
app.put('/api/products/:id', canQuyen, (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  }

  products[index] = {
    ...products[index],
    ...req.body,
    price: req.body.price ? Number(req.body.price) : products[index].price,
    inStock: req.body.inStock !== undefined ? Number(req.body.inStock) : products[index].inStock
  };

  writeJson(PRODUCTS_FILE, products);
  res.json(products[index]);
});

// DELETE /api/products/:id (Delete product)
app.delete('/api/products/:id', canQuyen, (req, res) => {
  let products = readJson(PRODUCTS_FILE);
  const exists = products.some((p) => p.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  }

  products = products.filter((p) => p.id !== req.params.id);
  writeJson(PRODUCTS_FILE, products);
  res.json({ success: true, message: 'Đã xóa sản phẩm' });
});

// GET /api/stats (Admin stats)
app.get('/api/stats', (req, res) => {
  const products = readJson(PRODUCTS_FILE);

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.inStock || 0), 0);
  const lowStockProducts = products.filter((p) => p.inStock <= 5);

  res.json({
    totalProducts,
    totalStock,
    lowStockCount: lowStockProducts.length
  });
});

// ================= SERVE REACT BUILD =================
// ponytail: don gian nhat - 1 service, Express serve luon frontend/dist.
// Tach frontend/backend rieng chi khi can CDN hoac scale doc lap.
// API khong khop route nao -> tra 404 JSON, khong roi vao SPA fallback ben duoi
// (neu khong, goi API sai se nhan ve index.html kem status 200)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Không tìm thấy API: ' + req.originalUrl });
});

const CLIENT_DIST = path.join(__dirname, '..', 'frontend', 'dist');
// Asset co hash trong ten -> cache 1 nam; index.html luon lay moi
app.use(express.static(CLIENT_DIST, { maxAge: '1y', index: false }));
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CameraTD Backend Server is running on http://localhost:${PORT}`);
});
