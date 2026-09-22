// ================= KHO FILE (anh + video) =================
// Neon Object Storage - kho file S3 nam cung tai khoan Neon, goi mien phi 5GB.
// File KHONG di qua server minh:
//  - Luc dang: server chi ky "giay phep" 15 phut, trinh duyet tu tai thang len kho.
//    Video 50MB cung khong lam nghen server Render (RAM 512MB).
//  - Luc khach xem: anh/video tai thang tu kho ve may khach.
// Chua dat bien moi truong thi tat, he thong quay ve cach cu (anh cat trong kho du lieu).
const { kyTaiLen: kyPut, goi } = require('./kyS3');

const CAU_HINH = {
  endpoint: (process.env.NEON_S3_ENDPOINT || '').replace(/\/+$/, ''),
  bucket: process.env.NEON_S3_BUCKET || '',
  khoa: process.env.NEON_S3_KEY || '',
  biMat: process.env.NEON_S3_SECRET || '',
  vung: process.env.NEON_S3_REGION || 'us-east-2'
};
const HAN_KY = 15 * 60;   // giay phep song 15 phut, du de tai video nang

const dangBat = () => Boolean(CAU_HINH.endpoint && CAU_HINH.bucket && CAU_HINH.khoa && CAU_HINH.biMat);

// Bucket de public_read -> dia chi nay ai cung mo duoc, khong can ky
const diaChi = (ten) => `${CAU_HINH.endpoint}/${CAU_HINH.bucket}/${ten}`;

// Tach ten file tu dia chi cong khai; khong phai file cua minh thi tra null
const tenTuDiaChi = (url) => {
  const dau = `${CAU_HINH.endpoint}/${CAU_HINH.bucket}/`;
  return String(url || '').startsWith(dau) ? String(url).slice(dau.length) : null;
};

// Ten file co dau thoi gian nen khong bao gio doi noi dung -> cho trinh duyet nho 1 nam.
// Khach xem lan hai khong phai tai lai, do la phan tiet kiem luu luong lon nhat.
const NHO_LAU = 'public, max-age=31536000, immutable';

// Cac dau muc trinh duyet phai gui kem khi tai len; thieu 1 cai la chu ky khong khop
const dauMucTaiLen = (kieu) => ({ 'Content-Type': kieu, 'Cache-Control': NHO_LAU });

// Giay phep cho trinh duyet tu tai file len
const kyTaiLen = async (ten, kieu) => kyPut(CAU_HINH, ten, dauMucTaiLen(kieu), HAN_KY);

// Trinh duyet chi gui thang file len kho khi kho cho phep (CORS). Dat 1 lan luc khoi dong.
// De '*' van an toan: muon ghi duoc phai co giay phep da ky, xem thi bucket von da cong khai.
const CORS_XML = '<?xml version="1.0" encoding="UTF-8"?>'
  + '<CORSConfiguration><CORSRule>'
  + '<AllowedOrigin>*</AllowedOrigin>'
  + '<AllowedMethod>GET</AllowedMethod><AllowedMethod>PUT</AllowedMethod><AllowedMethod>HEAD</AllowedMethod>'
  + '<AllowedHeader>*</AllowedHeader>'
  + '<MaxAgeSeconds>3600</MaxAgeSeconds>'
  + '</CORSRule></CORSConfiguration>';

const datPhepTrinhDuyet = async () => {
  try {
    await goi(CAU_HINH, { cach: 'PUT', truyVan: 'cors=', than: CORS_XML, kieu: 'application/xml' });
    console.log('[KHO FILE] Da bat kho file Neon, trinh duyet tai thang len duoc');
    return true;
  } catch (err) {
    console.error('[KHO FILE] Khong dat duoc CORS:', err.message);
    return false;
  }
};

const xoa = async (ten) => {
  try {
    await goi(CAU_HINH, { cach: 'DELETE', ten });
    return true;
  } catch (err) {
    console.error('[KHO FILE] Khong xoa duoc:', err.message);
    return false;
  }
};

module.exports = { dangBat, diaChi, tenTuDiaChi, kyTaiLen, dauMucTaiLen, xoa, datPhepTrinhDuyet };
