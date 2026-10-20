// /api/categories, /api/danh-muc : danh mục sản phẩm
const { Router } = require('express');
const c = require('../controllers/danhMuc');
const { canQuyen } = require('../middleware/xacThuc');

const r = Router();
r.get('/categories', c.tenDanhMuc);
r.get('/danh-muc', c.danhSach);
r.post('/danh-muc', canQuyen, c.them);
r.put('/danh-muc/:id', canQuyen, c.sua);
r.delete('/danh-muc/:id', canQuyen, c.xoa);

module.exports = r;
