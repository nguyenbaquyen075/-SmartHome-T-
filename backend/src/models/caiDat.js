// Cài đặt trang khách: thanh chữ chạy, ảnh banner, số Gọi / Zalo nổi góc màn hình
const kho = require('../lib/kho');
const TEN = require('./tenKho');
const { soDienThoai } = require('../utils/chuanHoa');

const LIEN_HE_MAC_DINH = { dienThoai: '0987654321', zalo: '0368338988' };
const MAC_DINH = { ticker: [], banner: null, lienHe: LIEN_HE_MAC_DINH };

// Bản rất cũ lưu dạng mảng: coi như chưa cài gì
const doc = () => {
  const s = kho.doc(TEN.CAI_DAT, MAC_DINH);
  const cu = Array.isArray(s) ? { ticker: [], banner: null } : s;
  return { ...cu, lienHe: cu.lienHe || LIEN_HE_MAC_DINH };
};

// Gộp phần gửi lên với bản đang có: phần nào không gửi thì giữ nguyên
const gop = (body = {}) => {
  const hienTai = kho.doc(TEN.CAI_DAT, MAC_DINH);
  return {
    ticker: Array.isArray(body.ticker) ? body.ticker.filter((t) => t.trim()) : hienTai.ticker,
    banner: 'banner' in body ? body.banner : hienTai.banner,
    lienHe: body.lienHe && typeof body.lienHe === 'object'
      ? { dienThoai: soDienThoai(body.lienHe.dienThoai), zalo: soDienThoai(body.lienHe.zalo) }
      : (hienTai.lienHe || LIEN_HE_MAC_DINH)
  };
};

const ghi = (duLieu) => kho.ghi(TEN.CAI_DAT, duLieu);

module.exports = { MAC_DINH, doc, gop, ghi };
