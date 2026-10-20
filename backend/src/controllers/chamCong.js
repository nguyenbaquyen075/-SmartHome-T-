// Chấm công: nhân viên, lưu công theo ngày, xuất Excel
const chamCong = require('../models/chamCong');
const { bangCongXlsx } = require('../views/bangCongXlsx');
const { chuoi, ngayHopLe, homNayVN } = require('../utils/chuanHoa');
const { LOI_LUU } = require('../utils/loi');

const xem = (req, res) => res.json(chamCong.doc());

const xuatExcel = (req, res) => {
  const khop = /^(\d{4})-(\d{2})$/.exec(String(req.query.thang || ''));
  if (!khop || +khop[2] < 1 || +khop[2] > 12) return res.status(400).json({ error: 'Tháng không hợp lệ' });
  const nam = +khop[1];
  const thang = +khop[2];
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="bang-cong-thang-${thang}-${nam}.xlsx"`);
  res.send(bangCongXlsx(chamCong.doc(), nam, thang));
};

const themNhanVien = (req, res) => chamCong.tuanTu(async () => {
  const d = chamCong.doc();
  const nv = chamCong.chuanNhanVien(req.body);
  if (!nv.ten) return res.status(400).json({ error: 'Nhập tên nhân viên' });
  if (d.nhanVien.length >= chamCong.TOI_DA_NHAN_VIEN) return res.status(400).json({ error: `Tối đa ${chamCong.TOI_DA_NHAN_VIEN} nhân viên` });
  const moi = { id: `nv-${Date.now()}`, ...nv };
  d.nhanVien.push(moi);
  if (!(await chamCong.ghi(d))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
});

const suaNhanVien = (req, res) => chamCong.tuanTu(async () => {
  const d = chamCong.doc();
  const i = d.nhanVien.findIndex((n) => n.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
  const nv = chamCong.chuanNhanVien(req.body);
  if (!nv.ten) return res.status(400).json({ error: 'Nhập tên nhân viên' });
  d.nhanVien[i] = { ...d.nhanVien[i], ...nv };
  if (!(await chamCong.ghi(d))) return res.status(500).json(LOI_LUU);
  res.json(d.nhanVien[i]);
});

const xoaNhanVien = (req, res) => chamCong.tuanTu(async () => {
  const d = chamCong.doc();
  if (!d.nhanVien.some((n) => n.id === req.params.id)) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
  d.nhanVien = d.nhanVien.filter((n) => n.id !== req.params.id);
  delete d.cong[req.params.id];
  delete d.chuThich[req.params.id];
  if (!(await chamCong.ghi(d))) return res.status(500).json(LOI_LUU);
  res.json({ success: true });
});

// Lưu nhiều thay đổi 1 lần (bấm nút Lưu): mỗi mục { nhanVienId, ngay, gia?, chuThich? }.
// gia = 1 (đủ công), 0.5 (nửa công), 0 (bỏ tích); chuThich rỗng = xoá chú thích. Sai 1 mục là không lưu mục nào.
const luu = (req, res) => chamCong.tuanTu(async () => {
  const homNay = homNayVN();
  const ds = req.body?.thayDoi;
  if (!Array.isArray(ds) || ds.length > 3000) return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  const d = chamCong.doc();
  for (const x of ds) {
    if (!d.nhanVien.some((n) => n.id === x?.nhanVienId)) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    let hopLe = false;
    try { hopLe = ngayHopLe(x.ngay); } catch { /* ngày vô nghĩa */ }
    if (!hopLe) return res.status(400).json({ error: 'Ngày không hợp lệ' });
    if (x.gia !== undefined && ![0, 0.5, 1].includes(x.gia)) return res.status(400).json({ error: 'Giá trị công không hợp lệ' });
    // Ngày chưa tới thì không chấm công trước được (tính theo giờ Việt Nam); bỏ tích (0) vẫn được
    if (x.gia > 0 && x.ngay > homNay) return res.status(400).json({ error: 'Chưa đến ngày này, không chấm công trước được' });
    if (x.chuThich !== undefined && typeof x.chuThich !== 'string') return res.status(400).json({ error: 'Chú thích không hợp lệ' });
  }
  for (const x of ds) {
    if (x.gia !== undefined) {
      d.cong[x.nhanVienId] = d.cong[x.nhanVienId] || {};
      if (x.gia === 0) delete d.cong[x.nhanVienId][x.ngay]; else d.cong[x.nhanVienId][x.ngay] = x.gia;
    }
    if (x.chuThich !== undefined) {
      const chu = chuoi(x.chuThich, 200);
      d.chuThich[x.nhanVienId] = d.chuThich[x.nhanVienId] || {};
      if (!chu) delete d.chuThich[x.nhanVienId][x.ngay]; else d.chuThich[x.nhanVienId][x.ngay] = chu;
    }
  }
  if (!(await chamCong.ghi(d))) return res.status(500).json(LOI_LUU);
  res.json({ success: true });
});

module.exports = { xem, xuatExcel, themNhanVien, suaNhanVien, xoaNhanVien, luu };
