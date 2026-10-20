// /api/khach-hang* : khách hàng, thiết bị đã lắp, ảnh thiết bị
const express = require('express');
const c = require('../controllers/khachHang');
const { canQuyen } = require('../middleware/xacThuc');

const nhanAnh = express.raw({ type: () => true, limit: '9mb' });

const r = express.Router();
r.get('/khach-hang', canQuyen, c.danhSach);
r.post('/khach-hang', canQuyen, c.them);
r.put('/khach-hang/:id', canQuyen, c.sua);
r.delete('/khach-hang/:id', canQuyen, c.xoa);
r.post('/khach-hang/:id/thiet-bi', canQuyen, c.themThietBi);
r.put('/khach-hang/:id/thiet-bi/:tid', canQuyen, c.suaThietBi);
r.delete('/khach-hang/:id/thiet-bi/:tid', canQuyen, c.xoaThietBi);
r.post('/khach-hang/:id/thiet-bi/:tid/anh', canQuyen, nhanAnh, c.themAnh);
r.get('/khach-hang/anh/:aid', canQuyen, c.xemAnh);
r.delete('/khach-hang/:id/thiet-bi/:tid/anh/:aid', canQuyen, c.xoaAnh);

module.exports = r;
