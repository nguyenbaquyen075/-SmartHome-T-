// ================= KHO FILE RIENG TU (anh khach hang) =================
// Mot bucket Neon Object Storage de che do KHONG cong khai. Anh khach hang di qua server minh:
//  - luc dang: server ghi len bucket bang khoa bi mat (khoa chi nam trong bien moi truong cua Render)
//  - luc xem: chi quan tri da dang nhap moi doc duoc, server doc tu bucket roi tra ve
// Chua dat 4 bien NEON_S3_RT_* thi tat, anh van cat trong kho du lieu nhu truoc.
const { goi } = require('./kyS3');

const CAU_HINH = {
  endpoint: (process.env.NEON_S3_RT_ENDPOINT || '').replace(/\/+$/, ''),
  bucket: process.env.NEON_S3_RT_BUCKET || '',
  khoa: process.env.NEON_S3_RT_KEY || '',
  biMat: process.env.NEON_S3_RT_SECRET || '',
  vung: process.env.NEON_S3_RT_REGION || process.env.NEON_S3_REGION || 'us-east-2'
};

// Chi nhan dia chi https (hoac http://localhost de thu o may minh)
const DIA_CHI_HOP_LE = /^(https:\/\/[a-z0-9.-]+|http:\/\/localhost(:\d+)?)$/i;
const DU_CAU_HINH = Boolean(CAU_HINH.endpoint && CAU_HINH.bucket && CAU_HINH.khoa && CAU_HINH.biMat);
if (DU_CAU_HINH && !DIA_CHI_HOP_LE.test(CAU_HINH.endpoint)) {
  console.error(`[KHO RIENG] NEON_S3_RT_ENDPOINT sai: "${CAU_HINH.endpoint}" (phai la https://br-....neon.tech, khong dau, khong khoang trang)`);
}
const dangBat = () => DU_CAU_HINH && DIA_CHI_HOP_LE.test(CAU_HINH.endpoint);

const ghi = async (ten, kieu, buf) => {
  try { await goi(CAU_HINH, { cach: 'PUT', ten, than: buf, kieu }); return true; }
  catch (err) { console.error('[KHO RIENG] Khong ghi duoc:', err.message); return false; }
};
const doc = async (ten) => {
  try { return Buffer.from(await (await goi(CAU_HINH, { cach: 'GET', ten })).arrayBuffer()); }
  catch { return null; }
};
const xoa = async (ten) => {
  try { await goi(CAU_HINH, { cach: 'DELETE', ten }); return true; }
  catch (err) { console.error('[KHO RIENG] Khong xoa duoc:', err.message); return false; }
};

module.exports = { dangBat, ghi, doc, xoa };
