// Danh mục sản phẩm: khách đọc, quản trị thêm/sửa/xoá
const danhMuc = require('../models/danhMuc');
const sanPham = require('../models/sanPham');
const { LOI_LUU } = require('../utils/loi');

const danhSach = (req, res) => res.json(danhMuc.doc());

// Chỉ tên, có 'Tất cả' đầu tiên (trang sản phẩm dùng)
const tenDanhMuc = (req, res) => res.json(['Tất cả', ...danhMuc.doc().map((d) => d.ten)]);

const them = async (req, res) => {
  const ds = danhMuc.doc();
  const v = danhMuc.kiem(req.body, ds);
  if (v.loi) return res.status(400).json({ error: v.loi });
  const moi = { id: `dm-${Date.now()}`, ten: v.ten, icon: v.icon, loai: v.loai, anh: '' };
  ds.push(moi);
  if (!(await danhMuc.ghi(ds))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
};

// Đổi tên thì sản phẩm thuộc danh mục này đổi theo
const sua = async (req, res) => {
  const ds = danhMuc.doc();
  const i = ds.findIndex((d) => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
  const v = danhMuc.kiem(req.body, ds, ds[i].id);
  if (v.loi) return res.status(400).json({ error: v.loi });

  const tenCu = ds[i].ten;
  ds[i] = { ...ds[i], ten: v.ten, icon: v.icon, loai: v.loai };
  if (!(await danhMuc.ghi(ds))) return res.status(500).json(LOI_LUU);

  if (tenCu !== v.ten) {
    const sp = sanPham.doc().map((p) => (p.category === tenCu ? { ...p, category: v.ten } : p));
    if (!(await sanPham.ghi(sp))) return res.status(500).json(LOI_LUU);
  }
  res.json(ds[i]);
};

// Còn sản phẩm thì không cho xoá, tránh sản phẩm mồ côi
const xoa = async (req, res) => {
  const ds = danhMuc.doc();
  const d = ds.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
  const dem = sanPham.doc().filter((p) => p.category === d.ten).length;
  if (dem > 0) {
    return res.status(409).json({ error: `Còn ${dem} sản phẩm thuộc "${d.ten}". Chuyển hoặc xóa các sản phẩm đó trước.` });
  }
  if (!(await danhMuc.ghi(ds.filter((x) => x.id !== d.id)))) return res.status(500).json(LOI_LUU);
  res.json({ success: true });
};

module.exports = { danhSach, tenDanhMuc, them, sua, xoa };
