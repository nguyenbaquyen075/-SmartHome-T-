// ================= TÀI KHOẢN & PHIÊN ĐĂNG NHẬP QUẢN TRỊ =================
// Phiên dạng "<hạn dùng>.<chữ ký>", chữ ký = HMAC bằng bí mật của server.
// Không giữ trong bộ nhớ nên server ngủ dậy / deploy lại vẫn đăng nhập được tiếp.
// Đổi mật khẩu hoặc "đăng xuất mọi nơi" là mọi phiên cũ hết hiệu lực (vì bí mật đổi theo).
const crypto = require('crypto');
const kho = require('../lib/kho');
const TEN = require('./tenKho');
const config = require('../config');

const BI_MAT = config.ADMIN_SECRET || `${config.ADMIN_TAI_KHOAN}|${config.ADMIN_PASSWORD}`;
const HAN_PHIEN = 7 * 24 * 60 * 60 * 1000;   // 7 ngày
const daThoat = new Set();                   // token bấm "Đăng xuất" (chỉ trong lần chạy này)

// So sánh tài khoản: bỏ khoảng trắng, dấu chấm/gạch của số điện thoại, không phân biệt hoa thường
const chuanTaiKhoan = (v) => String(v || '').trim().toLowerCase().replace(/[\s.()-]/g, '');

// Mật khẩu không bao giờ cất nguyên chữ: băm bằng scrypt kèm muối ngẫu nhiên
const bamMatKhau = (mk) => {
  const muoi = crypto.randomBytes(16).toString('hex');
  return `scrypt$${muoi}$${crypto.scryptSync(String(mk), muoi, 32).toString('hex')}`;
};
const khopMatKhau = (mk, bam) => {
  const [kieu, muoi, dung] = String(bam || '').split('$');
  if (kieu !== 'scrypt' || !muoi || !dung) return false;
  const thu = crypto.scryptSync(String(mk), muoi, 32).toString('hex');
  return thu.length === dung.length && crypto.timingSafeEqual(Buffer.from(thu), Buffer.from(dung));
};

// Tài khoản đang dùng: ưu tiên cái đã đổi trong trang Cài đặt, chưa đổi thì lấy biến môi trường
const docLuu = () => {
  const t = kho.doc(TEN.QUAN_TRI, {});
  return t && typeof t === 'object' && !Array.isArray(t) ? t : {};
};
const ghiLuu = (duLieu) => kho.ghi(TEN.QUAN_TRI, duLieu);

const dungTaiKhoan = (nhap) => {
  const luu = docLuu();
  const ds = luu.taiKhoan ? [luu.taiKhoan] : config.ADMIN_TAI_KHOAN.split(',');
  return ds.some((tk) => tk.trim() && chuanTaiKhoan(tk) === chuanTaiKhoan(nhap));
};
const dungMatKhau = (nhap) => {
  const luu = docLuu();
  return luu.matKhauBam ? khopMatKhau(nhap, luu.matKhauBam) : String(nhap) === config.ADMIN_PASSWORD;
};

// Bí mật ký phiên gồm cả mật khẩu và mốc "đăng xuất mọi nơi"
const biMatPhien = () => {
  const luu = docLuu();
  return `${BI_MAT}|${luu.matKhauBam || ''}|${luu.phienTu || 0}`;
};
const kyPhien = (han) => crypto.createHmac('sha256', biMatPhien()).update(String(han)).digest('hex');

const taoPhien = () => {
  const han = Date.now() + HAN_PHIEN;
  return `${han}.${kyPhien(han)}`;
};
const phienHopLe = (token) => {
  const [han, chuKy] = String(token || '').split('.');
  if (!han || !chuKy || !(Number(han) > Date.now()) || daThoat.has(token)) return false;
  const dung = kyPhien(han);
  return chuKy.length === dung.length
    && crypto.timingSafeEqual(Buffer.from(chuKy), Buffer.from(dung));
};
const dangXuat = (token) => daThoat.add(token);

// Đổi tài khoản/mật khẩu: trả { loi } hoặc { duLieu } để lưu
const doiThongTin = ({ taiKhoanMoi, matKhauMoi }) => {
  const moi = { ...docLuu() };
  if (taiKhoanMoi !== undefined) {
    const tk = String(taiKhoanMoi).trim();
    const laEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tk);
    const laSo = /^[\d\s.()+-]{9,15}$/.test(tk);
    if (!laEmail && !laSo) return { loi: 'Cần nhập email hợp lệ hoặc số điện thoại' };
    moi.taiKhoan = tk;
  }
  if (matKhauMoi !== undefined) {
    if (String(matKhauMoi).length < 8) return { loi: 'Mật khẩu mới cần ít nhất 8 ký tự' };
    moi.matKhauBam = bamMatKhau(matKhauMoi);
  }
  // Chưa từng đổi thì ghi luôn cái đang dùng vào kho, để sau này đổi biến trên Render
  // cũng không làm anh mất tài khoản
  if (!moi.matKhauBam) moi.matKhauBam = bamMatKhau(config.ADMIN_PASSWORD);
  if (!moi.taiKhoan) moi.taiKhoan = config.ADMIN_TAI_KHOAN.split(',')[0].trim();
  moi.doiLuc = new Date().toISOString();
  return { duLieu: moi };
};

// Đăng xuất khỏi mọi thiết bị: đổi mốc phiên -> mọi token đã phát đều vô hiệu
const moiPhienMoi = () => {
  const moi = { ...docLuu(), phienTu: Date.now() };
  if (!moi.matKhauBam) moi.matKhauBam = bamMatKhau(config.ADMIN_PASSWORD);
  return moi;
};

// ---- Chặn dò mật khẩu: sai nhiều lần từ cùng một nơi thì phải đợi ----
// Đếm trong bộ nhớ, đủ cho 1 trang nhỏ; server khởi động lại thì đếm lại từ đầu.
const CHO_PHEP_SAI = 8;
const KHOA_TRONG = 15 * 60 * 1000;
const demSai = new Map();   // địa chỉ -> { so, den }

// Trả số phút còn bị khoá, 0 = không khoá
const conKhoa = (noi) => {
  const d = demSai.get(noi);
  if (!d) return 0;
  if (d.den < Date.now()) { demSai.delete(noi); return 0; }
  return d.so >= CHO_PHEP_SAI ? Math.ceil((d.den - Date.now()) / 60000) : 0;
};
const demThemMotLanSai = (noi) => {
  const d = demSai.get(noi);
  const con = d && d.den > Date.now() ? d.so : 0;
  demSai.set(noi, { so: con + 1, den: Date.now() + KHOA_TRONG });
  // Dọn cho khỏi phình bộ nhớ
  if (demSai.size > 500) for (const [k, v] of demSai) if (v.den < Date.now()) demSai.delete(k);
};
const xoaDemSai = (noi) => demSai.delete(noi);

module.exports = {
  docLuu, ghiLuu, dungTaiKhoan, dungMatKhau, taoPhien, phienHopLe, dangXuat,
  doiThongTin, moiPhienMoi, conKhoa, demThemMotLanSai, xoaDemSai
};
