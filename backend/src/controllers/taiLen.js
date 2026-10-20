// Tải ảnh/video lên: xin giấy phép tải thẳng lên kho Neon, nhận ảnh base64 (cách cũ), phát ảnh trong kho dữ liệu
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const kho = require('../lib/kho');
const khoFile = require('../lib/khoFile');
const cloudinary = require('../lib/cloudinary');
const giaiTri = require('../models/giaiTri');
const tep = require('../models/tep');
const { THU_MUC_TAI_LEN } = require('../config');
const { LOI_LUU } = require('../utils/loi');

const DUOI_THEO_KIEU = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
  'video/mp4': '.mp4', 'video/quicktime': '.mov', 'video/webm': '.webm'
};
const TOI_DA_ANH = 6 * 1024 * 1024;

// Xin "giấy phép" để trình duyệt tự tải file lên kho Neon (ảnh sản phẩm, banner, hậu trường).
// File không đi qua server mình -> video nặng vẫn đăng được, server không nghẽn.
// Chưa bật kho file thì trả cach: 'server' để trình duyệt quay về lối cũ.
const xinChuKy = async (req, res) => {
  if (!khoFile.dangBat()) return res.json({ cach: 'server' });

  const kieu = String(req.body?.kieu || '');
  const duoi = DUOI_THEO_KIEU[kieu];
  if (!duoi) return res.status(400).json({ error: 'Chỉ nhận ảnh JPG, PNG, WEBP, GIF hoặc video MP4, MOV, WEBM' });

  const thuMuc = req.body?.thuMuc === giaiTri.THU_MUC ? giaiTri.THU_MUC : 'san-pham';
  const goc = String(req.body?.ten || 'file').replace(/\.\w+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const ten = `${thuMuc}/${goc || 'file'}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}${duoi}`;

  try {
    res.json({
      cach: 's3',
      ten,
      uploadUrl: await khoFile.kyTaiLen(ten, kieu),
      url: khoFile.diaChi(ten),
      dauMuc: khoFile.dauMucTaiLen(kieu)   // trình duyệt phải gửi đúng mấy đầu mục này
    });
  } catch (err) {
    console.error('Loi ky tai len:', err.message);
    res.status(502).json({ error: 'Không xin được phép tải lên, thử lại sau' });
  }
};

// Nhận ảnh dạng base64 rồi lưu (dùng base64 thay vì multipart để khỏi thêm thư viện multer).
// Thứ tự: Cloudinary -> kho dữ liệu -> file trên máy
const nhanAnh = async (req, res) => {
  const { data, name } = req.body || {};
  const khop = /^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(data || '');
  if (!khop) return res.status(400).json({ error: 'Chỉ nhận ảnh PNG, JPG hoặc WEBP' });

  const duoi = khop[1] === 'jpeg' ? 'jpg' : khop[1];
  const buf = Buffer.from(khop[2], 'base64');
  if (buf.length > TOI_DA_ANH) {
    return res.status(413).json({ error: 'Ảnh quá nặng, tối đa 6MB. Nén bớt rồi tải lại.' });
  }

  const anToan = String(name || 'anh').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const tenFile = `${anToan}-${Date.now()}.${duoi}`;

  if (cloudinary.dangBat()) {
    try {
      return res.json({ url: await cloudinary.taiAnhLen(buf, tenFile) });
    } catch (err) {
      console.error('Loi tai anh len Cloudinary:', err.message);
      return res.status(502).json({ error: 'Không tải được ảnh lên kho ảnh, thử lại sau' });
    }
  }

  // Không có Cloudinary nhưng có kho dữ liệu: cất ảnh luôn vào kho, không mất khi deploy
  if (kho.dangDungDB()) {
    if (!(await kho.ghiAnh(tenFile, `image/${khop[1]}`, buf))) return res.status(500).json(LOI_LUU);
    return res.json({ url: `/api/anh/${tenFile}` });
  }

  // Chạy ở máy mình, chưa có kho: ghi ra file
  try {
    fs.mkdirSync(THU_MUC_TAI_LEN, { recursive: true });
    fs.writeFileSync(path.join(THU_MUC_TAI_LEN, tenFile), buf);
    res.json({ url: `/images/tai-len/${tenFile}` });
  } catch (err) {
    console.error('Lỗi lưu ảnh:', err);
    res.status(500).json({ error: 'Không lưu được ảnh' });
  }
};

// Ảnh nằm trong kho: tên có sẵn dấu thời gian nên không bao giờ đổi -> cho cache 1 năm.
// Tệp ghi chú và ảnh khách hàng là riêng tư: không phát qua đường này.
const phatAnh = async (req, res) => {
  if (req.params.id.startsWith(tep.TIEN_TO_TEP) || tep.laAnhKhach(req.params.id)) return res.status(404).json({ error: 'Không tìm thấy ảnh' });
  if (!kho.dangDungDB()) return res.status(404).json({ error: 'Không có ảnh' });
  try {
    const anh = await kho.docAnh(req.params.id);
    if (!anh) return res.status(404).json({ error: 'Không tìm thấy ảnh' });
    res.setHeader('Content-Type', anh.kieu);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(anh.du_lieu);
  } catch (err) {
    console.error('Loi doc anh:', err.message);
    res.status(500).json({ error: 'Không đọc được ảnh' });
  }
};

module.exports = { xinChuKy, nhanAnh, phatAnh };
