import React, { useState } from 'react';
import { LayoutGrid, ArrowRight, Zap, Droplets, Camera } from 'lucide-react';

export default function CategoryFilter({
  selectedCategory,
  setSelectedCategory
}) {
  const [hoveredCat, setHoveredCat] = useState(null);

  // 4 mục người dùng yêu cầu: Tất cả, Thiết bị điện, Thiết bị mạng, Thiết bị nước
  const categories = [
    {
      name: 'Tất cả',
      label: 'Tất cả',
      icon: LayoutGrid,
      image: '/images/cat_style_new/prod_all.jpg',
      alt: 'Tất cả sản phẩm điện nước camera mạng'
    },
    {
      name: 'Thiết bị điện',
      label: 'Thiết bị điện',
      icon: Zap,
      image: '/images/cat_style_new/prod_1.png',
      alt: 'Thiết bị điện, bóng đèn, công tắc, ổ cắm, dây điện'
    },
    {
      name: 'Thiết bị mạng',
      label: 'Thiết bị mạng',
      icon: Camera,
      image: '/images/cat_style_new/prod_3.png',
      alt: 'Thiết bị mạng, camera an ninh, wifi giám sát'
    },
    {
      name: 'Thiết bị nước',
      label: 'Thiết bị nước',
      icon: Droplets,
      image: '/images/cat_style_new/prod_2.png',
      alt: 'Thiết bị nước, máy bơm, vòi rửa, thiết bị vệ sinh'
    }
  ];

  return (
    <div style={{ marginBottom: '18px' }}>
      {/* 1. Header Bar: DANH MỤC SẢN PHẨM & Xem tất cả */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        {/* Left: 4-square grid icon + Section Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0066cc'
          }}>
            <LayoutGrid size={20} strokeWidth={2.4} />
          </div>
          <h2 style={{
            fontSize: '1.08rem',
            fontWeight: 800,
            color: '#004085',
            margin: 0,
            letterSpacing: '0.2px',
            textTransform: 'uppercase',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            DANH MỤC SẢN PHẨM
          </h2>
        </div>

        {/* Right: "Xem tất cả →" button */}
        <button
          onClick={() => setSelectedCategory('Tất cả')}
          style={{
            background: 'none',
            border: 'none',
            color: '#0066cc',
            fontSize: '0.86rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            padding: '3px 6px',
            borderRadius: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#eef6ff';
            e.currentTarget.style.transform = 'translateX(2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'none';
          }}
          title="Xem tất cả sản phẩm"
        >
          <span>Xem tất cả</span>
          <ArrowRight size={15} strokeWidth={2.4} />
        </button>
      </div>

      {/* 2. 4 Khung Ô Danh Mục (Tất cả, Thiết bị điện, Thiết bị mạng, Thiết bị nước) */}
      <div
        className="category-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px'
        }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
            (cat.name === 'Tất cả' && selectedCategory === 'Tất cả');
          const isHovered = hoveredCat === cat.name;
          const IconComponent = cat.icon;

          return (
            <div
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              onMouseEnter={() => setHoveredCat(cat.name)}
              onMouseLeave={() => setHoveredCat(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedCategory(cat.name);
                }
              }}
              className="cat-card-item"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '0px', // Không bo góc
                border: (isActive || isHovered) ? '1.5px solid #60a5fa' : '1.5px solid transparent', // Viền xanh nhạt nhẹ nhàng, thanh thoát
                padding: '10px 14px 12px 14px',
                height: '122px', // Chiều cao chuẩn thanh thoát
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isActive
                  ? '0 4px 16px rgba(96, 165, 250, 0.22)'
                  : isHovered
                    ? '0 4px 12px rgba(96, 165, 250, 0.15)'
                    : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transform: isActive || isHovered ? 'translateY(-2px)' : 'none',
                transition: 'all 0.18s ease',
                userSelect: 'none'
              }}
            >
              {/* Product illustration image at top */}
              <div style={{
                height: '66px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                overflow: 'visible'
              }}>
                <img
                  src={cat.image}
                  alt={cat.alt}
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.2s ease',
                    transform: isHovered || isActive ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Bottom bar: Circular Blue Icon + Title */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: 'auto',
                paddingTop: '4px'
              }}>
                {/* Icon Pill Circle */}
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#0066cc' : '#eff6ff',
                  border: isActive ? '1px solid #0066cc' : '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: isActive ? '#ffffff' : '#0066cc',
                  transition: 'all 0.2s ease'
                }}>
                  <IconComponent size={14} strokeWidth={2.4} />
                </div>

                {/* Title */}
                <span
                  className="cat-card-title"
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: isActive ? '#0066cc' : '#0f2942',
                    lineHeight: 1.25,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {cat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .category-cards-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 8px !important;
          }
          .cat-card-item {
            height: 108px !important;
            padding: 8px 6px 10px 6px !important;
          }
          .cat-card-item img {
            max-height: 54px !important;
          }
          .cat-card-title {
            font-size: 0.72rem !important;
          }
        }
        @media (max-width: 480px) {
          .category-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .cat-card-item {
            height: 112px !important;
            padding: 8px 10px !important;
          }
          .cat-card-title {
            font-size: 0.82rem !important;
          }
        }
      `}</style>
    </div>
  );
}
