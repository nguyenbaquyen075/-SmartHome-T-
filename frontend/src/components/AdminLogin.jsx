import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import { api } from '../utils/api';

// Nhớ tài khoản đã gõ (không nhớ mật khẩu) cho lần đăng nhập sau
const KEY_TAI_KHOAN = 'cameratd_admin_taikhoan';
const docTaiKhoan = () => { try { return localStorage.getItem(KEY_TAI_KHOAN) || ''; } catch { return ''; } };

// Trang đăng nhập toàn màn hình ở /admin
export default function AdminLogin({ onSuccess }) {
  const [taiKhoan, setTaiKhoan] = useState(docTaiKhoan);
  const [password, setPassword] = useState('');
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [loi, setLoi] = useState('');
  const [dangGui, setDangGui] = useState(false);

  const guiDi = async (e) => {
    e.preventDefault();
    if (!taiKhoan.trim() || !password.trim() || dangGui) return;
    setDangGui(true);
    setLoi('');
    try {
      await api.login(taiKhoan.trim(), password);
      try { localStorage.setItem(KEY_TAI_KHOAN, taiKhoan.trim()); } catch { /* trình duyệt chặn */ }
      onSuccess();
    } catch (err) {
      setLoi(err.message);
      setPassword('');
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="qt-dn">
      <form className="qt-dn-khung" onSubmit={guiDi}>
        <img className="qt-dn-logo" src="/images/logoTD.png" alt="SmartHome TD" onError={(e) => { e.currentTarget.hidden = true; }} />
        <div className="qt-dn-icon"><Lock size={24} /></div>
        <h1>Đăng nhập quản trị</h1>
        <p>Khu vực dành cho chủ cửa hàng</p>

        <label className="qt-dn-o">
          <span>Email hoặc số điện thoại</span>
          <div>
            <input
              className="qt-input"
              type="text"
              value={taiKhoan}
              onChange={(e) => setTaiKhoan(e.target.value)}
              placeholder="0987 654 321"
              autoFocus={!taiKhoan}
              autoComplete="username"
            />
            <button type="button" className="qt-dn-nhan" aria-hidden="true" tabIndex={-1}><User size={18} /></button>
          </div>
        </label>

        <label className="qt-dn-o">
          <span>Mật khẩu</span>
          <div>
            <input
              className="qt-input"
              type={hienMatKhau ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              autoFocus={Boolean(taiKhoan)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setHienMatKhau(!hienMatKhau)}
              aria-label={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {hienMatKhau ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {loi && <div className="qt-dn-loi" role="alert">{loi}</div>}

        <button type="submit" className="btn-primary qt-dn-vao" disabled={dangGui || !taiKhoan.trim() || !password.trim()}>
          {dangGui ? 'Đang kiểm tra…' : 'Đăng nhập'}
        </button>

        <a href="/" className="qt-dn-ve"><ArrowLeft size={14} /> Về trang web</a>
      </form>
    </div>
  );
}
