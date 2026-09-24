import React from 'react';
import { Home, LayoutGrid, User } from 'lucide-react';

// Thanh dưới kiểu app (style ở .bnav trong index.css): nền trắng bo góc trên,
// mục đang chọn có viên thuốc xanh nhạt sau icon, chữ đậm màu thương hiệu.
export default function MobileBottomNav({
  activeTab = 'home',
  onGoHome,
  onOpenProducts,
  onToggleAdmin
}) {
  const muc = [
    { id: 'home', nhan: 'Trang chủ', Icon: Home, onClick: onGoHome },
    { id: 'products', nhan: 'Sản phẩm', Icon: LayoutGrid, onClick: onOpenProducts },
    { id: 'admin', nhan: 'Tài khoản', Icon: User, onClick: onToggleAdmin }
  ];

  return (
    <nav className="bnav" aria-label="Điều hướng chính">
      {muc.map(({ id, nhan, Icon, onClick }) => {
        const chon = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            className={`bnav-item${chon ? ' on' : ''}`}
            onClick={onClick}
            aria-current={chon ? 'page' : undefined}
          >
            <span className="bnav-pill"><Icon size={23} strokeWidth={chon ? 2.3 : 1.9} /></span>
            <span className="bnav-nhan">{nhan}</span>
          </button>
        );
      })}
    </nav>
  );
}
