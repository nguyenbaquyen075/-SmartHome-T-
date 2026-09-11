import React, { useState } from 'react';
import { 
  Truck, 
  ShieldCheck, 
  Headphones, 
  User, 
  ShoppingCart, 
  Search, 
  Home, 
  Zap, 
  Droplet, 
  Menu, 
  X, 
  ChevronDown,
  Camera,
  Wrench,
  Cog,
  Package,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  cart,
  setIsCartOpen,
  setIsTrackerOpen,
  isAdmin,
  setIsAdmin,
  setSelectedCategory
}) {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navCategories = [
    { name: 'Điện nước', icon: Droplet },
    { name: 'Camera', icon: Camera, isHot: true },
    { name: 'Thiết bị điện', icon: Zap },
    { name: 'Thiết bị vệ sinh', icon: Droplet },
    { name: 'Dụng cụ cầm tay', icon: Wrench },
    { name: 'Vật tư khác', icon: Cog }
  ];

  const allCategories = [
    'Camera an ninh',
    'Thiết bị điện',
    'Thiết bị nước',
    'Đèn chiếu sáng',
    'Dây & Cáp điện',
    'Ống nhựa & Phụ kiện',
    'Dụng cụ cầm tay',
    'Vật tư khác'
  ];

  return (
    <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
      {/* 1. Main Blue Bar */}
      <div style={{
        backgroundColor: '#0066cc',
        color: '#fff',
        padding: '12px 0'
      }}>
        <div className="container navbar-main-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          {/* Logo */}
          <div 
            onClick={() => {
              setSelectedCategory('Tất cả');
              setSearchTerm('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="navbar-brand"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              position: 'relative'
            }}>
              <Home size={22} />
              <div style={{ position: 'absolute', bottom: '4px', display: 'flex', gap: '1px' }}>
                <Zap size={10} fill="#fff" />
                <Droplet size={10} fill="#fff" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.2px', lineHeight: 1.1 }}>
                ĐIỆN NƯỚC CAMERA
              </div>
              <div style={{ fontSize: '0.72rem', color: '#bae6fd' }}>
                Chất lượng tạo nên niềm tin
              </div>
            </div>
          </div>

          {/* Search Bar in Header */}
          <div className="navbar-search" style={{ flex: 1, maxWidth: '520px', position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: '9999px',
              padding: '2px 14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.88rem',
                  color: '#1e293b',
                  padding: '8px 0'
                }}
              />
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0066cc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Right Header Items (Matching Screenshot) */}
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            {/* Hotline 24/7 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Headphones size={16} />
              </div>
              <div style={{ fontSize: '0.78rem', lineHeight: 1.2 }}>
                <div style={{ color: '#e0f2fe' }}>Tư vấn miễn phí</div>
                <strong style={{ color: '#fff' }}>24/7</strong>
              </div>
            </div>

            {/* Cam ket */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} />
              </div>
              <div style={{ fontSize: '0.78rem', lineHeight: 1.2 }}>
                <div style={{ color: '#e0f2fe' }}>Cam kết</div>
                <strong style={{ color: '#fff' }}>chính hãng</strong>
              </div>
            </div>

            {/* Tai khoan / Admin */}
            <div 
              onClick={() => setIsAdmin(!isAdmin)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', padding: '4px 8px', borderRadius: '6px', backgroundColor: isAdmin ? 'rgba(255,255,255,0.2)' : 'transparent' }}
            >
              <User size={16} />
              <span>{isAdmin ? 'Quản trị (Bật)' : 'Tài khoản'}</span>
            </div>

            {/* Gio hang */}
            <div 
              onClick={() => setIsCartOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', position: 'relative' }}
            >
              <ShoppingCart size={18} />
              {totalCartCount > 0 && (
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
                  {totalCartCount}
                </span>
              )}
            </div>
          </div>

          {/* Mobile hamburger icon */}
          {/* Dien thoai: gio hang phai o day, vi thanh duoi da doi thanh muc San pham */}
          <div className="mobile-flex" style={{ alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Mở giỏ hàng"
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', position: 'relative', padding: 0 }}
            >
              <ShoppingCart size={23} />
              {totalCartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-7px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 3px',
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {totalCartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Mở menu"
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 0 }}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Lower Dark Navy Navigation Bar (Matching Screenshot) */}
      <div className="desktop-only" style={{
        backgroundColor: '#004b99',
        color: '#fff',
        fontSize: '0.86rem'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Danh mục sản phẩm Button with Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              style={{
                backgroundColor: '#003d7a',
                color: '#fff',
                border: 'none',
                padding: '11px 18px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Menu size={16} />
              <span>Danh mục sản phẩm</span>
              <ChevronDown size={14} />
            </button>

            {/* Dropdown Menu */}
            {categoryDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '240px',
                backgroundColor: '#fff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                borderRadius: '0 0 8px 8px',
                zIndex: 100,
                padding: '6px 0'
              }}>
                {allCategories.map((cat) => (
                  <div
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCategoryDropdownOpen(false);
                    }}
                    style={{
                      padding: '9px 16px',
                      color: '#1e293b',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                      e.currentTarget.style.color = '#0066cc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#1e293b';
                    }}
                  >
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Nav Categories */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
            {navCategories.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setSelectedCategory(item.name === 'Camera' ? 'Camera an ninh' : item.name)}
                  style={{
                    background: item.isHot ? '#0066cc' : 'none',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: item.isHot ? '9999px' : '4px',
                    fontSize: '0.84rem',
                    fontWeight: item.isHot ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (!item.isHot) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (!item.isHot) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon size={15} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1100,
            display: 'flex'
          }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div 
            style={{
              width: 'min(280px, 86vw)',
              backgroundColor: '#fff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 20px rgba(0,0,0,0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px', backgroundColor: '#0066cc', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800 }}>ĐIỆN NƯỚC CAMERA</div>
              <button onClick={() => setMobileDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
              {allCategories.map((cat) => (
                <div
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setMobileDrawerOpen(false);
                  }}
                  style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#1e293b', cursor: 'pointer' }}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
