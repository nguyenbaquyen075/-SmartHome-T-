// Khách hàng: mỗi khách có danh sách thiết bị đã lắp (ngày lắp + số tháng bảo hành), mỗi thiết bị tối đa vài ảnh
const kho = require('../lib/kho');
const TEN = require('./tenKho');
const tep = require('./tep');
const { chuoi, soTrongKhoang, ngayChuan } = require('../utils/chuanHoa');
const { taoHangDoi } = require('../utils/hangDoi');

const TOI_DA_KHACH = 5000;
const TOI_DA_THIET_BI = 1000;
const KIEU_ANH = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const TOI_DA_ANH = 8 * 1024 * 1024;
const ANH_TOI_DA_MOI_THIET_BI = 4;   // mỗi thiết bị tối đa 4 ảnh để kho không phình

const doc = () => kho.doc(TEN.KHACH_HANG, []);
const ghi = (ds) => kho.ghi(TEN.KHACH_HANG, ds);
const tuanTu = taoHangDoi();   // ghi lần lượt, tránh mất thay đổi khi bấm nhanh

const chuanKhach = (b = {}) => ({ ten: chuoi(b.ten, 120), sdt: chuoi(b.sdt, 20), diaChi: chuoi(b.diaChi, 250), ghiChu: chuoi(b.ghiChu, 1000) });

const chuanThietBi = (b = {}) => ({
  ten: chuoi(b.ten, 150),
  soLuong: soTrongKhoang(b.soLuong, 1, 9999, 1),
  congTrinh: chuoi(b.congTrinh, 200),
  ngayLapDat: ngayChuan(b.ngayLapDat),
  baoHanhThang: soTrongKhoang(b.baoHanhThang, 0, 120, 12),
  tenMay: chuoi(b.tenMay, 150),
  ma: chuoi(b.ma ?? b.seri, 120),
  ghiChu: chuoi(b.ghiChu, 1000)
});

// Mọi ảnh thiết bị của mọi khách (dùng khi xem ảnh, đo dung lượng, sao lưu)
const tatCaAnh = (ds = doc()) => ds.flatMap((k) => k.thietBi || []).flatMap((t) => t.anh || []);

const xoaAnhThietBi = (tb) => (tb?.anh || []).forEach((a) => tep.xoa(a.id));

module.exports = { TOI_DA_KHACH, TOI_DA_THIET_BI, KIEU_ANH, TOI_DA_ANH, ANH_TOI_DA_MOI_THIET_BI, doc, ghi, tuanTu, chuanKhach, chuanThietBi, tatCaAnh, xoaAnhThietBi };
