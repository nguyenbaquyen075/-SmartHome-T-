import React, { useRef } from 'react';
import { 
  LayoutGrid, 
  Camera, 
  Zap, 
  Droplets, 
  Lightbulb, 
  Cog, 
  Wrench, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export default function CategoryFilter({
  selectedCategory,
  setSelectedCategory
}) {
  const scrollRef = useRef(null);

  // 4 Categories requested by user: Tất cả, Thiết bị điện, Thiết bị mạng, Thiết bị nước
  const tabs = [
    { 
      name: 'Tất cả', 
      label: 'Tất cả sản phẩm', 
      image: '/images/cat_all.jpg',
      icon: LayoutGrid,
      alt: 'Tất cả sản phẩm điện nước camera'
    },
    { 
      name: 'Thiết bị điện', 
      label: 'Thiết bị điện', 
      image: '/images/cat_electrical.jpg',
      icon: Zap,
      alt: 'Aptomat, công tắc, ổ cắm, đèn, dây điện'
    },
    { 
      name: 'Thiết bị mạng', 
      label: 'Thiết bị mạng', 
      image: '/images/panasonic_camera.jpg',
      icon: Camera,
      alt: 'Camera an ninh, wifi, thiết bị mạng'
    },
    { 
      name: 'Thiết bị nước', 
      label: 'Thiết bị nước', 
      image: '/images/cat_water.jpg',
      icon: Droplets,
      alt: 'Máy bơm nước, vòi rửa Inox, ống PVC'
    }
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Category Section Label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '1.15rem' }}>📂</span>
        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
          DANH MỤC SẢN PHẨM:
        </span>
      </div>

      {/* 4 Balanced Rectangles without Gray Borders (Ô chữ nhật vừa vặn, không viền xám) */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        {tabs.map((tab) => {
          const isActive = selectedCategory.toLowerCase() === tab.name.toLowerCase() ||
            (tab.name === 'Tất cả' && selectedCategory === 'Tất cả');

          return (
            <button
              key={tab.name}
              onClick={() => setSelectedCategory(tab.name)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '5px 20px 5px 6px',
                borderRadius: '6px', // Ô chữ nhật phẳng, gọn gàng
                border: isActive ? '2px solid #0066cc' : '2px solid transparent', // Không viền xám
                backgroundColor: isActive ? '#0066cc' : '#ffffff',
                color: isActive ? '#ffffff' : '#1e293b',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 4px 12px rgba(0, 102, 204, 0.28)' : '0 2px 8px rgba(0, 0, 0, 0.06)',
                height: '62px',
                width: 'auto',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#0066cc';
                  e.currentTarget.style.backgroundColor = '#f0f7ff';
                  e.currentTarget.style.color = '#0066cc';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#1e293b';
                }
              }}
            >
              {/* 1. Ảnh minh họa trước - to vừa vặn, KHÔNG viền xám */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '4px',
                border: 'none', // Hoàn toàn không viền xám
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                <img
                  src={tab.image}
                  alt={tab.alt}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* 2. Cạnh là tên đề mục */}
              <span style={{
                fontSize: '1.08rem',
                fontWeight: 800,
                color: isActive ? '#ffffff' : '#1e293b',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.2px'
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
