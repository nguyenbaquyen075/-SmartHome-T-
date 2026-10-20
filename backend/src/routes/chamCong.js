// /api/cham-cong* : nhân viên và bảng chấm công
const { Router } = require('express');
const c = require('../controllers/chamCong');
const { canQuyen } = require('../middleware/xacThuc');

const r = Router();
r.get('/cham-cong/xuat', canQuyen, c.xuatExcel);
r.get('/cham-cong', canQuyen, c.xem);
r.post('/cham-cong/nhan-vien', canQuyen, c.themNhanVien);
r.put('/cham-cong/nhan-vien/:id', canQuyen, c.suaNhanVien);
r.delete('/cham-cong/nhan-vien/:id', canQuyen, c.xoaNhanVien);
r.put('/cham-cong/luu', canQuyen, c.luu);

module.exports = r;
