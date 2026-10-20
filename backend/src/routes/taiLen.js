// /api/tai-len/chu-ky, /api/upload, /api/anh/:id : tải ảnh lên và phát ảnh trong kho
const { Router } = require('express');
const c = require('../controllers/taiLen');
const { canQuyen } = require('../middleware/xacThuc');

const r = Router();
r.post('/tai-len/chu-ky', canQuyen, c.xinChuKy);
r.post('/upload', canQuyen, c.nhanAnh);
r.get('/anh/:id', c.phatAnh);

module.exports = r;
