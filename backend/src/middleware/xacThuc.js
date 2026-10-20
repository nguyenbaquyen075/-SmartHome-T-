// Chặn route quản trị khi chưa đăng nhập (token gửi qua header Authorization: Bearer <token>)
const taiKhoan = require('../models/taiKhoan');

const layToken = (req) => (req.headers.authorization || '').replace('Bearer ', '');

const laQuanTri = (req) => taiKhoan.phienHopLe(layToken(req));

const canQuyen = (req, res, next) => {
  if (laQuanTri(req)) return next();
  res.status(401).json({ error: 'Cần đăng nhập quản trị' });
};

module.exports = { canQuyen, layToken, laQuanTri };
