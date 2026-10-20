// /api/sao-luu/* : sao lưu, khôi phục, hoàn tác toàn bộ dữ liệu
const express = require('express');
const c = require('../controllers/saoLuu');
const { canQuyen } = require('../middleware/xacThuc');

const nhanZip = express.raw({ type: () => true, limit: '260mb' });

const r = express.Router();
r.get('/sao-luu/thong-tin', canQuyen, c.thongTin);
r.get('/sao-luu/toan-bo', canQuyen, c.taiVe);
r.post('/sao-luu/khoi-phuc', canQuyen, nhanZip, c.khoiPhuc);
r.post('/sao-luu/hoan-tac', canQuyen, c.hoanTac);

module.exports = r;
