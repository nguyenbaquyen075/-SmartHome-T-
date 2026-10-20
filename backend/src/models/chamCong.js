// Chấm công: { nhanVien: [...], cong: { <id>: { 'YYYY-MM-DD': 1 | 0.5 } }, chuThich: { <id>: { 'YYYY-MM-DD': 'chữ' } } }
const kho = require('../lib/kho');
const TEN = require('./tenKho');
const { chuoi } = require('../utils/chuanHoa');
const { taoHangDoi } = require('../utils/hangDoi');

const MAC_DINH = { nhanVien: [], cong: {}, chuThich: {} };
const TOI_DA_NHAN_VIEN = 200;

const doc = () => ({ nhanVien: [], cong: {}, chuThich: {}, ...kho.doc(TEN.CHAM_CONG, MAC_DINH) });
const ghi = (d) => kho.ghi(TEN.CHAM_CONG, d);

// Bấm tích liên tục: các yêu cầu phải ghi lần lượt
const tuanTu = taoHangDoi();

const chuanNhanVien = (b = {}) => ({ ten: chuoi(b.ten, 80), chucVu: chuoi(b.chucVu, 60), sdt: chuoi(b.sdt, 20) });

module.exports = { MAC_DINH, TOI_DA_NHAN_VIEN, doc, ghi, tuanTu, chuanNhanVien };
