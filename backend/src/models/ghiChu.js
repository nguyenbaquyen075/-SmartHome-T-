// Ghi chú của quản trị (chỉ quản trị đọc/ghi, khách không thấy) + thư mục 1 cấp
const kho = require('../lib/kho');
const TEN = require('./tenKho');
const { chuoi } = require('../utils/chuanHoa');

const TOI_DA = 500;
const TOI_DA_THU_MUC = 100;
const DUOI_TEP = ['doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'pdf', 'txt', 'png', 'jpg', 'jpeg', 'webp'];
const TOI_DA_TEP = 15 * 1024 * 1024;
const TEP_TOI_DA_MOI_GHI_CHU = 20;
// ?xem=1 với PDF, ảnh, TXT: trả đúng loại để trình duyệt mở ra xem; còn lại luôn tải về
const KIEU_XEM = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', txt: 'text/plain; charset=utf-8' };

const doc = () => kho.doc(TEN.GHI_CHU, []);
const ghi = (ds) => kho.ghi(TEN.GHI_CHU, ds);
const docThuMuc = () => kho.doc(TEN.GHI_CHU_TM, []);
const ghiThuMuc = (ds) => kho.ghi(TEN.GHI_CHU_TM, ds);

const chuanHoa = (b = {}) => ({
  thuMuc: docThuMuc().some((t) => t.id === b.thuMuc) ? b.thuMuc : '',
  tieuDe: String(b.tieuDe ?? '').trim().slice(0, 200), noiDung: String(b.noiDung ?? '').slice(0, 50000), ghim: Boolean(b.ghim)
});

const kiemThuMuc = (b, ds, boQuaId) => {
  const ten = chuoi(b?.ten, 60);
  if (!ten) return { loi: 'Nhập tên thư mục' };
  if (ds.some((t) => t.id !== boQuaId && t.ten.toLowerCase() === ten.toLowerCase())) return { loi: 'Đã có thư mục tên này' };
  return { ten };
};

module.exports = { TOI_DA, TOI_DA_THU_MUC, DUOI_TEP, TOI_DA_TEP, TEP_TOI_DA_MOI_GHI_CHU, KIEU_XEM, doc, ghi, docThuMuc, ghiThuMuc, chuanHoa, kiemThuMuc };
