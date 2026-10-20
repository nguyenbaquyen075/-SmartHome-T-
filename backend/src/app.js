// Dựng ứng dụng Express: middleware chung -> /api -> ảnh tải lên -> trang React -> xử lý lỗi.
// Tách khỏi index.js để bài thử có thể dựng app mà không mở cổng.
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const api = require('./routes');
const { khongTimThayApi, xuLyLoi } = require('./middleware/loi');
const { CLIENT_DIST, THU_MUC_TAI_LEN } = require('./config');

const taoApp = () => {
  const app = express();
  // Render dùng proxy ở trước: bật cái này mới đọc được địa chỉ thật của khách (chặn dò mật khẩu theo IP)
  app.set('trust proxy', 1);

  app.use(compression());
  app.use(cors());
  app.use(express.json({ limit: '12mb' }));

  app.use('/api', api);
  app.use('/api', khongTimThayApi);

  // Ảnh tải lên từ quản trị nằm ở frontend/public (ngoài dist) -> phục vụ riêng,
  // không thì bản chạy thật trên Render trả 404 cho ảnh vừa tải
  app.use('/images/tai-len', express.static(THU_MUC_TAI_LEN, { maxAge: '7d' }));

  // 1 service duy nhất: Express phục vụ luôn bản build React.
  // Asset có hash trong tên -> cache 1 năm; index.html luôn lấy mới
  app.use(express.static(CLIENT_DIST, { maxAge: '1y', index: false }));
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });

  app.use(xuLyLoi);
  return app;
};

module.exports = { taoApp };
