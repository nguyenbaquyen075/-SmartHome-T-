// Ghi chú quản trị: ghi chú, thư mục, tệp đính kèm, sao lưu ghi chú
const crypto = require('crypto');
const ghiChu = require('../models/ghiChu');
const tep = require('../models/tep');
const { ghiChuZip } = require('../views/ghiChuZip');
const { chuoi } = require('../utils/chuanHoa');
const { LOI_LUU } = require('../utils/loi');

const danhSach = (req, res) => res.json(ghiChu.doc());

const them = async (req, res) => {
  const ds = ghiChu.doc();
  if (ds.length >= ghiChu.TOI_DA) return res.status(400).json({ error: `Tối đa ${ghiChu.TOI_DA} ghi chú, hãy xóa bớt` });
  const bay = new Date().toISOString();
  const moi = { id: `gc-${Date.now()}`, ...ghiChu.chuanHoa(req.body), taoLuc: bay, suaLuc: bay };
  ds.unshift(moi);
  if (!(await ghiChu.ghi(ds))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
};

const sua = async (req, res) => {
  const ds = ghiChu.doc();
  const i = ds.findIndex((g) => g.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
  ds[i] = { ...ds[i], ...ghiChu.chuanHoa(req.body), suaLuc: new Date().toISOString() };
  if (!(await ghiChu.ghi(ds))) return res.status(500).json(LOI_LUU);
  res.json(ds[i]);
};

const xoa = async (req, res) => {
  const ds = ghiChu.doc();
  const g = ds.find((x) => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
  if (!(await ghiChu.ghi(ds.filter((x) => x.id !== req.params.id)))) return res.status(500).json(LOI_LUU);
  (g.dinhKem || []).forEach((t) => tep.xoa(t.id));
  res.json({ success: true });
};

// ---- Tệp đính kèm (Word, Excel, PDF...) ----
const themTep = async (req, res) => {
  const i = ghiChu.doc().findIndex((g) => g.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
  const ds = ghiChu.doc();

  const ten = chuoi(req.query.ten, 150).replace(/[\\/\r\n"]/g, '_') || 'tep';
  const duoi = ten.split('.').pop().toLowerCase();
  if (!ghiChu.DUOI_TEP.includes(duoi)) return res.status(400).json({ error: 'Chỉ nhận Word, Excel, PowerPoint, PDF, TXT, CSV hoặc ảnh' });
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || !buf.length) return res.status(400).json({ error: 'Tệp trống' });
  if (buf.length > ghiChu.TOI_DA_TEP) return res.status(413).json({ error: 'Tệp quá nặng, tối đa 15MB' });
  if ((ds[i].dinhKem || []).length >= ghiChu.TEP_TOI_DA_MOI_GHI_CHU) {
    return res.status(400).json({ error: `Mỗi ghi chú tối đa ${ghiChu.TEP_TOI_DA_MOI_GHI_CHU} tệp` });
  }

  const moiTep = { id: `${tep.TIEN_TO_TEP}${Date.now()}-${crypto.randomBytes(4).toString('hex')}`, ten, kichThuoc: buf.length, luc: new Date().toISOString() };
  if (!(await tep.luu(moiTep.id, 'application/octet-stream', buf))) return res.status(500).json(LOI_LUU);
  // Tải tệp mất vài giây, trong lúc đó ghi chú có thể vừa được tự lưu: đọc lại bản mới nhất rồi mới ghi,
  // không dùng bản đọc từ đầu (sẽ đè mất chữ vừa gõ)
  const moi = ghiChu.doc();
  const j = moi.findIndex((g) => g.id === req.params.id);
  if (j === -1) { tep.xoa(moiTep.id); return res.status(404).json({ error: 'Ghi chú đã bị xóa' }); }
  moi[j] = { ...moi[j], dinhKem: [...(moi[j].dinhKem || []), moiTep], suaLuc: new Date().toISOString() };
  if (!(await ghiChu.ghi(moi))) { tep.xoa(moiTep.id); return res.status(500).json(LOI_LUU); }
  res.status(201).json(moiTep);
};

const taiTep = async (req, res) => {
  const t = ghiChu.doc().flatMap((g) => g.dinhKem || []).find((x) => x.id === req.params.fid);
  if (!t) return res.status(404).json({ error: 'Không tìm thấy tệp' });
  const buf = await tep.doc(t.id);
  if (!buf) return res.status(404).json({ error: 'Tệp không còn trên máy chủ' });
  const kieuXem = ghiChu.KIEU_XEM[t.ten.split('.').pop().toLowerCase()];
  const xem = req.query.xem === '1' && kieuXem;
  res.setHeader('Content-Type', xem ? kieuXem : 'application/octet-stream');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', `${xem ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(t.ten)}`);
  res.send(buf);
};

const xoaTep = async (req, res) => {
  const ds = ghiChu.doc();
  const i = ds.findIndex((g) => g.id === req.params.id);
  if (i === -1 || !(ds[i].dinhKem || []).some((t) => t.id === req.params.fid)) return res.status(404).json({ error: 'Không tìm thấy tệp' });
  ds[i] = { ...ds[i], dinhKem: ds[i].dinhKem.filter((t) => t.id !== req.params.fid) };
  if (!(await ghiChu.ghi(ds))) return res.status(500).json(LOI_LUU);
  tep.xoa(req.params.fid);
  res.json({ success: true });
};

// ---- Thư mục (1 cấp): xoá thư mục thì ghi chú bên trong về "Chưa phân loại", không mất ----
const danhSachThuMuc = (req, res) => res.json(ghiChu.docThuMuc());

const themThuMuc = async (req, res) => {
  const ds = ghiChu.docThuMuc();
  if (ds.length >= ghiChu.TOI_DA_THU_MUC) return res.status(400).json({ error: `Tối đa ${ghiChu.TOI_DA_THU_MUC} thư mục` });
  const v = ghiChu.kiemThuMuc(req.body, ds);
  if (v.loi) return res.status(400).json({ error: v.loi });
  const moi = { id: `tm-${Date.now()}`, ten: v.ten };
  ds.push(moi);
  if (!(await ghiChu.ghiThuMuc(ds))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
};

const suaThuMuc = async (req, res) => {
  const ds = ghiChu.docThuMuc();
  const i = ds.findIndex((t) => t.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy thư mục' });
  const v = ghiChu.kiemThuMuc(req.body, ds, ds[i].id);
  if (v.loi) return res.status(400).json({ error: v.loi });
  ds[i] = { ...ds[i], ten: v.ten };
  if (!(await ghiChu.ghiThuMuc(ds))) return res.status(500).json(LOI_LUU);
  res.json(ds[i]);
};

const xoaThuMuc = async (req, res) => {
  const ds = ghiChu.docThuMuc();
  if (!ds.some((t) => t.id === req.params.id)) return res.status(404).json({ error: 'Không tìm thấy thư mục' });
  const tatCa = ghiChu.doc().map((g) => (g.thuMuc === req.params.id ? { ...g, thuMuc: '' } : g));
  if (!(await ghiChu.ghi(tatCa))) return res.status(500).json(LOI_LUU);
  if (!(await ghiChu.ghiThuMuc(ds.filter((t) => t.id !== req.params.id)))) return res.status(500).json(LOI_LUU);
  res.json({ success: true });
};

// ---- Sao lưu ghi chú: 1 file .zip ----
const saoLuu = async (req, res) => {
  try {
    const zip = await ghiChuZip(ghiChu.docThuMuc(), ghiChu.doc(), tep.doc);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="ghi-chu-sao-luu-${new Date().toISOString().slice(0, 10)}.zip"`);
    res.send(zip);
  } catch (err) {
    console.error('Loi sao luu ghi chu:', err.message);
    res.status(500).json({ error: 'Không tạo được bản sao lưu, thử lại sau' });
  }
};

module.exports = { danhSach, them, sua, xoa, themTep, taiTep, xoaTep, danhSachThuMuc, themThuMuc, suaThuMuc, xoaThuMuc, saoLuu };
