// ================= CLOUDINARY (cách cũ, không bắt buộc) =================
// Có CLOUDINARY_URL thì ảnh sản phẩm, banner, ảnh/video hậu trường nằm trên Cloudinary.
// Không có thì các route tự quay về kho Neon / kho dữ liệu / ổ máy.
const crypto = require('crypto');
const { cloudinary: cld } = require('../config');

const dangBat = () => Boolean(cld);

// Chữ ký Cloudinary = sha1(các tham số xếp theo ABC, nối bằng & + api_secret), theo tài liệu
const ky = (thamSo) => crypto.createHash('sha1')
  .update(Object.keys(thamSo).sort().map((k) => `${k}=${thamSo[k]}`).join('&') + cld.secret)
  .digest('hex');

// Đẩy ảnh quản trị vừa chọn (sản phẩm, banner) lên Cloudinary, trả về địa chỉ ảnh
const taiAnhLen = async (buf, tenFile) => {
  const thamSo = {
    folder: 'san-pham',
    public_id: tenFile.replace(/\.\w+$/, ''),   // Cloudinary tự thêm đuôi file
    timestamp: Math.floor(Date.now() / 1000)
  };
  const form = new FormData();
  Object.entries(thamSo).forEach(([k, v]) => form.append(k, String(v)));
  form.append('api_key', cld.key);
  form.append('signature', ky(thamSo));
  form.append('file', new Blob([buf]), tenFile);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cld.cloud}/image/upload`, { method: 'POST', body: form });
  const kq = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(kq.error?.message || `Cloudinary loi ${r.status}`);
  return kq.secure_url;
};

// Gọi Admin API của Cloudinary (liệt kê, sửa, xoá file)
const goi = async (duongDan, tuyChon = {}) => {
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cld.cloud}${duongDan}`, {
    ...tuyChon,
    headers: { Authorization: 'Basic ' + Buffer.from(`${cld.key}:${cld.secret}`).toString('base64') }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || `Cloudinary lỗi ${res.status}`);
  return data;
};

const thongTin = () => cld;   // { cloud, key, secret } hoặc null

module.exports = { dangBat, ky, taiAnhLen, goi, thongTin };
