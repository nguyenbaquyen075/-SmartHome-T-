import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, Database, HardDrive, Cloud, Eye, EyeOff, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api, adminToken } from '../utils/api';
import { Truong, Khoi } from './AdminForm';
import AdminSaoLuu from './AdminSaoLuu';

// Mô tả từng kho để anh nhìn là biết dữ liệu có an toàn không
const KHO_FILE = {
  'kho-neon': { chu: 'Kho file Neon', an: true, y: 'Ảnh và video đều còn sau khi deploy lại' },
  cloudinary: { chu: 'Cloudinary', an: true, y: 'Ảnh và video đều còn sau khi deploy lại' },
  'kho-du-lieu': { chu: 'Kho dữ liệu Neon', an: null, y: 'Ảnh thì còn, nhưng video sẽ mất khi deploy lại' },
  may: { chu: 'Ổ đĩa máy chủ', an: false, y: 'File sẽ mất mỗi lần deploy — chỉ hợp khi chạy thử ở máy' }
};

const KHO_DU_LIEU = {
  neon: { chu: 'Kho Neon (Postgres)', an: true, y: 'Dữ liệu được giữ lại khi cập nhật web' },
  file: { chu: 'File trong máy chủ', an: false, y: 'Chưa nối kho dữ liệu, dữ liệu sẽ mất khi cập nhật web' }
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
          <h1>Cài đặt</h1>
          <p>Tài khoản và lưu trữ dữ liệu</p>
        </div>
      </div>

      <form onSubmit={luu}>
        <Khoi so={1} tieuDe="Tài khoản" moTa="Dùng để đăng nhập">
          <div className="qt-hang">
            <Truong nhan="Email hoặc số điện thoại" rong goiY={tt.nguon === 'kho'
              ? `Đã đổi${tt.doiLuc ? ` lúc ${new Date(tt.doiLuc).toLocaleString('vi-VN')}` : ''}`
              : 'Đổi ở đây sẽ được lưu lại'}>
              <input
                className="qt-input"
                value={taiKhoan}
                onChange={(e) => setTaiKhoan(e.target.value)}
                placeholder="Email hoặc số điện thoại"
                autoComplete="username"
              />
            </Truong>
          </div>
        </Khoi>

        <Khoi so={2} tieuDe="Mật khẩu mới" moTa="Bỏ trống nếu không đổi">
          <div className="qt-hang">
            <Truong nhan="Mật khẩu mới" goiY="Tối thiểu 8 ký tự, gồm chữ hoa và số">
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

            <Truong nhan="Nhập lại mật khẩu mới" loi={nhapLai && matKhauMoi !== nhapLai && 'Mật khẩu không khớp'}>
              <input
                className="qt-input"
                type={hien ? 'text' : 'password'}
                value={nhapLai}
                onChange={(e) => setNhapLai(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
              />
            </Truong>
          </div>
        </Khoi>

        <Khoi so={3} tieuDe="Xác nhận" moTa="Nhập mật khẩu hiện tại để lưu thay đổi">
          <div className="qt-hang">
            <Truong nhan="Mật khẩu hiện tại" batBuoc={coThayDoi} rong>
              <input
                className="qt-input"
                type="password"
                value={matKhauHienTai}
                onChange={(e) => setMatKhauHienTai(e.target.value)}
                placeholder="Mật khẩu hiện tại"
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
            <p>Đăng xuất khỏi các thiết bị khác</p>
          </div>
        </div>

        <div className="qt-bao-mat">
          <div>
            <strong>Đăng xuất khỏi mọi máy khác</strong>
            <small>Các thiết bị khác sẽ bị đăng xuất, thiết bị này giữ nguyên.</small>
          </div>
          <button type="button" className="qt-nut" onClick={dangXuatMoiNoi}>
            <LogOut size={15} /> Đăng xuất mọi nơi
          </button>
        </div>

        <div className="qt-bao-mat">
          <div>
            <strong>Phiên đăng nhập</strong>
            <small>Phiên đăng nhập tự hết hạn sau 7 ngày.</small>
          </div>
          <span className="qt-nhan-nhe">{adminToken.get() ? 'Đang đăng nhập' : '—'}</span>
        </div>
      </section>

      <section className="qt-khung">
        <div className="qt-khoi-dau">
          <span className="qt-khoi-so"><Database size={16} /></span>
          <div className="qt-khoi-chu">
            <h2>Lưu trữ dữ liệu</h2>
            <p>Nơi lưu sản phẩm, ảnh và ghi chú</p>
          </div>
        </div>

        <DongKho Icon={Database} ten="Dữ liệu" kho={KHO_DU_LIEU[tt.kho.duLieu] || KHO_DU_LIEU.file} />
        <DongKho
          Icon={tt.kho.file === 'cloudinary' ? Cloud : tt.kho.file === 'may' ? HardDrive : Cloud}
          ten="Ảnh, video"
          kho={KHO_FILE[tt.kho.file] || KHO_FILE.may}
        />
      </section>
      <AdminSaoLuu onBao={onBao} />
    </>
  );
}
