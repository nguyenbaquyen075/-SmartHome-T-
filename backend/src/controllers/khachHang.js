// Khách hàng: khách, thiết bị đã lắp, ảnh thiết bị (riêng tư)
const crypto = require('crypto');
const khoRiengTu = require('../lib/khoRiengTu');
const khachHang = require('../models/khachHang');
const tep = require('../models/tep');
const { chuoi } = require('../utils/chuanHoa');
const { LOI_LUU } = require('../utils/loi');

const danhSach = (req, res) => res.json(khachHang.doc());

const them = (req, res) => khachHang.tuanTu(async () => {
  const ds = khachHang.doc();
  const k = khachHang.chuanKhach(req.body);
  if (!k.ten) return res.status(400).json({ error: 'Nhập tên khách hàng' });
  if (ds.length >= khachHang.TOI_DA_KHACH) return res.status(400).json({ error: `Tối đa ${khachHang.TOI_DA_KHACH} khách hàng` });
  const moi = { id: `kh-${Date.now()}`, ...k, taoLuc: new Date().toISOString(), thietBi: [] };
  ds.unshift(moi);
  if (!(await khachHang.ghi(ds))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
});

const sua = (req, res) => khachHang.tuanTu(async () => {
  const ds = khachHang.doc();
  const i = ds.findIndex((k) => k.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
  const k = khachHang.chuanKhach(req.body);
  if (!k.ten) return res.status(400).json({ error: 'Nhập tên khách hàng' });
  ds[i] = { ...ds[i], ...k };
  if (!(await khachHang.ghi(ds))) return res.status(500).json(LOI_LUU);
  res.json(ds[i]);
});

const xoa = (req, res) => khachHang.tuanTu(async () => {
  const ds = khachHang.doc();
  const k = ds.find((x) => x.id === req.params.id);
  if (!k) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
  if (!(await khachHang.ghi(ds.filter((x) => x.id !== req.params.id)))) return res.status(500).json(LOI_LUU);
  (k.thietBi || []).forEach(khachHang.xoaAnhThietBi);
  res.json({ success: true });
});

// ---- Thiết bị ----
const themThietBi = (req, res) => khachHang.tuanTu(async () => {
  const ds = khachHang.doc();
  const i = ds.findIndex((k) => k.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
  const tb = khachHang.chuanThietBi(req.body);
  if (!tb.ten) return res.status(400).json({ error: 'Nhập tên thiết bị' });
  if (!tb.ngayLapDat) return res.status(400).json({ error: 'Chọn ngày lắp đặt' });
  if ((ds[i].thietBi || []).length >= khachHang.TOI_DA_THIET_BI) return res.status(400).json({ error: `Mỗi khách tối đa ${khachHang.TOI_DA_THIET_BI} thiết bị` });
  const moi = { id: `tb-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`, ...tb };
  ds[i].thietBi = [...(ds[i].thietBi || []), moi];
  if (!(await khachHang.ghi(ds))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
});

const suaThietBi = (req, res) => khachHang.tuanTu(async () => {
  const ds = khachHang.doc();
  const i = ds.findIndex((k) => k.id === req.params.id);
  const j = i === -1 ? -1 : (ds[i].thietBi || []).findIndex((t) => t.id === req.params.tid);
  if (j === -1) return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
  const tb = khachHang.chuanThietBi(req.body);
  if (!tb.ten) return res.status(400).json({ error: 'Nhập tên thiết bị' });
  if (!tb.ngayLapDat) return res.status(400).json({ error: 'Chọn ngày lắp đặt' });
  ds[i].thietBi[j] = { ...ds[i].thietBi[j], ...tb };
  if (!(await khachHang.ghi(ds))) return res.status(500).json(LOI_LUU);
  res.json(ds[i].thietBi[j]);
});

const xoaThietBi = (req, res) => khachHang.tuanTu(async () => {
  const ds = khachHang.doc();
  const i = ds.findIndex((k) => k.id === req.params.id);
  if (i === -1 || !(ds[i].thietBi || []).some((t) => t.id === req.params.tid)) return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
  const cu = ds[i].thietBi.find((t) => t.id === req.params.tid);
  ds[i].thietBi = ds[i].thietBi.filter((t) => t.id !== req.params.tid);
  if (!(await khachHang.ghi(ds))) return res.status(500).json(LOI_LUU);
  khachHang.xoaAnhThietBi(cu);
  res.json({ success: true });
});

// ---- Ảnh thiết bị (ảnh máy, tem mã): lưu riêng tư, xem phải đăng nhập quản trị ----
const themAnh = async (req, res) => {
  const ten = chuoi(req.query.ten, 120).replace(/[\\/\r\n"]/g, '_') || 'anh';
  const kieu = khachHang.KIEU_ANH[ten.split('.').pop().toLowerCase()];
  if (!kieu) return res.status(400).json({ error: 'Chỉ nhận ảnh JPG, PNG hoặc WEBP' });
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || !buf.length) return res.status(400).json({ error: 'Ảnh trống' });
  if (buf.length > khachHang.TOI_DA_ANH) return res.status(413).json({ error: 'Ảnh quá nặng, tối đa 8MB' });
  const tb0 = khachHang.doc().find((k) => k.id === req.params.id)?.thietBi?.find((t) => t.id === req.params.tid);
  if (!tb0) return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
  if ((tb0.anh || []).length >= khachHang.ANH_TOI_DA_MOI_THIET_BI) return res.status(400).json({ error: `Mỗi thiết bị tối đa ${khachHang.ANH_TOI_DA_MOI_THIET_BI} ảnh` });

  const anh = { id: `${tep.TIEN_TO_ANH_KH}${Date.now()}-${crypto.randomBytes(4).toString('hex')}`, ten, kieu, kichThuoc: buf.length, kho: khoRiengTu.dangBat() ? 'rieng' : 'db' };
  if (!(await tep.luu(anh.id, kieu, buf))) return res.status(500).json(LOI_LUU);
  // Đọc lại bản mới nhất rồi mới ghi (lưu ảnh mất vài giây, dữ liệu có thể vừa đổi)
  return khachHang.tuanTu(async () => {
    const ds = khachHang.doc();
    const tb = ds.find((x) => x.id === req.params.id)?.thietBi?.find((t) => t.id === req.params.tid);
    if (!tb) { tep.xoa(anh.id); return res.status(404).json({ error: 'Thiết bị đã bị xóa' }); }
    tb.anh = [...(tb.anh || []), anh];
    if (!(await khachHang.ghi(ds))) { tep.xoa(anh.id); return res.status(500).json(LOI_LUU); }
    res.status(201).json(anh);
  });
};

const xemAnh = async (req, res) => {
  const anh = khachHang.tatCaAnh().find((a) => a.id === req.params.aid);
  if (!anh) return res.status(404).json({ error: 'Không tìm thấy ảnh' });
  const buf = await tep.doc(anh.id);
  if (!buf) return res.status(404).json({ error: 'Ảnh không còn trên máy chủ' });
  res.setHeader('Content-Type', anh.kieu);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, max-age=86400');
  res.send(buf);
};

const xoaAnh = (req, res) => khachHang.tuanTu(async () => {
  const ds = khachHang.doc();
  const tb = ds.find((k) => k.id === req.params.id)?.thietBi?.find((t) => t.id === req.params.tid);
  if (!tb || !(tb.anh || []).some((a) => a.id === req.params.aid)) return res.status(404).json({ error: 'Không tìm thấy ảnh' });
  tb.anh = tb.anh.filter((a) => a.id !== req.params.aid);
  if (!(await khachHang.ghi(ds))) return res.status(500).json(LOI_LUU);
  tep.xoa(req.params.aid);
  res.json({ success: true });
});

module.exports = { danhSach, them, sua, xoa, themThietBi, suaThietBi, xoaThietBi, themAnh, xemAnh, xoaAnh };
