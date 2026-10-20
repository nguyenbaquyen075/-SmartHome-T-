// ================= KY TEN CHO KHO FILE S3 =================
// Thay cho bo thu vien @aws-sdk (hon 100 goi, 11MB) - minh chi can dung 3 viec:
// ky giay phep tai len, xoa file, bat CORS. Viet tay bang crypto san co cua Node
// cho build nhanh va nhe, khong phu thuoc goi ngoai.
//
// Cach ky la AWS Signature V4, theo tai lieu cua Amazon (Neon dung y het chuan nay).
const crypto = require('crypto');

const bam = (s) => crypto.createHash('sha256').update(s).digest('hex');
const hmac = (khoa, s) => crypto.createHmac('sha256', khoa).update(s).digest();
const KHONG_KY = 'UNSIGNED-PAYLOAD';

// Ma hoa cho duong dan: giu dau / , con lai theo chuan RFC 3986
const mhDuongDan = (s) => String(s).split('/').map(encodeURIComponent).join('/');
const mh = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

// "2026-09-22T10:20:30Z" -> { ngayGio: '20260922T102030Z', ngay: '20260922' }
const thoiDiem = () => {
  const ngayGio = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  return { ngayGio, ngay: ngayGio.slice(0, 8) };
};

const khoaKy = (biMat, ngay, vung) =>
  hmac(hmac(hmac(hmac('AWS4' + biMat, ngay), vung), 's3'), 'aws4_request');

// Gom cac phan thanh "canonical request" roi ky, tra ve chu ky hex
const kyYeuCau = ({ cach, duongDan, truyVan, dauMuc, bamThan, cauHinh, td }) => {
  const tenDauMuc = Object.keys(dauMuc).map((k) => k.toLowerCase()).sort();
  const dongDauMuc = tenDauMuc.map((k) => {
    const [ten] = Object.entries(dauMuc).find(([t]) => t.toLowerCase() === k);
    return `${k}:${String(dauMuc[ten]).trim()}\n`;
  }).join('');
  const dsDauMuc = tenDauMuc.join(';');

  const yeuCau = [cach, duongDan, truyVan, dongDauMuc, dsDauMuc, bamThan].join('\n');
  const pham = `${td.ngay}/${cauHinh.vung}/s3/aws4_request`;
  const deKy = ['AWS4-HMAC-SHA256', td.ngayGio, pham, bam(yeuCau)].join('\n');
  return {
    chuKy: hmac(khoaKy(cauHinh.biMat, td.ngay, cauHinh.vung), deKy).toString('hex'),
    pham,
    dsDauMuc
  };
};

// Giay phep cho trinh duyet tu tai file len (khong lo khoa bi mat ra ngoai).
// dauMuc = nhung dau muc trinh duyet bat buoc phai gui kem, vd Content-Type.
const kyTaiLen = (cauHinh, ten, dauMuc, songGiay) => {
  const td = thoiDiem();
  const may = new URL(cauHinh.endpoint);
  const duongDan = `/${cauHinh.bucket}/${mhDuongDan(ten)}`;
  const dauMucKy = { host: may.host, ...dauMuc };
  const dsDauMuc = Object.keys(dauMucKy).map((k) => k.toLowerCase()).sort().join(';');

  const truyVan = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', `${cauHinh.khoa}/${td.ngay}/${cauHinh.vung}/s3/aws4_request`],
    ['X-Amz-Date', td.ngayGio],
    ['X-Amz-Expires', String(songGiay)],
    ['X-Amz-SignedHeaders', dsDauMuc]
  ].map(([k, v]) => `${mh(k)}=${mh(v)}`).sort().join('&');

  const { chuKy } = kyYeuCau({
    cach: 'PUT', duongDan, truyVan, dauMuc: dauMucKy, bamThan: KHONG_KY, cauHinh, td
  });
  return `${cauHinh.endpoint}${duongDan}?${truyVan}&X-Amz-Signature=${chuKy}`;
};

// Goi thang tu server (xoa file, bat CORS): ky vao dau muc Authorization
const goi = async (cauHinh, { cach, ten = '', truyVan = '', than = '', kieu }) => {
  const td = thoiDiem();
  const may = new URL(cauHinh.endpoint);
  const duongDan = `/${cauHinh.bucket}${ten ? '/' + mhDuongDan(ten) : ''}`;
  const bamThan = bam(than);

  const dauMuc = {
    host: may.host,
    'x-amz-content-sha256': bamThan,
    'x-amz-date': td.ngayGio,
    ...(kieu ? { 'content-type': kieu } : {})
  };
  const { chuKy, pham, dsDauMuc } = kyYeuCau({ cach, duongDan, truyVan, dauMuc, bamThan, cauHinh, td });

  const res = await fetch(`${cauHinh.endpoint}${duongDan}${truyVan ? '?' + truyVan : ''}`, {
    method: cach,
    headers: {
      ...dauMuc,
      Authorization: `AWS4-HMAC-SHA256 Credential=${cauHinh.khoa}/${pham},`
        + ` SignedHeaders=${dsDauMuc}, Signature=${chuKy}`
    },
    body: than || undefined
  });
  if (!res.ok) throw new Error(`Kho file tra ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res;
};

module.exports = { kyTaiLen, goi };
