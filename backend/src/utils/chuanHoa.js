// Các hàm làm sạch dữ liệu từ trình duyệt gửi lên: chỉ nhận đúng kiểu, cắt độ dài.
// Dùng chung cho mọi model.

const chuoi = (v, max) => String(v ?? '').trim().slice(0, max);

const dsChuoi = (v, soDong, max = 500) =>
  (Array.isArray(v) ? v : []).map((x) => chuoi(x, max)).filter(Boolean).slice(0, soDong);

// Số tiền (đồng): nhận số hoặc chuỗi "1.200.000", sai hoặc <= 0 thì null
const soTien = (v) => {
  const n = Number(String(v ?? '').replace(/[^\d]/g, ''));
  return n > 0 && n < 1e12 ? n : null;
};

// Số điện thoại: chỉ giữ chữ số và dấu +
const soDienThoai = (v) => String(v ?? '').replace(/[^\d+]/g, '').slice(0, 15);

// Số nguyên kẹp trong khoảng, sai thì lấy mặc định
const soTrongKhoang = (v, min, max, macDinh) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : macDinh;
};

// Ngày dạng YYYY-MM-DD có thật (không nhận 2026-02-30). Ngày vô nghĩa có thể ném lỗi -> người gọi tự bắt.
const ngayHopLe = (ngay) => /^\d{4}-\d{2}-\d{2}$/.test(ngay || '') && new Date(`${ngay}T00:00:00Z`).toISOString().slice(0, 10) === ngay;

// Như ngayHopLe nhưng trả lại chính ngày đó hoặc '' khi sai
const ngayChuan = (v) => {
  const t = String(v || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(t) && new Date(`${t}T00:00:00Z`).toISOString().slice(0, 10) === t ? t : '';
};

// Hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD
const homNayVN = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

// Tên file/thư mục an toàn trong file zip
const tenAnToan = (v, macDinh) => String(v || '').replace(/[\\/:*?"<>|\r\n]+/g, '_').trim().slice(0, 80) || macDinh;

// Thêm "(2)", "(3)"... khi trùng tên (không phân biệt hoa thường)
const duyNhat = (da, ten) => {
  let t = ten;
  for (let n = 2; da.has(t.toLowerCase()); n++) t = `${ten} (${n})`;
  da.add(t.toLowerCase());
  return t;
};

// Giải mã phần header đã encodeURIComponent, hỏng thì trả rỗng
const giaiMa = (s) => { try { return decodeURIComponent(s || ''); } catch { return ''; } };

module.exports = { chuoi, dsChuoi, soTien, soDienThoai, soTrongKhoang, ngayHopLe, ngayChuan, homNayVN, tenAnToan, duyNhat, giaiMa };
