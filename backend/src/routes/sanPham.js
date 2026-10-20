// /api/products*, /api/brands, /api/stats : sản phẩm
const { Router } = require('express');
const c = require('../controllers/sanPham');
const { canQuyen } = require('../middleware/xacThuc');

const r = Router();
r.get('/brands', c.thuongHieu);
r.get('/products', c.danhSach);
r.get('/products/:id', c.chiTiet);
r.post('/products', canQuyen, c.them);
r.put('/products/:id', canQuyen, c.sua);
r.delete('/products/:id', canQuyen, c.xoa);
r.get('/stats', c.thongKe);

module.exports = r;
