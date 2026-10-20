// /api/settings : thanh chạy, banner, số Gọi/Zalo
const { Router } = require('express');
const c = require('../controllers/caiDat');
const { canQuyen } = require('../middleware/xacThuc');

const r = Router();
r.get('/settings', c.xem);
r.put('/settings', canQuyen, c.luu);

module.exports = r;
