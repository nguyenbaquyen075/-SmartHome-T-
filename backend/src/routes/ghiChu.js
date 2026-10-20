// /api/ghi-chu*, /api/ghi-chu-thu-muc*, /api/ghi-chu-sao-luu : ghi chú quản trị
const express = require('express');
const c = require('../controllers/ghiChu');
const { canQuyen } = require('../middleware/xacThuc');

const nhanTep = express.raw({ type: () => true, limit: '16mb' });   // tệp đính kèm gửi nguyên file

const r = express.Router();
r.get('/ghi-chu', canQuyen, c.danhSach);
r.post('/ghi-chu', canQuyen, c.them);
r.post('/ghi-chu/:id/dinh-kem', canQuyen, nhanTep, c.themTep);
r.get('/ghi-chu/dinh-kem/:fid', canQuyen, c.taiTep);
r.delete('/ghi-chu/:id/dinh-kem/:fid', canQuyen, c.xoaTep);
r.put('/ghi-chu/:id', canQuyen, c.sua);
r.delete('/ghi-chu/:id', canQuyen, c.xoa);

r.get('/ghi-chu-thu-muc', canQuyen, c.danhSachThuMuc);
r.post('/ghi-chu-thu-muc', canQuyen, c.themThuMuc);
r.put('/ghi-chu-thu-muc/:id', canQuyen, c.suaThuMuc);
r.delete('/ghi-chu-thu-muc/:id', canQuyen, c.xoaThuMuc);

r.get('/ghi-chu-sao-luu', canQuyen, c.saoLuu);

module.exports = r;
