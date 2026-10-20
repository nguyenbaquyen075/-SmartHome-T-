// Danh mục sản phẩm. icon là khoá trong frontend/src/utils/danhMuc.jsx
const kho = require('../lib/kho');
const TEN = require('./tenKho');
const { chuoi } = require('../utils/chuanHoa');

// Lúc mới cài đặt: dùng 3 danh mục web đang có
const MAC_DINH = [
  { id: 'dm-mang', ten: 'Thiết bị mạng', icon: 'cctv', loai: ['Camera', 'Đầu ghi', 'Ổ cứng', 'Router - Wifi', 'Phụ kiện'], anh: '/images/cat_style_new/prod_3.png' },
  { id: 'dm-dien', ten: 'Thiết bị điện', icon: 'zap', loai: ['Aptomat', 'Ổ cắm - Công tắc', 'Quạt', 'Đèn', 'Dây điện'], anh: '/images/cat_style_new/prod_1.png' },
  { id: 'dm-nuoc', ten: 'Thiết bị nước', icon: 'droplets', loai: ['Máy bơm', 'Vòi sen', 'Bình nóng lạnh', 'Phụ kiện'], anh: '/images/cat_style_new/prod_2.png' }
];
const ICON = ['cctv', 'zap', 'droplets', 'wifi', 'wrench', 'lightbulb', 'shield', 'package', 'plug', 'sun'];

const doc = () => kho.doc(TEN.DANH_MUC, MAC_DINH);
const ghi = (ds) => kho.ghi(TEN.DANH_MUC, ds);

const trungTen = (ds, ten, boQuaId) =>
  ds.some((d) => d.id !== boQuaId && d.ten.toLowerCase() === ten.toLowerCase());

// Kiểm tra tên + icon + loại thiết bị, trả về { loi } hoặc { ten, icon, loai }
const kiem = (b, ds, boQuaId) => {
  const ten = chuoi(b.ten, 60);
  if (!ten) return { loi: 'Nhập tên danh mục' };
  if (ten.toLowerCase() === 'tất cả') return { loi: '"Tất cả" là mục có sẵn, chọn tên khác' };
  if (trungTen(ds, ten, boQuaId)) return { loi: 'Đã có danh mục tên này' };
  // Loại thiết bị thuộc danh mục (VD: Camera, Đầu ghi), bỏ trùng không phân biệt hoa thường
  const loai = [];
  for (const l of (Array.isArray(b.loai) ? b.loai : []).map((x) => chuoi(x, 40)).filter(Boolean)) {
    if (!loai.some((x) => x.toLowerCase() === l.toLowerCase())) loai.push(l);
  }
  return { ten, icon: ICON.includes(b.icon) ? b.icon : 'package', loai: loai.slice(0, 30) };
};

module.exports = { MAC_DINH, doc, ghi, kiem };
