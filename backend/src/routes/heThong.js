// /api/health, /api/he-thong/*
const { Router } = require('express');
const c = require('../controllers/heThong');
const { canQuyen } = require('../middleware/xacThuc');

const r = Router();
r.get('/health', c.sucKhoe);
r.get('/he-thong/dung-luong', canQuyen, c.dungLuong);

module.exports = r;
