// Đăng nhập, đăng xuất, đổi tài khoản/mật khẩu quản trị
const kho = require('../lib/kho');
const khoFile = require('../lib/khoFile');
const cloudinary = require('../lib/cloudinary');
const taiKhoan = require('../models/taiKhoan');
const config = require('../config');
const { layToken } = require('../middleware/xacThuc');
const { LOI_LUU } = require('../utils/loi');

const dangNhap = (req, res) => {
  const noi = req.ip || 'khong-ro';
  const phutConLai = taiKhoan.conKhoa(noi);
  if (phutConLai) {
    return res.status(429).json({ error: `Sai quá nhiều lần, thử lại sau ${phutConLai} phút` });
  }
  // Báo chung 1 câu để người lạ không biết sai ở ô nào
  if (!taiKhoan.dungTaiKhoan(req.body?.taiKhoan) || !taiKhoan.dungMatKhau(req.body?.password)) {
    taiKhoan.demThemMotLanSai(noi);
    return res.status(401).json({ error: 'Email / số điện thoại hoặc mật khẩu không đúng' });
  }
  taiKhoan.xoaDemSai(noi);
  res.json({ token: taiKhoan.taoPhien() });
};

const dangXuat = (req, res) => {
  taiKhoan.dangXuat(layToken(req));
  res.json({ success: true });
};

// Kiểm tra token còn hiệu lực (dùng khi tải lại trang)
const kiemTra = (req, res) => res.json({ ok: true });

const xemTaiKhoan = (req, res) => {
  const luu = taiKhoan.docLuu();
  res.json({
    taiKhoan: luu.taiKhoan || config.ADMIN_TAI_KHOAN,
    nguon: luu.matKhauBam ? 'kho' : 'bien-moi-truong',
    doiLuc: luu.doiLuc || null,
    kho: {
      duLieu: kho.dangDungDB() ? 'neon' : 'file',
      file: khoFile.dangBat() ? 'kho-neon' : cloudinary.dangBat() ? 'cloudinary' : kho.dangDungDB() ? 'kho-du-lieu' : 'may'
    }
  });
};

// Đổi tài khoản và/hoặc mật khẩu. Bắt buộc nhập đúng mật khẩu hiện tại.
const doiTaiKhoan = async (req, res) => {
  const { matKhauHienTai, taiKhoanMoi, matKhauMoi } = req.body || {};
  if (!taiKhoan.dungMatKhau(matKhauHienTai)) {
    return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
  }
  const kq = taiKhoan.doiThongTin({ taiKhoanMoi, matKhauMoi });
  if (kq.loi) return res.status(400).json({ error: kq.loi });
  if (!(await taiKhoan.ghiLuu(kq.duLieu))) return res.status(500).json(LOI_LUU);
  // Đổi mật khẩu làm bí mật ký phiên đổi theo -> phiên cũ hết hạn, cấp phiên mới ngay
  res.json({ taiKhoan: kq.duLieu.taiKhoan, token: matKhauMoi !== undefined ? taiKhoan.taoPhien() : undefined });
};

const dangXuatMoiNoi = async (req, res) => {
  if (!(await taiKhoan.ghiLuu(taiKhoan.moiPhienMoi()))) return res.status(500).json(LOI_LUU);
  res.json({ success: true, token: taiKhoan.taoPhien() });   // máy đang dùng thì cấp phiên mới
};

module.exports = { dangNhap, dangXuat, kiemTra, xemTaiKhoan, doiTaiKhoan, dangXuatMoiNoi };
