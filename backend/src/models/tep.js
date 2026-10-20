// Tệp riêng tư: tệp đính kèm ghi chú (Word, Excel, PDF...) và ảnh thiết bị khách hàng.
// KHÔNG công khai, muốn xem phải đăng nhập quản trị.
//  - Ảnh khách hàng: bucket riêng tư (NEON_S3_RT_*) nếu đã bật
//  - Có DATABASE_URL: bảng anh trong cơ sở dữ liệu
//  - Chạy ở máy mình: file trong data/ghi-chu-file
const fs = require('fs');
const path = require('path');
const kho = require('../lib/kho');
const khoRiengTu = require('../lib/khoRiengTu');
const { THU_MUC_TEP } = require('../config');

const TIEN_TO_TEP = 'gc-tep-';
const TIEN_TO_ANH_KH = 'kh-anh-';
const laAnhKhach = (id) => String(id).startsWith(TIEN_TO_ANH_KH);

const luu = async (id, kieu, buf) => {
  if (laAnhKhach(id) && khoRiengTu.dangBat()) return khoRiengTu.ghi(id, kieu, buf);
  if (kho.dangDungDB()) return kho.ghiAnh(id, kieu, buf);
  try {
    fs.mkdirSync(THU_MUC_TEP, { recursive: true });
    fs.writeFileSync(path.join(THU_MUC_TEP, id), buf);
    return true;
  } catch (err) {
    console.error('Loi luu tep ghi chu:', err.message);
    return false;
  }
};

const doc = async (id) => {
  if (laAnhKhach(id) && khoRiengTu.dangBat()) { const b = await khoRiengTu.doc(id); if (b) return b; }   // không có thì tìm ở kho dữ liệu (ảnh cũ)
  if (kho.dangDungDB()) return (await kho.docAnh(id))?.du_lieu || null;
  try { return fs.readFileSync(path.join(THU_MUC_TEP, id)); } catch { return null; }
};

const xoa = async (id) => {
  if (laAnhKhach(id) && khoRiengTu.dangBat()) await khoRiengTu.xoa(id);
  if (kho.dangDungDB()) return kho.xoaAnh(id);
  try { fs.rmSync(path.join(THU_MUC_TEP, id), { force: true }); return true; } catch { return false; }
};

module.exports = { TIEN_TO_TEP, TIEN_TO_ANH_KH, laAnhKhach, luu, doc, xoa };
