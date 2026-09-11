import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { api } from '../utils/api';

export default function AdminLogin({ onSuccess, onClose }) {
  const [password, setPassword] = useState('');
  const [loi, setLoi] = useState('');
  const [dangGui, setDangGui] = useState(false);

  const guiDi = async (e) => {
    e.preventDefault();
    if (!password.trim() || dangGui) return;
    setDangGui(true);
    setLoi('');
    try {
      await api.login(password);
      onSuccess();
    } catch (err) {
      setLoi(err.message);
      setPassword('');
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-login" onClick={(e) => e.stopPropagation()}>
        <button className="admin-login-close" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        <div className="admin-login-icon">
          <Lock size={26} />
        </div>
        <h2>Đăng nhập quản trị</h2>
        <p>Khu vực dành cho chủ cửa hàng</p>

        <form onSubmit={guiDi}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            autoFocus
            autoComplete="current-password"
          />
          {loi && <div className="admin-login-loi">{loi}</div>}
          <button type="submit" className="btn-primary" disabled={dangGui || !password.trim()}>
            {dangGui ? 'Đang kiểm tra…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
