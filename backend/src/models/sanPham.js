// Sản phẩm: đọc/ghi, lọc cho trang khách, làm sạch dữ liệu từ trang quản trị
const kho = require('../lib/kho');
const TEN = require('./tenKho');
const danhMuc = require('./danhMuc');
const { chuoi, dsChuoi, soTien } = require('../utils/chuanHoa');

const doc = () => kho.doc(TEN.SAN_PHAM);
const ghi = (ds) => kho.ghi(TEN.SAN_PHAM, ds);

// Chữ thường an toàn: sản phẩm cũ nhập tay có thể thiếu tên / hãng / danh mục, không được làm hỏng cả trang
const thuong = (v) => String(v ?? '').toLowerCase();

// Lọc + sắp xếp theo tham số trên URL (?search=&category=&brand=&sensor=&minPrice=&maxPrice=&featured=&sort=)
const loc = (products, { search, category, brand, minPrice, maxPrice, sort, featured, sensor } = {}) => {
  if (search) {
    const q = thuong(search).trim();
    products = products.filter(
      (p) =>
        thuong(p.name).includes(q) ||
        thuong(p.brand).includes(q) ||
        thuong(p.category).includes(q) ||
        thuong(p.description).includes(q)
    );
  }
  // Lọc theo danh mục: khớp đúng tên, không đoán mò
  if (category && category !== 'Tất cả') {
    const cat = String(category).trim().toLowerCase();
    products = products.filter((p) => String(p.category || '').trim().toLowerCase() === cat);
  }
  if (brand && brand !== 'Tất cả') {
    products = products.filter((p) => thuong(p.brand) === thuong(brand));
  }
  if (sensor && sensor !== 'Tất cả') {
    products = products.filter(
      (p) => p.specs?.sensor && thuong(p.specs.sensor).includes(thuong(sensor))
    );
  }
  if (minPrice) products = products.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) products = products.filter((p) => p.price <= Number(maxPrice));
  if (featured === 'true') products = products.filter((p) => p.featured);

  if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'rating-desc') products.sort((a, b) => b.rating - a.rating);
  else if (sort === 'name-asc') products.sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
  return products;
};

// Giá dự tính: nhập ngược "từ" > "đến" thì tự đổi chỗ
const chuanHoaGia = (g) => {
  let tu = soTien(g?.tu);
  let den = soTien(g?.den);
  if (tu && den && tu > den) [tu, den] = [den, tu];
  return { tu, den, ghiChu: chuoi(g?.ghiChu, 120) };
};

const dsThongTin = (v) => (Array.isArray(v) ? v : [])
  .map((m) => ({ tieuDe: chuoi(m?.tieuDe, 120), noiDung: dsChuoi(m?.noiDung, 30, 1000) }))
  .filter((m) => m.tieuDe && m.noiDung.length)
  .slice(0, 20);

// Chỉ nhận đúng các trường của form quản trị, đúng kiểu, cắt độ dài
const chuanHoa = (b = {}) => {
  const images = dsChuoi(b.images, 12);
  // Khoá thông số là nhãn tiếng Việt, giữ đúng thứ tự quản trị nhập
  const specs = {};
  for (const [nhan, giaTri] of Object.entries(b.specs && typeof b.specs === 'object' ? b.specs : {})) {
    if (chuoi(nhan, 80) && chuoi(giaTri, 300)) specs[chuoi(nhan, 80)] = chuoi(giaTri, 300);
  }
  return {
    name: chuoi(b.name, 200),
    brand: chuoi(b.brand, 80),
    category: chuoi(b.category, 80),
    loai: chuoi(b.loai, 40),
    subTitle: chuoi(b.subTitle, 200),
    unit: chuoi(b.unit, 20) || 'chiếc',
    featured: Boolean(b.featured),
    image: images[0] || '',
    images,
    noiBat: (Array.isArray(b.noiBat) ? b.noiBat : [])
      .map((o) => ({ bieuTuong: chuoi(o?.bieuTuong, 20), nhan: chuoi(o?.nhan, 60), giaTri: chuoi(o?.giaTri, 60), ghiChu: chuoi(o?.ghiChu, 60) }))
      .filter((o) => o.nhan && o.giaTri)
      .slice(0, 4),
    description: chuoi(b.description, 5000),
    highlights: dsChuoi(b.highlights, 12),
    thongTin: dsThongTin(b.thongTin),
    specs,
    huongDan: dsChuoi(b.huongDan, 12),
    baoHanh: { thoiGian: chuoi(b.baoHanh?.thoiGian, 60), doiTra: chuoi(b.baoHanh?.doiTra, 120) },
    giaDuTinh: chuanHoaGia(b.giaDuTinh)
  };
};

// Trả câu báo lỗi, hoặc false khi hợp lệ
const kiemLoi = (sp) =>
  (!sp.name || !sp.brand || !sp.category || !sp.image) && 'Cần có tên, danh mục, thương hiệu và ít nhất 1 ảnh'
  || (!danhMuc.doc().some((d) => d.ten === sp.category) && 'Danh mục không còn tồn tại, chọn lại danh mục');

module.exports = { doc, ghi, loc, chuanHoa, kiemLoi };
