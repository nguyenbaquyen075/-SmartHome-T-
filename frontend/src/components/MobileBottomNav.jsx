import React from 'react';
import { Home, LayoutGrid, User } from 'lucide-react';

// Thanh dưới kiểu app: nền trắng bo tròn góc trên, icon trên chữ, mục đang chọn màu xanh + gạch chân
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
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      borderRadius: '22px 22px 0 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '10px 8px calc(10px + env(safe-area-inset-bottom))',
      zIndex: 990,
      boxShadow: '0 -4px 18px rgba(15, 23, 42, 0.10)'
    }}>
      {muc.map(({ id, nhan, Icon, onClick }) => {
        const chon = activeTab === id;
        return (
          <button
            key={id}
            onClick={onClick}
            aria-current={chon ? 'page' : undefined}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: chon ? '#0066cc' : '#94a3b8',
              cursor: 'pointer',
              padding: '2px 16px',
              flex: 1
            }}
          >
            <Icon size={27} strokeWidth={chon ? 2.2 : 1.8} />
            <span style={{ fontSize: '0.82rem', fontWeight: chon ? 700 : 500 }}>{nhan}</span>
            <span style={{
              width: '46px',
              height: '3px',
              borderRadius: '2px',
              backgroundColor: chon ? '#0066cc' : 'transparent'
            }} />
          </button>
        );
      })}
    </nav>
  );
}
