// Hậu trường thi công: ảnh/video. Lưu ở 1 trong 3 nơi:
//  - Cloudinary (có CLOUDINARY_URL): danh sách đọc thẳng từ Cloudinary, chú thích nằm trong context
//  - Kho Neon (có NEON_S3_*): trình duyệt tải thẳng file lên, xong báo lại /giai-tri/xong
//  - Máy mình: nhận nguyên file qua /giai-tri/tai-len
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const kho = require('../lib/kho');
const khoFile = require('../lib/khoFile');
const cloudinary = require('../lib/cloudinary');
const giaiTri = require('../models/giaiTri');
const { laQuanTri } = require('../middleware/xacThuc');
const { THU_MUC_GIAI_TRI_FILE } = require('../config');
const { giaiMa } = require('../utils/chuanHoa');
const { LOI_LUU } = require('../utils/loi');

// Cache 60s trong bộ nhớ cho khách xem, để khỏi vượt giới hạn 500 lần/giờ của Admin API Cloudinary.
// Quản trị luôn lấy mới. Mỗi loại lấy tối đa 100 file, quá thì cần phân trang.
let cache = null;

const danhSach = async (req, res) => {
  if (!cloudinary.dangBat()) return res.json(giaiTri.sapXep(giaiTri.doc()));
  if (!laQuanTri(req) && cache && Date.now() - cache.luc < 60000) {
    return res.json(cache.ds);
  }
  try {
    const [anh, video] = await Promise.all(['image', 'video'].map((loai) =>
      cloudinary.goi(`/resources/${loai}/tags/${giaiTri.THU_MUC}?context=true&max_results=100`)
    ));
    const ds = [...anh.resources, ...video.resources]
      .map((r) => ({
        id: r.public_id,
        loai: r.resource_type,
        url: r.secure_url,
        chuThich: r.context?.custom?.caption || '',
        ngay: r.context?.custom?.ngay || r.created_at.slice(0, 10),
        ghim: r.context?.custom?.ghim === '1'
      }));
    // Bài đã đăng từ trước lên kho Neon vẫn giữ trong kho dữ liệu: gộp vào để không biến mất khi đổi sang Cloudinary
    const co = new Set(ds.map((b) => b.id));
    giaiTri.doc().forEach((b) => { if (!co.has(b.id)) ds.push(b); });
    giaiTri.sapXep(ds);
    cache = { luc: Date.now(), ds };
    res.json(ds);
  } catch (err) {
    console.error('Lỗi tải giải trí:', err.message);
    res.status(502).json({ error: 'Không tải được ảnh/video' });
  }
};

// Ký tên cho trình duyệt tải thẳng file lên Cloudinary - video nặng không đi qua server mình
const xinChuKy = (req, res) => {
  // Chưa có Cloudinary: trình duyệt gửi file thẳng lên server mình (taiLen bên dưới)
  if (!cloudinary.dangBat()) return res.json({ uploadUrl: '/api/giai-tri/tai-len' });
  const cld = cloudinary.thongTin();
  const thamSo = {
    context: giaiTri.taoContext(giaiTri.chuanHoaBai(req.body)),
    folder: giaiTri.THU_MUC,
    tags: giaiTri.THU_MUC,
    timestamp: Math.floor(Date.now() / 1000)
  };
  res.json({
    ...thamSo,
    signature: cloudinary.ky(thamSo),
    api_key: cld.key,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cld.cloud}/auto/upload`
  });
};

// Cho trang quản trị biết đang lưu ở đâu
const cheDo = (req, res) =>
  res.json({ cheDo: khoFile.dangBat() ? 'kho-neon' : cloudinary.dangBat() ? 'cloudinary' : kho.dangDungDB() ? 'kho-du-lieu' : 'may' });

// Lưu trên máy: nhận nguyên file (không đổi base64) nên video 100MB vẫn qua được.
// Thông tin bài gửi kèm trong header X-Bai để khỏi phải thêm multer đọc multipart.
const taiLen = async (req, res) => {
  if (cloudinary.dangBat()) return res.status(400).json({ error: 'Server đang dùng Cloudinary' });
  const duoi = path.extname(giaiMa(req.headers['x-ten-file'])).toLowerCase();
  const loai = giaiTri.loaiTheoDuoi(duoi);
  if (!loai || !req.body?.length) {
    return res.status(400).json({ error: 'Chỉ nhận ảnh JPG, PNG, WEBP, GIF hoặc video MP4, MOV, WEBM' });
  }
  let bai = {};
  try { bai = JSON.parse(giaiMa(req.headers['x-bai']) || '{}'); } catch { /* dùng giá trị mặc định */ }

  const tenFile = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${duoi}`;
  let url = giaiTri.URL_FILE_MAY + tenFile;

  // Ảnh thì cất vào kho dữ liệu cho khỏi mất khi deploy lại.
  // Video vẫn phải nằm trên đĩa (nặng cả trăm MB) -> muốn giữ lâu thì cần kho Neon / Cloudinary.
  if (loai === 'image' && kho.dangDungDB()) {
    if (!(await kho.ghiAnh(tenFile, giaiTri.KIEU_ANH[duoi] || 'image/jpeg', req.body))) {
      return res.status(500).json(LOI_LUU);
    }
    url = `/api/anh/${tenFile}`;
  } else {
    try {
      fs.mkdirSync(THU_MUC_GIAI_TRI_FILE, { recursive: true });
      fs.writeFileSync(path.join(THU_MUC_GIAI_TRI_FILE, tenFile), req.body);
    } catch (err) {
      console.error('Lỗi lưu file giải trí:', err);
      return res.status(500).json({ error: 'Không lưu được file' });
    }
  }

  const moi = { id: `${giaiTri.THU_MUC}/${tenFile}`, loai, url, ...giaiTri.chuanHoaBai(bai) };
  if (!(await giaiTri.ghi([...giaiTri.doc(), moi]))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
};

// Trình duyệt tải file lên kho Neon xong thì báo lại đây để ghi thành bài
const daTaiXong = async (req, res) => {
  const ten = khoFile.tenTuDiaChi(req.body?.url);   // chỉ nhận file nằm trong kho của mình
  if (!ten || !ten.startsWith(`${giaiTri.THU_MUC}/`)) {
    return res.status(400).json({ error: 'Đường dẫn file không hợp lệ' });
  }
  const loai = giaiTri.loaiTheoDuoi(path.extname(ten).toLowerCase());
  if (!loai) return res.status(400).json({ error: 'Chỉ nhận ảnh hoặc video' });

  // Ảnh bìa của video (khung hình đầu do trình duyệt chụp): chỉ nhận file nằm trong kho của mình
  const tenBia = khoFile.tenTuDiaChi(req.body.poster);
  const coBia = loai === 'video' && tenBia && tenBia.startsWith(`${giaiTri.THU_MUC}/`)
    && giaiTri.DUOI_HOP_LE.image.includes(path.extname(tenBia).toLowerCase());

  const moi = { id: ten, loai, url: req.body.url, ...(coBia ? { poster: req.body.poster } : {}), ...giaiTri.chuanHoaBai(req.body) };
  if (!(await giaiTri.ghi([...giaiTri.doc(), moi]))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
};

// Sửa chú thích, ngày, ghim
const sua = async (req, res) => {
  const { id, loai } = req.body || {};
  if (!giaiTri.laBaiHopLe(id, loai)) return res.status(400).json({ error: 'Bài không hợp lệ' });
  const bai = giaiTri.chuanHoaBai(req.body);

  if (!cloudinary.dangBat() || giaiTri.trongKho(id)) {
    const ds = giaiTri.doc();
    const i = ds.findIndex((b) => b.id === id);
    if (i === -1) return res.status(404).json({ error: 'Không tìm thấy bài' });
    ds[i] = { ...ds[i], ...bai };
    if (!(await giaiTri.ghi(ds))) return res.status(500).json(LOI_LUU);
    cache = null;
    return res.json(ds[i]);
  }
  try {
    await cloudinary.goi(`/resources/${loai}/upload/${id}`, {
      method: 'POST',
      body: new URLSearchParams({ context: giaiTri.taoContext(bai) })
    });
    cache = null;
    res.json({ id, loai, ...bai });
  } catch (err) {
    console.error('Lỗi sửa giải trí:', err.message);
    res.status(502).json({ error: 'Không lưu được, thử lại sau' });
  }
};

const xoa = async (req, res) => {
  const { id, loai } = req.body || {};
  if (!giaiTri.laBaiHopLe(id, loai)) return res.status(400).json({ error: 'Bài không hợp lệ' });

  if (!cloudinary.dangBat() || giaiTri.trongKho(id)) {
    const ds = giaiTri.doc();
    const bai = ds.find((b) => b.id === id);
    if (!bai) return res.status(404).json({ error: 'Không tìm thấy bài' });
    if (!(await giaiTri.ghi(ds.filter((b) => b.id !== id)))) return res.status(500).json(LOI_LUU);
    cache = null;
    const tenKho = khoFile.tenTuDiaChi(bai.url);
    const tenBia = khoFile.tenTuDiaChi(bai.poster);
    if (tenBia) await khoFile.xoa(tenBia);   // xoá luôn ảnh bìa của video
    if (tenKho) await khoFile.xoa(tenKho);
    else if (bai.url.startsWith('/api/anh/')) await kho.xoaAnh(path.basename(bai.url));
    else if (bai.url.startsWith(giaiTri.URL_FILE_MAY)) {
      fs.rmSync(path.join(THU_MUC_GIAI_TRI_FILE, path.basename(bai.url)), { force: true });
    }
    return res.json({ success: true });
  }
  try {
    await cloudinary.goi(`/resources/${loai}/upload?public_ids[]=${encodeURIComponent(id)}`, { method: 'DELETE' });
    cache = null;
    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi xóa giải trí:', err.message);
    res.status(502).json({ error: 'Không xóa được, thử lại sau' });
  }
};

module.exports = { danhSach, xinChuKy, cheDo, taiLen, daTaiXong, sua, xoa };
