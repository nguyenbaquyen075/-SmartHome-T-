// Sản phẩm: khách xem + quản trị thêm/sửa/xoá
const sanPham = require('../models/sanPham');
const { LOI_LUU } = require('../utils/loi');

const danhSach = (req, res) => res.json(sanPham.loc(sanPham.doc(), req.query));

const chiTiet = (req, res) => {
  const product = sanPham.doc().find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  res.json(product);
};

const thuongHieu = (req, res) => {
  res.json(['Tất cả', ...new Set(sanPham.doc().map((p) => p.brand).filter(Boolean))]);   // bỏ sản phẩm chưa có hãng
};

const thongKe = (req, res) => {
  const products = sanPham.doc();
  res.json({
    totalProducts: products.length,
    totalStock: products.reduce((acc, p) => acc + (p.inStock || 0), 0),
    lowStockCount: products.filter((p) => p.inStock <= 5).length
  });
};

const them = async (req, res) => {
  const sp = sanPham.chuanHoa(req.body);
  const loi = sanPham.kiemLoi(sp);
  if (loi) return res.status(400).json({ error: loi });
  const products = sanPham.doc();
  const moi = { id: `sp-${Date.now()}`, ...sp };
  products.unshift(moi);
  if (!(await sanPham.ghi(products))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
};

const sua = async (req, res) => {
  const products = sanPham.doc();
  const i = products.findIndex((p) => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  const sp = sanPham.chuanHoa(req.body);
  const loi = sanPham.kiemLoi(sp);
  if (loi) return res.status(400).json({ error: loi });
  // Giữ các trường cũ không có trên form (giá, đánh giá...), ghi đè phần quản trị vừa sửa
  products[i] = { ...products[i], ...sp, id: products[i].id };
  if (!(await sanPham.ghi(products))) return res.status(500).json(LOI_LUU);
  res.json(products[i]);
};

const xoa = async (req, res) => {
  const products = sanPham.doc();
  if (!products.some((p) => p.id === req.params.id)) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  if (!(await sanPham.ghi(products.filter((p) => p.id !== req.params.id)))) return res.status(500).json(LOI_LUU);
  res.json({ success: true, message: 'Đã xóa sản phẩm' });
};

module.exports = { danhSach, chiTiet, thuongHieu, thongKe, them, sua, xoa };
