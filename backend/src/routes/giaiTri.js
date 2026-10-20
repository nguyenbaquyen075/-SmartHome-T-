// /api/giai-tri* : hậu trường thi công (ảnh/video)
const express = require('express');
const c = require('../controllers/giaiTri');
const { canQuyen } = require('../middleware/xacThuc');
const { THU_MUC_GIAI_TRI_FILE } = require('../config');

const nhanFile = express.raw({ type: () => true, limit: '100mb' });

const r = express.Router();
r.get('/giai-tri', c.danhSach);
r.post('/giai-tri/chu-ky', canQuyen, c.xinChuKy);
r.get('/giai-tri/che-do', canQuyen, c.cheDo);
r.post('/giai-tri/tai-len', canQuyen, nhanFile, c.taiLen);
r.post('/giai-tri/xong', canQuyen, c.daTaiXong);
// Phát file lưu trên máy (express.static tự hỗ trợ tua video)
r.use('/giai-tri/file', express.static(THU_MUC_GIAI_TRI_FILE, { maxAge: '7d' }));
r.put('/giai-tri', canQuyen, c.sua);
r.delete('/giai-tri', canQuyen, c.xoa);

module.exports = r;
