import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, Database, HardDrive, Cloud, Eye, EyeOff, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api, adminToken } from '../utils/api';
import { Truong, Khoi } from './AdminForm';

// Mô tả từng kho để anh nhìn là biết dữ liệu có an toàn không
const KHO_FILE = {
  'kho-neon': { chu: 'Kho file Neon', an: true, y: 'Ảnh và video đều còn sau khi deploy lại' },
  cloudinary: { chu: 'Cloudinary', an: true, y: 'Ảnh và video đều còn sau khi deploy lại' },
  'kho-du-lieu': { chu: 'Kho dữ liệu Neon', an: null, y: 'Ảnh thì còn, nhưng video sẽ mất khi deploy lại' },
  may: { chu: 'Ổ đĩa máy chủ', an: false, y: 'File sẽ mất mỗi lần deploy — chỉ hợp khi chạy thử ở máy' }
};

const KHO_DU_LIEU = {
  neon: { chu: 'Kho Neon (Postgres)', an: true, y: 'Sản phẩm, công trình, cài đặt đều còn sau khi deploy lại' },
  file: { chu: 'File trong máy chủ', an: false, y: 'Chưa đặt DATABASE_URL — dữ liệu sẽ mất khi deploy' }
};

function DongKho({ Icon, ten, kho }) {
  const Dau = kho.an === true ? CheckCircle2 : AlertTriangle;
  const mau = kho.an === true ? 'an' : kho.an === null ? 'luu-y' : 'nguy';
  return (
    <div className={`qt-kho-dong ${mau}`}>
      <span className="qt-kho-icon"><Icon size={18} /></span>
      <div>
        <strong>{ten}: {kho.chu}</strong>
        <small>{kho.y}</small>
      </div>
      <Dau size={18} className="qt-kho-dau" />
    </div>
  );
}

export default function AdminCaiDat({ onBao }) {
  const [tt, setTt] = useState(null);          // thông tin tài khoản + kho
  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhauHienTai, setMatKhauHienTai] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [nhapLai, setNhapLai] = useState('');
  const [hien, setHien] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState('');

  useEffect(() => {
    api.taiKhoan()
      .then((r) => { setTt(r); setTaiKhoan(r.taiKhoan); })
      .catch((e) => onBao(e.message, 'error'));
  }, [onBao]);

  const doiTaiKhoan = tt && taiKhoan.trim() && taiKhoan.trim() !== tt.taiKhoan;
  const doiMatKhau = Boolean(matKhauMoi);
  const coThayDoi = doiTaiKhoan || doiMatKhau;

  const luu = async (e) => {
    e.preventDefault();
    setLoi('');

    if (!coThayDoi) return setLoi('Chưa thay đổi gì cả');
    if (!matKhauHienTai) return setLoi('Cần nhập mật khẩu hiện tại để xác nhận');
    if (doiMatKhau && matKhauMoi.length < 8) return setLoi('Mật khẩu mới cần ít nhất 8 ký tự');
    if (doiMatKhau && matKhauMoi !== nhapLai) return setLoi('Hai ô mật khẩu mới chưa giống nhau');

    setDangLuu(true);
    try {
      const kq = await api.doiTaiKhoan({
        matKhauHienTai,
        ...(doiTaiKhoan ? { taiKhoanMoi: taiKhoan.trim() } : {}),
        ...(doiMatKhau ? { matKhauMoi } : {})
      });
      setTt((cu) => ({ ...cu, taiKhoan: kq.taiKhoan, nguon: 'kho' }));
      setMatKhauHienTai(''); setMatKhauMoi(''); setNhapLai('');
      onBao(doiMatKhau ? 'Đã đổi mật khẩu' : 'Đã đổi tài khoản đăng nhập');
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangLuu(false);
    }
  };

  const dangXuatMoiNoi = async () => {
    if (!window.confirm('Đăng xuất khỏi mọi máy đang đăng nhập? Máy này vẫn giữ nguyên.')) return;
    try {
      await api.dangXuatMoiNoi();
      onBao('Đã đăng xuất khỏi mọi máy khác');
    } catch (err) {
      onBao(err.message, 'error');
    }
  };

  if (!tt) return <p className="adm-trong">Đang tải…</p>;

  return (
    <>
      <div className="qt-tieude">
        <div>
          <h1>Cài đặt &amp; bảo mật</h1>
          <p>Tài khoản đăng nhập, mật khẩu và tình trạng lưu trữ của web.</p>
        </div>
      </div>

      <form onSubmit={luu}>
        <Khoi so={1} tieuDe="Tài khoản đăng nhập" moTa="Email hoặc số điện thoại dùng để vào trang quản trị">
          <div className="qt-hang">
            <Truong nhan="Email hoặc số điện thoại" rong goiY={tt.nguon === 'kho'
              ? `Đã đổi trong trang này${tt.doiLuc ? ` lúc ${new Date(tt.doiLuc).toLocaleString('vi-VN')}` : ''}`
              : 'Đang lấy từ cài đặt máy chủ (biến ADMIN_TAI_KHOAN). Đổi ở đây là lưu vào kho, khỏi phụ thuộc Render.'}>
              <input
                className="qt-input"
                value={taiKhoan}
                onChange={(e) => setTaiKhoan(e.target.value)}
                placeholder="vd: anh@gmail.com hoặc 0987 654 321"
                autoComplete="username"
              />
            </Truong>
          </div>
        </Khoi>

        <Khoi so={2} tieuDe="Đổi mật khẩu" moTa="Để trống nếu chỉ muốn đổi tài khoản">
          <div className="qt-hang">
            <Truong nhan="Mật khẩu mới" goiY="Ít nhất 8 ký tự, nên có cả chữ hoa và số">
              <div className="qt-o-mat-khau">
                <input
                  className="qt-input"
                  type={hien ? 'text' : 'password'}
                  value={matKhauMoi}
                  onChange={(e) => setMatKhauMoi(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setHien(!hien)} aria-label={hien ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                  {hien ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Truong>

            <Truong nhan="Nhập lại mật khẩu mới" loi={nhapLai && matKhauMoi !== nhapLai && 'Chưa giống ô trên'}>
              <input
                className="qt-input"
                type={hien ? 'text' : 'password'}
                value={nhapLai}
                onChange={(e) => setNhapLai(e.target.value)}
                placeholder="Gõ lại cho chắc"
                autoComplete="new-password"
              />
            </Truong>
          </div>
        </Khoi>

        <Khoi so={3} tieuDe="Xác nhận là anh" moTa="Đổi tài khoản hay mật khẩu đều phải nhập mật khẩu đang dùng">
          <div className="qt-hang">
            <Truong nhan="Mật khẩu hiện tại" batBuoc={coThayDoi} rong>
              <input
                className="qt-input"
                type="password"
                value={matKhauHienTai}
                onChange={(e) => setMatKhauHienTai(e.target.value)}
                placeholder="Mật khẩu đang dùng"
                autoComplete="current-password"
              />
            </Truong>
          </div>

          {loi && <div className="qt-dn-loi" role="alert">{loi}</div>}

          <button type="submit" className="btn-primary qt-nut-luu-cd" disabled={dangLuu || !coThayDoi}>
            <KeyRound size={16} /> {dangLuu ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </Khoi>
      </form>

      <section className="qt-khung">
        <div className="qt-khoi-dau">
          <span className="qt-khoi-so"><ShieldCheck size={16} /></span>
          <div className="qt-khoi-chu">
            <h2>Bảo mật</h2>
            <p>Nghi ngờ có người khác đang đăng nhập thì bấm nút dưới.</p>
          </div>
        </div>

        <div className="qt-bao-mat">
          <div>
            <strong>Đăng xuất khỏi mọi máy khác</strong>
            <small>Mọi lần đăng nhập cũ (máy khác, điện thoại khác) đều bị đẩy ra. Máy này vẫn giữ nguyên.</small>
          </div>
          <button type="button" className="qt-nut" onClick={dangXuatMoiNoi}>
            <LogOut size={15} /> Đăng xuất mọi nơi
          </button>
        </div>

        <div className="qt-bao-mat">
          <div>
            <strong>Phiên đăng nhập</strong>
            <small>Tự hết hạn sau 7 ngày. Đổi mật khẩu là mọi phiên cũ hết hiệu lực ngay.</small>
          </div>
          <span className="qt-nhan-nhe">{adminToken.get() ? 'Đang đăng nhập' : '—'}</span>
        </div>
      </section>

      <section className="qt-khung">
        <div className="qt-khoi-dau">
          <span className="qt-khoi-so"><Database size={16} /></span>
          <div className="qt-khoi-chu">
            <h2>Dữ liệu đang cất ở đâu</h2>
            <p>Nhìn đây là biết deploy lại có mất gì không.</p>
          </div>
        </div>

        <DongKho Icon={Database} ten="Chữ nghĩa" kho={KHO_DU_LIEU[tt.kho.duLieu] || KHO_DU_LIEU.file} />
        <DongKho
          Icon={tt.kho.file === 'cloudinary' ? Cloud : tt.kho.file === 'may' ? HardDrive : Cloud}
          ten="Ảnh, video"
          kho={KHO_FILE[tt.kho.file] || KHO_FILE.may}
        />
      </section>
    </>
  );
}
