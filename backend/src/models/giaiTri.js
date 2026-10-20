// Hậu trường thi công (ảnh/video vui ở công trình)
const kho = require('../lib/kho');
const TEN = require('./tenKho');

const THU_MUC = 'giai-tri';   // dùng làm cả tên thư mục lẫn tag trên Cloudinary / kho Neon
const URL_FILE_MAY = '/api/giai-tri/file/';
// Đuôi file nhận khi lưu trên máy - không nhận svg/html để khỏi bị chèn mã độc
const DUOI_HOP_LE = { image: ['.jpg', '.jpeg', '.png', '.webp', '.gif'], video: ['.mp4', '.mov', '.webm', '.m4v'] };
const KIEU_ANH = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

const doc = () => kho.doc(TEN.GIAI_TRI);
const ghi = (ds) => kho.ghi(TEN.GIAI_TRI, ds);

const loaiTheoDuoi = (duoi) => Object.keys(DUOI_HOP_LE).find((k) => DUOI_HOP_LE[k].includes(duoi));

// Làm sạch thông tin bài quản trị gửi lên
const chuanHoaBai = (b = {}) => ({
  chuThich: String(b.chuThich || '').trim().slice(0, 300),
  ngay: /^\d{4}-\d{2}-\d{2}$/.test(b.ngay) ? b.ngay : new Date().toISOString().slice(0, 10),
  ghim: Boolean(b.ghim)
});

// Context Cloudinary dạng "key=giá trị|key=giá trị": dấu | và = trong giá trị phải thêm \ phía trước
const thoat = (s) => String(s).replace(/([|=])/g, '\\$1');
const taoContext = (bai) => `caption=${thoat(bai.chuThich)}|ngay=${bai.ngay}|ghim=${bai.ghim ? 1 : 0}`;

// Bài ghim lên đầu, còn lại mới nhất trước
const sapXep = (ds) => ds.sort((a, b) => Number(Boolean(b.ghim)) - Number(Boolean(a.ghim)) || b.ngay.localeCompare(a.ngay));

// Chỉ đụng vào bài trong thư mục giai-tri; cấm ".." để không lấn sang file khác
const laBaiHopLe = (id, loai) => /^giai-tri\/[\w-][\w.-]*$/.test(String(id)) && ['image', 'video'].includes(loai);

// Bài này nằm trong kho dữ liệu (đăng từ trước khi dùng Cloudinary) chứ không phải trên Cloudinary
const trongKho = (id) => doc().some((b) => b.id === id);

module.exports = { THU_MUC, URL_FILE_MAY, DUOI_HOP_LE, KIEU_ANH, doc, ghi, loaiTheoDuoi, chuanHoaBai, taoContext, sapXep, laBaiHopLe, trongKho };
