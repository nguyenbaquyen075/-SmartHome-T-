// ================= KHO FILE (anh + video) =================
// Neon Object Storage - kho file S3 nam cung tai khoan Neon, goi mien phi 5GB.
// File KHONG di qua server minh:
//  - Luc dang: server chi ky "giay phep" 15 phut, trinh duyet tu tai thang len kho.
//    Video 50MB cung khong lam nghen server Render (RAM 512MB).
//  - Luc khach xem: anh/video tai thang tu kho ve may khach.
// Chua dat bien moi truong thi tat, he thong quay ve cach cu (anh cat trong kho du lieu).
const { S3Client, PutObjectCommand, DeleteObjectCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const ENDPOINT = (process.env.NEON_S3_ENDPOINT || '').replace(/\/+$/, '');
const BUCKET = process.env.NEON_S3_BUCKET || '';
const KHOA = process.env.NEON_S3_KEY || '';
const BI_MAT_S3 = process.env.NEON_S3_SECRET || '';
const VUNG = process.env.NEON_S3_REGION || 'us-east-2';
const HAN_KY = 15 * 60;   // giay phep song 15 phut, du de tai video nang

const dangBat = () => Boolean(ENDPOINT && BUCKET && KHOA && BI_MAT_S3);

let may = null;
const noiKho = () => {
  if (!may) {
    may = new S3Client({
      region: VUNG,
      endpoint: ENDPOINT,
      credentials: { accessKeyId: KHOA, secretAccessKey: BI_MAT_S3 },
      forcePathStyle: true,                        // Neon chi nhan kieu duong dan
      requestChecksumCalculation: 'WHEN_REQUIRED'  // khong thi chu ky tai len bi tu choi
    });
  }
  return may;
};

// Bucket de public_read -> dia chi nay ai cung mo duoc, khong can ky
const diaChi = (ten) => `${ENDPOINT}/${BUCKET}/${ten}`;

// Tach ten file tu dia chi cong khai; khong phai file cua minh thi tra null
const tenTuDiaChi = (url) => {
  const dau = `${ENDPOINT}/${BUCKET}/`;
  return String(url || '').startsWith(dau) ? String(url).slice(dau.length) : null;
};

// Giay phep cho trinh duyet tu tai file len
const kyTaiLen = (ten, kieu) =>
  getSignedUrl(noiKho(), new PutObjectCommand({ Bucket: BUCKET, Key: ten, ContentType: kieu }), { expiresIn: HAN_KY });

// Trinh duyet chi gui thang file len kho khi kho cho phep (CORS). Dat 1 lan luc khoi dong.
// De '*' van an toan: muon ghi duoc phai co giay phep da ky, xem thi bucket von da cong khai.
const datPhepTrinhDuyet = async () => {
  try {
    await noiKho().send(new PutBucketCorsCommand({
      Bucket: BUCKET,
      CORSConfiguration: {
        CORSRules: [{
          AllowedOrigins: ['*'],
          AllowedMethods: ['GET', 'PUT', 'HEAD'],
          AllowedHeaders: ['*'],
          MaxAgeSeconds: 3600
        }]
      }
    }));
    console.log('[KHO FILE] Da bat kho file Neon, trinh duyet tai thang len duoc');
    return true;
  } catch (err) {
    console.error('[KHO FILE] Khong dat duoc CORS:', err.message);
    return false;
  }
};

const xoa = async (ten) => {
  try {
    await noiKho().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: ten }));
    return true;
  } catch (err) {
    console.error('[KHO FILE] Khong xoa duoc:', err.message);
    return false;
  }
};

module.exports = { dangBat, diaChi, tenTuDiaChi, kyTaiLen, xoa, datPhepTrinhDuyet };
