// Việc chạy 1 lần lúc khởi động: mở kho dữ liệu, chuyển dữ liệu cũ sang kho mới, bật kho file.
const fs = require('fs');
const path = require('path');
const kho = require('./lib/kho');
const khoFile = require('./lib/khoFile');
const khoRiengTu = require('./lib/khoRiengTu');
const TEN = require('./models/tenKho');
const saoLuu = require('./models/saoLuu');
const tep = require('./models/tep');
const { THU_MUC_TEP, CO_TAI_KHOAN_RIENG } = require('./config');

// Mọi mục trong kho + giá trị lúc chưa có gì. Lần đầu chạy có DATABASE_URL thì dữ liệu file đang có được đẩy lên.
const MAC_DINH_KHO = { ...saoLuu.MUC, [TEN.QUAN_TRI]: {} };

// Vừa chuyển từ máy lên kho dữ liệu: tệp đính kèm đang nằm trong data/ghi-chu-file
// (moKho chỉ chuyển các mục JSON) -> đẩy nốt lên kho, bỏ qua tệp đã có, để máy hỏng vẫn còn
const chuyenTepLenKho = async () => {
  if (!kho.dangDungDB() || !fs.existsSync(THU_MUC_TEP)) return;
  let moi = 0;
  for (const ten of fs.readdirSync(THU_MUC_TEP)) {
    try {
      if (await kho.docAnh(ten)) continue;
      if (await kho.ghiAnh(ten, 'application/octet-stream', fs.readFileSync(path.join(THU_MUC_TEP, ten)))) moi += 1;
    } catch (err) { console.error(`[KHO] Khong chuyen duoc tep ${ten}:`, err.message); }
  }
  if (moi) console.log(`[KHO] Da chuyen ${moi} tep dinh kem ghi chu tu may len co so du lieu`);
};

// Vừa nối bucket riêng tư: đưa ảnh khách hàng đang nằm trong kho dữ liệu sang bucket, rồi giải phóng chỗ
const chuyenAnhKhachSangBucket = async () => {
  if (!kho.dangDungDB() || !khoRiengTu.dangBat()) return;
  let chuyen = 0;
  try {
    for (const a of (await kho.lietKeAnh()).filter((x) => tep.laAnhKhach(x.id))) {
      const x = await kho.docAnh(a.id);
      if (x && await khoRiengTu.ghi(a.id, a.kieu, x.du_lieu)) { await kho.xoaAnh(a.id); chuyen += 1; }
    }
  } catch (err) { console.error('[KHO RIENG] Loi khi chuyen anh:', err.message); }
  if (chuyen) console.log(`[KHO RIENG] Da chuyen ${chuyen} anh khach hang sang bucket rieng tu`);
};

const khoiDong = async () => {
  if (!CO_TAI_KHOAN_RIENG) console.warn('[CANH BAO] Chua dat ADMIN_TAI_KHOAN / ADMIN_PASSWORD, dang dung tai khoan tam.');
  await kho.moKho(MAC_DINH_KHO);
  await chuyenTepLenKho();
  await chuyenAnhKhachSangBucket();
  if (khoFile.dangBat()) khoFile.datPhepTrinhDuyet();
};

module.exports = { khoiDong };
