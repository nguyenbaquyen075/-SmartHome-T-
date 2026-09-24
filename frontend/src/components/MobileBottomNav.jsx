import React from 'react';
import { Home, LayoutGrid, User } from 'lucide-react';

export default function MobileBottomNav({
  activeTab = 'home',
  onGoHome,
  onOpenProducts,
  onToggleAdmin
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
      padding: '2px 0',
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
          flexDirection: 'row',
          alignItems: 'center',
          gap: '6px',
          color: activeTab === 'home' ? '#0066cc' : '#64748b',
          cursor: 'pointer',
          padding: '6px 12px'
        }}
      >
        <Home size={18} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        <span style={{ fontSize: '0.76rem', fontWeight: activeTab === 'home' ? 700 : 500 }}>
          Trang chủ
        </span>
      </button>

      {/* 2. Sản phẩm */}
      <button
        onClick={onOpenProducts}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '6px',
          color: activeTab === 'products' ? '#0066cc' : '#64748b',
          cursor: 'pointer',
          padding: '6px 12px'
        }}
      >
        <LayoutGrid size={18} strokeWidth={activeTab === 'products' ? 2.5 : 2} />
        <span style={{ fontSize: '0.76rem', fontWeight: activeTab === 'products' ? 700 : 500 }}>
          Sản phẩm
        </span>
      </button>

      {/* 3. Tài khoản / Quản trị */}
      <button
        onClick={onToggleAdmin}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
          cursor: 'pointer',
          padding: '6px 12px'
        }}
      >
        <User size={18} />
        <span style={{ fontSize: '0.76rem', fontWeight: 500 }}>
          Tài khoản
        </span>
      </button>
    </nav>
  );
}
