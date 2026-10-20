// /api/projects : nhật ký thi công
const { Router } = require('express');
const c = require('../controllers/congTrinh');
const { canQuyen } = require('../middleware/xacThuc');

const r = Router();
r.get('/projects', c.danhSach);
r.post('/projects', canQuyen, c.them);
r.put('/projects/:id', canQuyen, c.sua);
r.delete('/projects/:id', canQuyen, c.xoa);

module.exports = r;
