// Nhật ký thi công (công trình đã làm)
const kho = require('../lib/kho');
const TEN = require('./tenKho');

const doc = () => kho.doc(TEN.CONG_TRINH);
const ghi = (ds) => kho.ghi(TEN.CONG_TRINH, ds);

// Mới nhất trước
const sapXep = (ds) => ds.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

const taoMoi = (b = {}) => ({
  id: b.id || 'ct-' + Date.now(),
  title: b.title || '',
  address: b.address || '',
  customerType: b.customerType || '',
  startDate: b.startDate || new Date().toISOString().slice(0, 10),
  durationDays: Number(b.durationDays) || 0,
  status: b.status || 'Hoàn thành',
  description: b.description || '',
  image: b.image || '/images/cat_tools.jpg'
});

module.exports = { doc, ghi, sapXep, taoMoi };
