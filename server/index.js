const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Paths
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

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

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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

  // Filter by category (Tất cả, Thiết bị điện, Thiết bị mạng, Thiết bị nước)
  if (category && category !== 'Tất cả') {
    const cat = category.toLowerCase();
    if (cat === 'thiết bị mạng') {
      products = products.filter(
        (p) =>
          p.category.toLowerCase() === 'thiết bị mạng' ||
          p.category.toLowerCase() === 'camera an ninh' ||
          p.name.toLowerCase().includes('camera') ||
          p.name.toLowerCase().includes('wifi')
      );
    } else if (cat === 'thiết bị điện') {
      products = products.filter(
        (p) =>
          p.category.toLowerCase() === 'thiết bị điện' ||
          p.category.toLowerCase() === 'đèn chiếu sáng' ||
          p.name.toLowerCase().includes('điện') ||
          p.name.toLowerCase().includes('aptomat') ||
          p.name.toLowerCase().includes('đèn') ||
          p.name.toLowerCase().includes('cadivi')
      );
    } else if (cat === 'thiết bị nước') {
      products = products.filter(
        (p) =>
          p.category.toLowerCase() === 'thiết bị nước' ||
          p.category.toLowerCase() === 'vật tư phụ' ||
          p.name.toLowerCase().includes('nước') ||
          p.name.toLowerCase().includes('bơm') ||
          p.name.toLowerCase().includes('vòi') ||
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
app.post('/api/products', (req, res) => {
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
app.put('/api/products/:id', (req, res) => {
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
app.delete('/api/products/:id', (req, res) => {
  let products = readJson(PRODUCTS_FILE);
  const exists = products.some((p) => p.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  }

  products = products.filter((p) => p.id !== req.params.id);
  writeJson(PRODUCTS_FILE, products);
  res.json({ success: true, message: 'Đã xóa sản phẩm' });
});

// ================= ORDERS =================

// GET /api/orders
app.get('/api/orders', (req, res) => {
  const orders = readJson(ORDERS_FILE);
  res.json(orders);
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  const orders = readJson(ORDERS_FILE);
  const order = orders.find(
    (o) => o.id.toLowerCase() === req.params.id.toLowerCase() || (o.customer?.phone && o.customer.phone === req.params.id)
  );
  if (!order) {
    return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
  }
  res.json(order);
});

// POST /api/orders (Create order)
app.post('/api/orders', (req, res) => {
  const { customer, items, paymentMethod, discount = 0 } = req.body;
  if (!items || !items.length || !customer || !customer.name || !customer.phone) {
    return res.status(400).json({ error: 'Thiếu thông tin đơn hàng hoặc thông tin khách hàng' });
  }

  const products = readJson(PRODUCTS_FILE);
  let totalAmount = 0;

  // Verify stock & calculate total
  for (const item of items) {
    const prod = products.find((p) => p.id === item.id);
    if (prod) {
      totalAmount += prod.price * (item.quantity || 1);
      // Reduce stock
      prod.inStock = Math.max(0, prod.inStock - (item.quantity || 1));
    }
  }
  writeJson(PRODUCTS_FILE, products);

  const finalAmount = Math.max(0, totalAmount - (Number(discount) || 0));
  const newOrder = {
    id: `CAM-${Math.floor(100000 + Math.random() * 900000)}`,
    customer,
    items,
    totalAmount,
    discount: Number(discount) || 0,
    finalAmount,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentMethod === 'vietqr' ? 'waiting_payment' : 'pending',
    orderStatus: 'processing',
    createdAt: new Date().toISOString()
  };

  const orders = readJson(ORDERS_FILE);
  orders.unshift(newOrder);
  writeJson(ORDERS_FILE, orders);

  res.status(201).json(newOrder);
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  const orders = readJson(ORDERS_FILE);
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  writeJson(ORDERS_FILE, orders);
  res.json(order);
});

// GET /api/stats (Admin stats)
app.get('/api/stats', (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  const orders = readJson(ORDERS_FILE);

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.inStock || 0), 0);
  const lowStockProducts = products.filter((p) => p.inStock <= 5);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.finalAmount || 0), 0);

  res.json({
    totalProducts,
    totalStock,
    lowStockCount: lowStockProducts.length,
    totalOrders,
    totalRevenue
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`CameraTD Backend Server is running on http://localhost:${PORT}`);
});
