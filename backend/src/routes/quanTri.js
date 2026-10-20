// /api/admin/* : đăng nhập và tài khoản quản trị
const { Router } = require('express');
const c = require('../controllers/quanTri');
const { canQuyen } = require('../middleware/xacThuc');

const r = Router();
r.post('/admin/login', c.dangNhap);
r.post('/admin/logout', canQuyen, c.dangXuat);
r.get('/admin/tai-khoan', canQuyen, c.xemTaiKhoan);
r.put('/admin/tai-khoan', canQuyen, c.doiTaiKhoan);
r.post('/admin/dang-xuat-moi-noi', canQuyen, c.dangXuatMoiNoi);
r.get('/admin/check', canQuyen, c.kiemTra);

module.exports = r;
