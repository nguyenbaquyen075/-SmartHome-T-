import React from 'react';
import { Home, ShoppingCart, PackageCheck, User } from 'lucide-react';

export default function MobileBottomNav({
  activeTab = 'home',
  onGoHome,
  onOpenCart,
  onOpenTracker,
  onToggleAdmin,
  cartCount = 0
}) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '8px 0',
      zIndex: 990,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.06)'
    }}>
      {/* 1. Trang chủ */}
      <button
        onClick={onGoHome}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: activeTab === 'home' ? '#0066cc' : '#64748b',
          cursor: 'pointer',
          padding: '4px 12px'
        }}
      >
        <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        <span style={{ fontSize: '0.72rem', fontWeight: activeTab === 'home' ? 700 : 500 }}>
          Trang chủ
        </span>
      </button>

      {/* 2. Giỏ hàng */}
      <button
        onClick={onOpenCart}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: '#64748b',
          cursor: 'pointer',
          position: 'relative',
          padding: '4px 12px'
        }}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-8px',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {cartCount}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>
          Giỏ hàng
        </span>
      </button>

      {/* 3. Tra cứu */}
      <button
        onClick={onOpenTracker}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: '#64748b',
          cursor: 'pointer',
          padding: '4px 12px'
        }}
      >
        <PackageCheck size={22} />
        <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>
          Tra cứu
        </span>
      </button>

      {/* 4. Tài khoản / Quản trị */}
      <button
        onClick={onToggleAdmin}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: '#64748b',
          cursor: 'pointer',
          padding: '4px 12px'
        }}
      >
        <User size={22} />
        <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>
          Tài khoản
        </span>
      </button>
    </nav>
  );
}
