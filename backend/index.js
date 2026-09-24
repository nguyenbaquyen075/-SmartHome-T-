const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const kho = require('./kho');
const khoFile = require('./khoFile');

const app = express();
// Render dung proxy o truoc: bat cai nay moi doc duoc dia chi that cua khach
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5001;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '12mb' }));

// Ten cac muc trong kho du lieu (xem backend/kho.js): co DATABASE_URL thi nam tren
// co so du lieu (deploy lai khong mat), khong thi la file backend/data/<ten>.json
const KHO_SAN_PHAM = 'products';
const KHO_CONG_TRINH = 'projects';
const KHO_CAI_DAT = 'settings';
const KHO_GIAI_TRI = 'giai-tri';
const KHO_DANH_MUC = 'danh-muc';     // danh muc san pham, them/sua/xoa trong trang quan tri
const KHO_QUAN_TRI = 'quan-tri';     // tai khoan/mat khau doi trong trang Cai dat
const CAI_DAT_MAC_DINH = { ticker: [], banner: null };

// Danh muc luc moi cai dat: dung 3 danh muc web dang co. icon la khoa trong frontend/src/utils/danhMuc.jsx
const DANH_MUC_MAC_DINH = [
  { id: 'dm-mang', ten: 'Thiết bị mạng', icon: 'cctv', anh: '/images/cat_style_new/prod_3.png' },
  { id: 'dm-dien', ten: 'Thiết bị điện', icon: 'zap', anh: '/images/cat_style_new/prod_1.png' },
  { id: 'dm-nuoc', ten: 'Thiết bị nước', icon: 'droplets', anh: '/images/cat_style_new/prod_2.png' }
];
const docDanhMuc = () => kho.doc(KHO_DANH_MUC, DANH_MUC_MAC_DINH);

// Kho hong (mat mang, DB day...) thi bao that cho admin, khong bao "da luu" gia
const LOI_LUU = { error: 'Không lưu được dữ liệu, kiểm tra mạng rồi thử lại' };

// ================= XAC THUC QUAN TRI =================
// Mat khau dat qua bien moi truong ADMIN_PASSWORD (tren Render: Environment).
// Khong dat thi dung mat khau tam - chi hop khi chay o may minh.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'diennuoc@2026';
// Tai khoan dang nhap: email hoac so dien thoai, dat qua ADMIN_TAI_KHOAN.
// Nhieu tai khoan thi ngan cach bang dau phay: "toi@gmail.com, 0987654321"
const ADMIN_TAI_KHOAN = process.env.ADMIN_TAI_KHOAN || '0987654321';
if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_TAI_KHOAN) {
  console.warn('[CANH BAO] Chua dat ADMIN_TAI_KHOAN / ADMIN_PASSWORD, dang dung tai khoan tam.');
}

// So sanh tai khoan: bo khoang trang, dau cham/gach cua so dien thoai, khong phan biet hoa thuong
const chuanTaiKhoan = (v) => String(v || '').trim().toLowerCase().replace(/[\s.()-]/g, '');

// Phien dang nhap dang "<han dung>.<chu ky>", chu ky = HMAC bang bi mat cua server.
// Khong giu trong bo nho nen server ngu day / deploy lai van dang nhap duoc tiep.
// Doi mat khau la moi phien cu het hieu luc (vi bi mat doi theo).
const crypto = require('crypto');
const BI_MAT = process.env.ADMIN_SECRET || `${ADMIN_TAI_KHOAN}|${ADMIN_PASSWORD}`;
const HAN_PHIEN = 7 * 24 * 60 * 60 * 1000;   // 7 ngay
const daThoat = new Set();                   // token bam "Dang xuat" (chi trong lan chay nay)

// Mat khau khong bao gio cat nguyen chu: bam bang scrypt kem muoi ngau nhien
const bamMatKhau = (mk) => {
  const muoi = crypto.randomBytes(16).toString('hex');
  return `scrypt$${muoi}$${crypto.scryptSync(String(mk), muoi, 32).toString('hex')}`;
};
const khopMatKhau = (mk, bam) => {
  const [kieu, muoi, dung] = String(bam || '').split('$');
  if (kieu !== 'scrypt' || !muoi || !dung) return false;
  const thu = crypto.scryptSync(String(mk), muoi, 32).toString('hex');
  return thu.length === dung.length && crypto.timingSafeEqual(Buffer.from(thu), Buffer.from(dung));
};

// Tai khoan dang dung: uu tien cai da doi trong trang Cai dat, chua doi thi lay bien moi truong
const taiKhoanTrongKho = () => {
  const t = kho.doc(KHO_QUAN_TRI, {});
  return t && typeof t === 'object' && !Array.isArray(t) ? t : {};
};
const dungTaiKhoanKhong = (nhap) => {
  const luu = taiKhoanTrongKho();
  const ds = luu.taiKhoan ? [luu.taiKhoan] : ADMIN_TAI_KHOAN.split(',');
  return ds.some((tk) => tk.trim() && chuanTaiKhoan(tk) === chuanTaiKhoan(nhap));
};
const dungMatKhauKhong = (nhap) => {
  const luu = taiKhoanTrongKho();
  return luu.matKhauBam ? khopMatKhau(nhap, luu.matKhauBam) : String(nhap) === ADMIN_PASSWORD;
};

// Bi mat ky phien co ca mat khau va moc "dang xuat moi noi": doi mat khau hay bam
// dang xuat moi noi la moi phien cu het hieu luc ngay.
const biMatPhien = () => {
  const luu = taiKhoanTrongKho();
  return `${BI_MAT}|${luu.matKhauBam || ''}|${luu.phienTu || 0}`;
};

const kyPhien = (han) => crypto.createHmac('sha256', biMatPhien()).update(String(han)).digest('hex');
const taoPhien = () => {
  const han = Date.now() + HAN_PHIEN;
  return `${han}.${kyPhien(han)}`;
};
const phienHopLe = (token) => {
  const [han, chuKy] = String(token || '').split('.');
  if (!han || !chuKy || !(Number(han) > Date.now()) || daThoat.has(token)) return false;
  const dung = kyPhien(han);
  return chuKy.length === dung.length
    && crypto.timingSafeEqual(Buffer.from(chuKy), Buffer.from(dung));
};

const laToken = (req) => (req.headers.authorization || '').replace('Bearer ', '');

const canQuyen = (req, res, next) => {
  if (phienHopLe(laToken(req))) return next();
  res.status(401).json({ error: 'Cần đăng nhập quản trị' });
};

// Chan do mat khau: sai nhieu lan tu cung mot noi thi phai doi.
// Dem trong bo nho, du cho 1 trang nho; server khoi dong lai thi dem lai tu dau.
const CHO_PHEP_SAI = 8;
const KHOA_TRONG = 15 * 60 * 1000;
const demSai = new Map();   // dia chi -> { so, den }

const conKhoa = (noi) => {
  const d = demSai.get(noi);
  if (!d) return 0;
  if (d.den < Date.now()) { demSai.delete(noi); return 0; }
  return d.so >= CHO_PHEP_SAI ? Math.ceil((d.den - Date.now()) / 60000) : 0;
};

const demThemMotLanSai = (noi) => {
  const d = demSai.get(noi);
  const con = d && d.den > Date.now() ? d.so : 0;
  demSai.set(noi, { so: con + 1, den: Date.now() + KHOA_TRONG });
  // Don cho khoi phinh bo nho
  if (demSai.size > 500) for (const [k, v] of demSai) if (v.den < Date.now()) demSai.delete(k);
};

app.post('/api/admin/login', (req, res) => {
  const noi = req.ip || 'khong-ro';
  const phutConLai = conKhoa(noi);
  if (phutConLai) {
    return res.status(429).json({ error: `Sai quá nhiều lần, thử lại sau ${phutConLai} phút` });
  }

  // Bao chung 1 cau de nguoi la khong biet sai o o nao
  if (!dungTaiKhoanKhong(req.body?.taiKhoan) || !dungMatKhauKhong(req.body?.password)) {
    demThemMotLanSai(noi);
    return res.status(401).json({ error: 'Email / số điện thoại hoặc mật khẩu không đúng' });
  }
  demSai.delete(noi);
  res.json({ token: taoPhien() });
});

app.post('/api/admin/logout', canQuyen, (req, res) => {
  daThoat.add(laToken(req));
  res.json({ success: true });
});

// ---- Cai dat & bao mat tai khoan ----
app.get('/api/admin/tai-khoan', canQuyen, (req, res) => {
  const luu = taiKhoanTrongKho();
  res.json({
    taiKhoan: luu.taiKhoan || ADMIN_TAI_KHOAN,
    nguon: luu.matKhauBam ? 'kho' : 'bien-moi-truong',
    doiLuc: luu.doiLuc || null,
    kho: {
      duLieu: kho.dangDungDB() ? 'neon' : 'file',
      file: khoFile.dangBat() ? 'kho-neon' : cld ? 'cloudinary' : kho.dangDungDB() ? 'kho-du-lieu' : 'may'
    }
  });
});

// Doi tai khoan va/hoac mat khau. Bat buoc nhap dung mat khau hien tai.
app.put('/api/admin/tai-khoan', canQuyen, async (req, res) => {
  const { matKhauHienTai, taiKhoanMoi, matKhauMoi } = req.body || {};
  if (!dungMatKhauKhong(matKhauHienTai)) {
    return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
  }

  const moi = { ...taiKhoanTrongKho() };

  if (taiKhoanMoi !== undefined) {
    const tk = String(taiKhoanMoi).trim();
    const laEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tk);
    const laSo = /^[\d\s.()+-]{9,15}$/.test(tk);
    if (!laEmail && !laSo) return res.status(400).json({ error: 'Cần nhập email hợp lệ hoặc số điện thoại' });
    moi.taiKhoan = tk;
  }

  if (matKhauMoi !== undefined) {
    if (String(matKhauMoi).length < 8) return res.status(400).json({ error: 'Mật khẩu mới cần ít nhất 8 ký tự' });
    moi.matKhauBam = bamMatKhau(matKhauMoi);
  }

  // Chua tung doi thi ghi luon cai dang dung vao kho, de sau nay doi bien tren Render
  // cung khong lam anh mat tai khoan
  if (!moi.matKhauBam) moi.matKhauBam = bamMatKhau(ADMIN_PASSWORD);
  if (!moi.taiKhoan) moi.taiKhoan = ADMIN_TAI_KHOAN.split(',')[0].trim();
  moi.doiLuc = new Date().toISOString();

  if (!(await kho.ghi(KHO_QUAN_TRI, moi))) return res.status(500).json(LOI_LUU);
  // Doi mat khau lam bi mat ky phien doi theo -> phien cu het han, cap phien moi ngay
  res.json({ taiKhoan: moi.taiKhoan, token: matKhauMoi !== undefined ? taoPhien() : undefined });
});

// Dang xuat khoi moi thiet bi: doi moc phien -> moi token da phat deu vo hieu
app.post('/api/admin/dang-xuat-moi-noi', canQuyen, async (req, res) => {
  const moi = { ...taiKhoanTrongKho(), phienTu: Date.now() };
  if (!moi.matKhauBam) moi.matKhauBam = bamMatKhau(ADMIN_PASSWORD);
  if (!(await kho.ghi(KHO_QUAN_TRI, moi))) return res.status(500).json(LOI_LUU);
  res.json({ success: true, token: taoPhien() });   // may dang dung thi cap phien moi
});

// Kiem tra token con hieu luc (dung khi tai lai trang)
app.get('/api/admin/check', canQuyen, (req, res) => res.json({ ok: true }));

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET /api/projects (Nhat ky thi cong - moi nhat truoc)
app.get('/api/projects', (req, res) => {
  const projects = kho.doc(KHO_CONG_TRINH);
  projects.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  res.json(projects);
});

// POST /api/projects (them cong trinh)
app.post('/api/projects', canQuyen, async (req, res) => {
  const projects = kho.doc(KHO_CONG_TRINH);
  const moi = {
    id: req.body.id || 'ct-' + Date.now(),
    title: req.body.title || '',
    address: req.body.address || '',
    customerType: req.body.customerType || '',
    startDate: req.body.startDate || new Date().toISOString().slice(0, 10),
    durationDays: Number(req.body.durationDays) || 0,
    status: req.body.status || 'Hoàn thành',
    description: req.body.description || '',
    image: req.body.image || '/images/cat_tools.jpg'
  };
  projects.push(moi);
  if (!(await kho.ghi(KHO_CONG_TRINH, projects))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
});

// PUT /api/projects/:id (sua cong trinh)
app.put('/api/projects/:id', canQuyen, async (req, res) => {
  const projects = kho.doc(KHO_CONG_TRINH);
  const i = projects.findIndex((p) => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy công trình' });
  projects[i] = { ...projects[i], ...req.body, id: projects[i].id };
  if (!(await kho.ghi(KHO_CONG_TRINH, projects))) return res.status(500).json(LOI_LUU);
  res.json(projects[i]);
});

// DELETE /api/projects/:id
app.delete('/api/projects/:id', canQuyen, async (req, res) => {
  const projects = kho.doc(KHO_CONG_TRINH);
  const con = projects.filter((p) => p.id !== req.params.id);
  if (con.length === projects.length) return res.status(404).json({ error: 'Không tìm thấy công trình' });
  if (!(await kho.ghi(KHO_CONG_TRINH, con))) return res.status(500).json(LOI_LUU);
  res.json({ success: true });
});

// GET /api/settings (thanh chay + anh banner) - ai cung doc duoc
app.get('/api/settings', (req, res) => {
  const s = kho.doc(KHO_CAI_DAT, CAI_DAT_MAC_DINH);
  res.json(Array.isArray(s) ? { ticker: [], banner: null } : s);
});

// PUT /api/settings
app.put('/api/settings', canQuyen, async (req, res) => {
  const hienTai = kho.doc(KHO_CAI_DAT, CAI_DAT_MAC_DINH);
  const moi = {
    ticker: Array.isArray(req.body.ticker) ? req.body.ticker.filter((t) => t.trim()) : hienTai.ticker,
    banner: 'banner' in req.body ? req.body.banner : hienTai.banner
  };
  if (!(await kho.ghi(KHO_CAI_DAT, moi))) return res.status(500).json(LOI_LUU);
  res.json(moi);
});

// ================= KHO ANH/VIDEO (CLOUDINARY) =================
// Co CLOUDINARY_URL (bat buoc tren Render vi o dia Render mat file moi lan deploy):
// anh san pham, anh banner, anh/video hau truong deu nam tren Cloudinary - khong mat.
// Gia tri = dong "API environment variable" trong trang Cloudinary, dang:
// cloudinary://<api_key>:<api_secret>@<cloud_name>
// Khong co thi luu ngay tren may de chay thu.
const cld = (() => {
  try {
    const u = new URL(process.env.CLOUDINARY_URL);
    return { cloud: u.hostname, key: decodeURIComponent(u.username), secret: decodeURIComponent(u.password) };
  } catch {
    return null;
  }
})();

// Chu ky Cloudinary = sha1(cac tham so xep theo ABC, noi bang & + api_secret), theo tai lieu
const kyCloudinary = (thamSo) => crypto.createHash('sha1')
  .update(Object.keys(thamSo).sort().map((k) => `${k}=${thamSo[k]}`).join('&') + cld.secret)
  .digest('hex');

// Day anh quan tri vua chon (san pham, banner) len Cloudinary, tra ve dia chi anh
const taiAnhLenCloudinary = async (buf, tenFile) => {
  const thamSo = {
    folder: 'san-pham',
    public_id: tenFile.replace(/\.\w+$/, ''),   // Cloudinary tu them duoi file
    timestamp: Math.floor(Date.now() / 1000)
  };
  const form = new FormData();
  Object.entries(thamSo).forEach(([k, v]) => form.append(k, String(v)));
  form.append('api_key', cld.key);
  form.append('signature', kyCloudinary(thamSo));
  form.append('file', new Blob([buf]), tenFile);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cld.cloud}/image/upload`, { method: 'POST', body: form });
  const kq = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(kq.error?.message || `Cloudinary loi ${r.status}`);
  return kq.secure_url;
};

// Xin "giay phep" de trinh duyet tu tai file len kho Neon (anh san pham, banner, hau truong).
// File khong di qua server minh -> video nang van dang duoc, server khong nghen.
// Chua bat kho file thi tra cach: 'server' de trinh duyet quay ve loi cu.
const DUOI_THEO_KIEU = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
  'video/mp4': '.mp4', 'video/quicktime': '.mov', 'video/webm': '.webm'
};

app.post('/api/tai-len/chu-ky', canQuyen, async (req, res) => {
  if (!khoFile.dangBat()) return res.json({ cach: 'server' });

  const kieu = String(req.body?.kieu || '');
  const duoi = DUOI_THEO_KIEU[kieu];
  if (!duoi) return res.status(400).json({ error: 'Chỉ nhận ảnh JPG, PNG, WEBP, GIF hoặc video MP4, MOV, WEBM' });

  const thuMuc = req.body?.thuMuc === THU_MUC_GIAI_TRI ? THU_MUC_GIAI_TRI : 'san-pham';
  const goc = String(req.body?.ten || 'file').replace(/\.\w+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const ten = `${thuMuc}/${goc || 'file'}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}${duoi}`;

  try {
    res.json({
      cach: 's3',
      ten,
      uploadUrl: await khoFile.kyTaiLen(ten, kieu),
      url: khoFile.diaChi(ten),
      dauMuc: khoFile.dauMucTaiLen(kieu)   // trinh duyet phai gui dung may dau muc nay
    });
  } catch (err) {
    console.error('Loi ky tai len:', err.message);
    res.status(502).json({ error: 'Không xin được phép tải lên, thử lại sau' });
  }
});

// POST /api/upload - nhan anh dang base64 roi ghi ra file.
// Dung base64 thay vi multipart de khoi them thu vien multer.
app.post('/api/upload', canQuyen, async (req, res) => {
  const { data, name } = req.body || {};
  const khop = /^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(data || '');
  if (!khop) return res.status(400).json({ error: 'Chỉ nhận ảnh PNG, JPG hoặc WEBP' });

  const duoi = khop[1] === 'jpeg' ? 'jpg' : khop[1];
  const buf = Buffer.from(khop[2], 'base64');
  if (buf.length > 6 * 1024 * 1024) {
    return res.status(413).json({ error: 'Ảnh quá nặng, tối đa 6MB. Nén bớt rồi tải lại.' });
  }

  const anToan = String(name || 'anh').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const tenFile = `${anToan}-${Date.now()}.${duoi}`;

  if (cld) {
    try {
      return res.json({ url: await taiAnhLenCloudinary(buf, tenFile) });
    } catch (err) {
      console.error('Loi tai anh len Cloudinary:', err.message);
      return res.status(502).json({ error: 'Không tải được ảnh lên kho ảnh, thử lại sau' });
    }
  }

  // Khong co Cloudinary nhung co kho du lieu: cat anh luon vao kho, khong mat khi deploy
  if (kho.dangDungDB()) {
    if (!(await kho.ghiAnh(tenFile, `image/${khop[1]}`, buf))) return res.status(500).json(LOI_LUU);
    return res.json({ url: `/api/anh/${tenFile}` });
  }

  // Chay o may minh, chua co kho: ghi ra file
  const thuMuc = path.join(__dirname, '..', 'frontend', 'public', 'images', 'tai-len');

  try {
    fs.mkdirSync(thuMuc, { recursive: true });
    fs.writeFileSync(path.join(thuMuc, tenFile), buf);
    res.json({ url: `/images/tai-len/${tenFile}` });
  } catch (err) {
    console.error('Lỗi lưu ảnh:', err);
    res.status(500).json({ error: 'Không lưu được ảnh' });
  }
});

// Anh nam trong kho: ten co san ky tu thoi gian nen khong bao gio doi -> cho cache 1 nam
app.get('/api/anh/:id', async (req, res) => {
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
});

// GET /api/categories (chi ten, co 'Tất cả' dau tien - trang san pham dung)
app.get('/api/categories', (req, res) => {
  res.json(['Tất cả', ...docDanhMuc().map((d) => d.ten)]);
});

// ---- Danh muc san pham (quan tri them / sua / xoa) ----
const ICON_DANH_MUC = ['cctv', 'zap', 'droplets', 'wifi', 'wrench', 'lightbulb', 'shield', 'package', 'plug', 'sun'];
const trungTen = (ds, ten, boQuaId) =>
  ds.some((d) => d.id !== boQuaId && d.ten.toLowerCase() === ten.toLowerCase());

// GET /api/danh-muc - ai cung doc duoc
app.get('/api/danh-muc', (req, res) => res.json(docDanhMuc()));

// Kiem tra ten + icon, tra ve { loi } hoac { ten, icon }
const kiemDanhMuc = (b, ds, boQuaId) => {
  const ten = chuoi(b.ten, 60);
  if (!ten) return { loi: 'Nhập tên danh mục' };
  if (ten.toLowerCase() === 'tất cả') return { loi: '"Tất cả" là mục có sẵn, chọn tên khác' };
  if (trungTen(ds, ten, boQuaId)) return { loi: 'Đã có danh mục tên này' };
  return { ten, icon: ICON_DANH_MUC.includes(b.icon) ? b.icon : 'package' };
};

// POST /api/danh-muc
app.post('/api/danh-muc', canQuyen, async (req, res) => {
  const ds = docDanhMuc();
  const v = kiemDanhMuc(req.body, ds);
  if (v.loi) return res.status(400).json({ error: v.loi });
  const moi = { id: `dm-${Date.now()}`, ten: v.ten, icon: v.icon, anh: '' };
  ds.push(moi);
  if (!(await kho.ghi(KHO_DANH_MUC, ds))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
});

// PUT /api/danh-muc/:id - doi ten thi san pham thuoc danh muc nay doi theo
app.put('/api/danh-muc/:id', canQuyen, async (req, res) => {
  const ds = docDanhMuc();
  const i = ds.findIndex((d) => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
  const v = kiemDanhMuc(req.body, ds, ds[i].id);
  if (v.loi) return res.status(400).json({ error: v.loi });

  const tenCu = ds[i].ten;
  ds[i] = { ...ds[i], ten: v.ten, icon: v.icon };
  if (!(await kho.ghi(KHO_DANH_MUC, ds))) return res.status(500).json(LOI_LUU);

  if (tenCu !== v.ten) {
    const sp = kho.doc(KHO_SAN_PHAM).map((p) => (p.category === tenCu ? { ...p, category: v.ten } : p));
    if (!(await kho.ghi(KHO_SAN_PHAM, sp))) return res.status(500).json(LOI_LUU);
  }
  res.json(ds[i]);
});

// DELETE /api/danh-muc/:id - con san pham thi khong cho xoa, tranh san pham mo coi
app.delete('/api/danh-muc/:id', canQuyen, async (req, res) => {
  const ds = docDanhMuc();
  const d = ds.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
  const dem = kho.doc(KHO_SAN_PHAM).filter((p) => p.category === d.ten).length;
  if (dem > 0) {
    return res.status(409).json({ error: `Còn ${dem} sản phẩm thuộc "${d.ten}". Chuyển hoặc xóa các sản phẩm đó trước.` });
  }
  if (!(await kho.ghi(KHO_DANH_MUC, ds.filter((x) => x.id !== d.id)))) return res.status(500).json(LOI_LUU);
  res.json({ success: true });
});

// GET /api/brands
app.get('/api/brands', (req, res) => {
  const products = kho.doc(KHO_SAN_PHAM);
  const brands = ['Tất cả', ...new Set(products.map((p) => p.brand))];
  res.json(brands);
});

// GET /api/products
app.get('/api/products', (req, res) => {
  let products = kho.doc(KHO_SAN_PHAM);
  const { search, category, brand, minPrice, maxPrice, sort, featured, sensor } = req.query;

  // Search by name, brand, description, category
  if (search) {
    const q = search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Loc theo danh muc: khop dung ten, khong doan mo nua.
  // 3 danh muc dung chung voi trang chu va form quan tri (xem frontend/src/utils/sanPham.jsx)
  if (category && category !== 'Tất cả') {
    const cat = String(category).trim().toLowerCase();
    products = products.filter((p) => String(p.category || '').trim().toLowerCase() === cat);
  }

  // Filter by brand
  if (brand && brand !== 'Tất cả') {
    products = products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  // Filter by sensor type
  if (sensor && sensor !== 'Tất cả') {
    products = products.filter(
      (p) => p.specs?.sensor && p.specs.sensor.toLowerCase().includes(sensor.toLowerCase())
    );
  }

  // Filter by price range
  if (minPrice) {
    products = products.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    products = products.filter((p) => p.price <= Number(maxPrice));
  }

  // Filter by featured
  if (featured === 'true') {
    products = products.filter((p) => p.featured);
  }

  // Sort
  if (sort === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating-desc') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'name-asc') {
    products.sort((a, b) => a.name.localeCompare(b.name));
  }

  res.json(products);
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const products = kho.doc(KHO_SAN_PHAM);
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  }
  res.json(product);
});

// Lam sach du lieu san pham tu trang quan tri: chi nhan dung truong, dung kieu, cat do dai
const chuoi = (v, max) => String(v ?? '').trim().slice(0, max);
const dsChuoi = (v, soDong, max = 500) =>
  (Array.isArray(v) ? v : []).map((x) => chuoi(x, max)).filter(Boolean).slice(0, soDong);
const dsThongTin = (v) => (Array.isArray(v) ? v : [])
  .map((m) => ({ tieuDe: chuoi(m?.tieuDe, 120), noiDung: dsChuoi(m?.noiDung, 30, 1000) }))
  .filter((m) => m.tieuDe && m.noiDung.length)
  .slice(0, 20);

const chuanHoaSanPham = (b = {}) => {
  const images = dsChuoi(b.images, 12);
  // Khoa thong so la nhan tieng Viet, giu dung thu tu admin nhap
  const specs = {};
  for (const [nhan, giaTri] of Object.entries(b.specs && typeof b.specs === 'object' ? b.specs : {})) {
    if (chuoi(nhan, 80) && chuoi(giaTri, 300)) specs[chuoi(nhan, 80)] = chuoi(giaTri, 300);
  }
  return {
    name: chuoi(b.name, 200),
    brand: chuoi(b.brand, 80),
    category: chuoi(b.category, 80),
    subTitle: chuoi(b.subTitle, 200),
    unit: chuoi(b.unit, 20) || 'chiếc',
    featured: Boolean(b.featured),
    image: images[0] || '',
    images,
    noiBat: (Array.isArray(b.noiBat) ? b.noiBat : [])
      .map((o) => ({ bieuTuong: chuoi(o?.bieuTuong, 20), nhan: chuoi(o?.nhan, 60), giaTri: chuoi(o?.giaTri, 60), ghiChu: chuoi(o?.ghiChu, 60) }))
      .filter((o) => o.nhan && o.giaTri)
      .slice(0, 4),
    description: chuoi(b.description, 5000),
    highlights: dsChuoi(b.highlights, 12),
    thongTin: dsThongTin(b.thongTin),
    specs,
    huongDan: dsChuoi(b.huongDan, 12),
    baoHanh: { thoiGian: chuoi(b.baoHanh?.thoiGian, 60), doiTra: chuoi(b.baoHanh?.doiTra, 120) }
  };
};

const loiSanPham = (sp) =>
  (!sp.name || !sp.brand || !sp.category || !sp.image) && 'Cần có tên, danh mục, thương hiệu và ít nhất 1 ảnh'
  || (!docDanhMuc().some((d) => d.ten === sp.category) && 'Danh mục không còn tồn tại, chọn lại danh mục');

// POST /api/products (them san pham)
app.post('/api/products', canQuyen, async (req, res) => {
  const sp = chuanHoaSanPham(req.body);
  const loi = loiSanPham(sp);
  if (loi) return res.status(400).json({ error: loi });

  const products = kho.doc(KHO_SAN_PHAM);
  const moi = { id: `sp-${Date.now()}`, ...sp };
  products.unshift(moi);
  if (!(await kho.ghi(KHO_SAN_PHAM, products))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
});

// PUT /api/products/:id (Update product)
app.put('/api/products/:id', canQuyen, async (req, res) => {
  const products = kho.doc(KHO_SAN_PHAM);
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  }

  const sp = chuanHoaSanPham(req.body);
  const loi = loiSanPham(sp);
  if (loi) return res.status(400).json({ error: loi });

  // Giu cac truong cu khong co tren form (gia, danh gia...), ghi de phan admin vua sua
  products[index] = { ...products[index], ...sp, id: products[index].id };

  if (!(await kho.ghi(KHO_SAN_PHAM, products))) return res.status(500).json(LOI_LUU);
  res.json(products[index]);
});

// DELETE /api/products/:id (Delete product)
app.delete('/api/products/:id', canQuyen, async (req, res) => {
  let products = kho.doc(KHO_SAN_PHAM);
  const exists = products.some((p) => p.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  }

  products = products.filter((p) => p.id !== req.params.id);
  if (!(await kho.ghi(KHO_SAN_PHAM, products))) return res.status(500).json(LOI_LUU);
  res.json({ success: true, message: 'Đã xóa sản phẩm' });
});

// GET /api/stats (Admin stats)
app.get('/api/stats', (req, res) => {
  const products = kho.doc(KHO_SAN_PHAM);

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.inStock || 0), 0);
  const lowStockProducts = products.filter((p) => p.inStock <= 5);

  res.json({
    totalProducts,
    totalStock,
    lowStockCount: lowStockProducts.length
  });
});

// ================= GIAI TRI (anh/video vui o cong trinh) =================
const THU_MUC_GIAI_TRI = 'giai-tri';   // dung lam ca ten thu muc lan tag tren Cloudinary
const GIAI_TRI_THU_MUC = path.join(__dirname, 'data', 'giai-tri-file');
const URL_FILE_MAY = '/api/giai-tri/file/';
// Duoi file nhan khi luu tren may - khong nhan svg/html de khoi bi chen ma doc
const DUOI_HOP_LE = { image: ['.jpg', '.jpeg', '.png', '.webp', '.gif'], video: ['.mp4', '.mov', '.webm', '.m4v'] };
const KIEU_ANH = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

// Lam sach thong tin bai admin gui len
const chuanHoaBai = (b = {}) => ({
  chuThich: String(b.chuThich || '').trim().slice(0, 300),
  ngay: /^\d{4}-\d{2}-\d{2}$/.test(b.ngay) ? b.ngay : new Date().toISOString().slice(0, 10),
  ghim: Boolean(b.ghim)
});

// Context Cloudinary dang "key=gia tri|key=gia tri": dau | va = trong gia tri phai them \ phia truoc
const thoat = (s) => String(s).replace(/([|=])/g, '\\$1');
const taoContext = (bai) => `caption=${thoat(bai.chuThich)}|ngay=${bai.ngay}|ghim=${bai.ghim ? 1 : 0}`;

// Bai ghim len dau, con lai moi nhat truoc
const sapXep = (ds) => ds.sort((a, b) => Number(Boolean(b.ghim)) - Number(Boolean(a.ghim)) || b.ngay.localeCompare(a.ngay));

// Chi dong vao bai trong thu muc giai-tri; cam ".." de khong lan sang file khac tren Cloudinary
const laBaiHopLe = (id, loai) => /^giai-tri\/[\w-][\w.-]*$/.test(String(id)) && ['image', 'video'].includes(loai);

const giaiMa = (s) => { try { return decodeURIComponent(s || ''); } catch { return ''; } };

const goiCloudinary = async (duongDan, tuyChon = {}) => {
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cld.cloud}${duongDan}`, {
    ...tuyChon,
    headers: { Authorization: 'Basic ' + Buffer.from(`${cld.key}:${cld.secret}`).toString('base64') }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || `Cloudinary lỗi ${res.status}`);
  return data;
};

// ponytail: cache 60s trong bo nho cho khach xem, de khoi vuot gioi han 500 lan/gio
// cua Admin API. Quan tri luon lay moi. Moi loai lay toi da 100 file, qua thi can phan trang.
let cacheGiaiTri = null;

app.get('/api/giai-tri', async (req, res) => {
  if (!cld) return res.json(sapXep(kho.doc(KHO_GIAI_TRI)));
  const laQuanTri = phienHopLe(laToken(req));
  if (!laQuanTri && cacheGiaiTri && Date.now() - cacheGiaiTri.luc < 60000) {
    return res.json(cacheGiaiTri.ds);
  }
  try {
    const [anh, video] = await Promise.all(['image', 'video'].map((loai) =>
      goiCloudinary(`/resources/${loai}/tags/${THU_MUC_GIAI_TRI}?context=true&max_results=100`)
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
    sapXep(ds);
    cacheGiaiTri = { luc: Date.now(), ds };
    res.json(ds);
  } catch (err) {
    console.error('Lỗi tải giải trí:', err.message);
    res.status(502).json({ error: 'Không tải được ảnh/video' });
  }
});

// Ky ten cho trinh duyet tai thang file len Cloudinary - video nang khong di qua server minh.
app.post('/api/giai-tri/chu-ky', canQuyen, (req, res) => {
  // Chua co Cloudinary: trinh duyet gui file thang len server minh (route tai-len ben duoi)
  if (!cld) return res.json({ uploadUrl: '/api/giai-tri/tai-len' });
  const thamSo = {
    context: taoContext(chuanHoaBai(req.body)),
    folder: THU_MUC_GIAI_TRI,
    tags: THU_MUC_GIAI_TRI,
    timestamp: Math.floor(Date.now() / 1000)
  };

  res.json({
    ...thamSo,
    signature: kyCloudinary(thamSo),
    api_key: cld.key,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cld.cloud}/auto/upload`
  });
});

// Cho trang quan tri biet dang luu o dau
app.get('/api/giai-tri/che-do', canQuyen, (req, res) =>
  res.json({ cheDo: khoFile.dangBat() ? 'kho-neon' : cld ? 'cloudinary' : kho.dangDungDB() ? 'kho-du-lieu' : 'may' }));

// Luu tren may: nhan nguyen file (khong doi base64) nen video 100MB van qua duoc.
// Thong tin bai gui kem trong header X-Bai de khoi phai them multer doc multipart.
app.post('/api/giai-tri/tai-len', canQuyen, express.raw({ type: () => true, limit: '100mb' }), async (req, res) => {
  if (cld) return res.status(400).json({ error: 'Server đang dùng Cloudinary' });
  const duoi = path.extname(giaiMa(req.headers['x-ten-file'])).toLowerCase();
  const loai = Object.keys(DUOI_HOP_LE).find((k) => DUOI_HOP_LE[k].includes(duoi));
  if (!loai || !req.body?.length) {
    return res.status(400).json({ error: 'Chỉ nhận ảnh JPG, PNG, WEBP, GIF hoặc video MP4, MOV, WEBM' });
  }
  let bai = {};
  try { bai = JSON.parse(giaiMa(req.headers['x-bai']) || '{}'); } catch { /* dung gia tri mac dinh */ }

  const tenFile = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${duoi}`;
  let url = URL_FILE_MAY + tenFile;

  // Anh thi cat vao kho du lieu cho khoi mat khi deploy lai.
  // Video van phai nam tren dia (nang ca tram MB) -> muon giu lau thi can Cloudinary.
  if (loai === 'image' && kho.dangDungDB()) {
    if (!(await kho.ghiAnh(tenFile, KIEU_ANH[duoi] || 'image/jpeg', req.body))) {
      return res.status(500).json(LOI_LUU);
    }
    url = `/api/anh/${tenFile}`;
  } else {
    try {
      fs.mkdirSync(GIAI_TRI_THU_MUC, { recursive: true });
      fs.writeFileSync(path.join(GIAI_TRI_THU_MUC, tenFile), req.body);
    } catch (err) {
      console.error('Lỗi lưu file giải trí:', err);
      return res.status(500).json({ error: 'Không lưu được file' });
    }
  }

  const moi = { id: `${THU_MUC_GIAI_TRI}/${tenFile}`, loai, url, ...chuanHoaBai(bai) };
  if (!(await kho.ghi(KHO_GIAI_TRI, [...kho.doc(KHO_GIAI_TRI), moi]))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
});

// Trinh duyet tai file len kho Neon xong thi bao lai day de ghi thanh bai
app.post('/api/giai-tri/xong', canQuyen, async (req, res) => {
  const ten = khoFile.tenTuDiaChi(req.body?.url);   // chi nhan file nam trong kho cua minh
  if (!ten || !ten.startsWith(`${THU_MUC_GIAI_TRI}/`)) {
    return res.status(400).json({ error: 'Đường dẫn file không hợp lệ' });
  }
  const duoi = path.extname(ten).toLowerCase();
  const loai = Object.keys(DUOI_HOP_LE).find((k) => DUOI_HOP_LE[k].includes(duoi));
  if (!loai) return res.status(400).json({ error: 'Chỉ nhận ảnh hoặc video' });

  const moi = { id: ten, loai, url: req.body.url, ...chuanHoaBai(req.body) };
  if (!(await kho.ghi(KHO_GIAI_TRI, [...kho.doc(KHO_GIAI_TRI), moi]))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
});

// Phat file luu tren may (express.static tu ho tro tua video)
app.use('/api/giai-tri/file', express.static(GIAI_TRI_THU_MUC, { maxAge: '7d' }));

// Sua chu thich, ngay, ghim
app.put('/api/giai-tri', canQuyen, async (req, res) => {
  const { id, loai } = req.body || {};
  if (!laBaiHopLe(id, loai)) return res.status(400).json({ error: 'Bài không hợp lệ' });
  const bai = chuanHoaBai(req.body);

  if (!cld) {
    const ds = kho.doc(KHO_GIAI_TRI);
    const i = ds.findIndex((b) => b.id === id);
    if (i === -1) return res.status(404).json({ error: 'Không tìm thấy bài' });
    ds[i] = { ...ds[i], ...bai };
    if (!(await kho.ghi(KHO_GIAI_TRI, ds))) return res.status(500).json(LOI_LUU);
    return res.json(ds[i]);
  }
  try {
    await goiCloudinary(`/resources/${loai}/upload/${id}`, {
      method: 'POST',
      body: new URLSearchParams({ context: taoContext(bai) })
    });
    cacheGiaiTri = null;
    res.json({ id, loai, ...bai });
  } catch (err) {
    console.error('Lỗi sửa giải trí:', err.message);
    res.status(502).json({ error: 'Không lưu được, thử lại sau' });
  }
});

app.delete('/api/giai-tri', canQuyen, async (req, res) => {
  const { id, loai } = req.body || {};
  if (!laBaiHopLe(id, loai)) return res.status(400).json({ error: 'Bài không hợp lệ' });

  if (!cld) {
    const ds = kho.doc(KHO_GIAI_TRI);
    const bai = ds.find((b) => b.id === id);
    if (!bai) return res.status(404).json({ error: 'Không tìm thấy bài' });
    if (!(await kho.ghi(KHO_GIAI_TRI, ds.filter((b) => b.id !== id)))) return res.status(500).json(LOI_LUU);
    const tenKho = khoFile.tenTuDiaChi(bai.url);
    if (tenKho) await khoFile.xoa(tenKho);
    else if (bai.url.startsWith('/api/anh/')) await kho.xoaAnh(path.basename(bai.url));
    else if (bai.url.startsWith(URL_FILE_MAY)) {
      fs.rmSync(path.join(GIAI_TRI_THU_MUC, path.basename(bai.url)), { force: true });
    }
    return res.json({ success: true });
  }
  try {
    await goiCloudinary(`/resources/${loai}/upload?public_ids[]=${encodeURIComponent(id)}`, { method: 'DELETE' });
    cacheGiaiTri = null;
    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi xóa giải trí:', err.message);
    res.status(502).json({ error: 'Không xóa được, thử lại sau' });
  }
});

// ================= SERVE REACT BUILD =================
// ponytail: don gian nhat - 1 service, Express serve luon frontend/dist.
// Tach frontend/backend rieng chi khi can CDN hoac scale doc lap.
// API khong khop route nao -> tra 404 JSON, khong roi vao SPA fallback ben duoi
// (neu khong, goi API sai se nhan ve index.html kem status 200)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Không tìm thấy API: ' + req.originalUrl });
});

// Anh tai len tu quan tri nam o frontend/public (ngoai dist) -> phuc vu rieng,
// khong thi ban chay that tren Render tra 404 cho anh vua tai.
app.use('/images/tai-len', express.static(path.join(__dirname, '..', 'frontend', 'public', 'images', 'tai-len'), { maxAge: '7d' }));

const CLIENT_DIST = path.join(__dirname, '..', 'frontend', 'dist');
// Asset co hash trong ten -> cache 1 nam; index.html luon lay moi
app.use(express.static(CLIENT_DIST, { maxAge: '1y', index: false }));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// Start Server - mo kho du lieu xong moi nhan khach, de khong ai vao nham luc trong tron
kho.moKho({
  [KHO_SAN_PHAM]: [],
  [KHO_CONG_TRINH]: [],
  [KHO_CAI_DAT]: CAI_DAT_MAC_DINH,
  [KHO_DANH_MUC]: DANH_MUC_MAC_DINH,
  [KHO_GIAI_TRI]: [],
  [KHO_QUAN_TRI]: {}
}).then(() => {
  if (khoFile.dangBat()) khoFile.datPhepTrinhDuyet();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CameraTD Backend Server is running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Không mở được kho dữ liệu:', err.message);
  process.exit(1);
});
