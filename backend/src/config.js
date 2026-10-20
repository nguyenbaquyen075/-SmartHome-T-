// ================= CẤU HÌNH =================
// Mọi biến môi trường và đường dẫn thư mục đọc ở đây, nơi khác chỉ require file này.
// Đặt biến trên Render: Settings -> Environment (không ghi bí mật vào code).
const path = require('path');

const THU_MUC_BACKEND = path.join(__dirname, '..');
const THU_MUC_DU_LIEU = process.env.DATA_DIR || path.join(THU_MUC_BACKEND, 'data');

// Cloudinary (cách cũ, không bắt buộc): CLOUDINARY_URL = cloudinary://<api_key>:<api_secret>@<cloud_name>
const cloudinary = (() => {
  try {
    const u = new URL(process.env.CLOUDINARY_URL);
    return { cloud: u.hostname, key: decodeURIComponent(u.username), secret: decodeURIComponent(u.password) };
  } catch {
    return null;
  }
})();

module.exports = {
  PORT: process.env.PORT || 5001,

  // Tài khoản quản trị. Không đặt thì dùng tài khoản tạm, chỉ hợp khi chạy ở máy mình.
  // Nhiều tài khoản thì ngăn cách bằng dấu phẩy: "toi@gmail.com, 0987654321"
  ADMIN_TAI_KHOAN: process.env.ADMIN_TAI_KHOAN || '0987654321',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'diennuoc@2026',
  CO_TAI_KHOAN_RIENG: Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_TAI_KHOAN),
  ADMIN_SECRET: process.env.ADMIN_SECRET || '',

  cloudinary,
  NEON_GIOI_HAN_MB: Number(process.env.NEON_GIOI_HAN_MB) || 1024,   // gói miễn phí Neon: 1GB
  RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || '',

  // Thư mục
  THU_MUC_DU_LIEU,                                                     // file JSON khi chưa có DATABASE_URL
  THU_MUC_TEP: path.join(THU_MUC_DU_LIEU, 'ghi-chu-file'),             // tệp đính kèm ghi chú + ảnh khách (chế độ máy)
  THU_MUC_GIAI_TRI_FILE: path.join(THU_MUC_DU_LIEU, 'giai-tri-file'),  // ảnh/video hậu trường (chế độ máy)
  THU_MUC_TAI_LEN: path.join(THU_MUC_BACKEND, '..', 'frontend', 'public', 'images', 'tai-len'),
  CLIENT_DIST: path.join(THU_MUC_BACKEND, '..', 'frontend', 'dist')
};
