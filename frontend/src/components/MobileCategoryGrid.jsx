import React from 'react';
import { LayoutGrid, ArrowRight, ChevronRight } from 'lucide-react';

export default function MobileCategoryGrid({ onSelectCategory, onShowAll }) {
  const categories = [
    {
      id: 'cat-1',
      name: 'Camera an ninh',
      bgColor: '#e0f2fe',
      borderColor: '#bae6fd',
      arrowBg: '#0284c7',
      image: '/images/panasonic_camera.jpg'
    },
    {
      id: 'cat-2',
      name: 'Thiết bị điện',
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
      arrowBg: '#16a34a',
      image: '/images/cat_electrical.jpg'
    },
    {
      id: 'cat-3',
      name: 'Thiết bị nước',
      bgColor: '#e0f2fe',
      borderColor: '#bae6fd',
      arrowBg: '#0284c7',
      image: '/images/cat_water.jpg'
    },
    {
      id: 'cat-4',
      name: 'Đèn chiếu sáng',
      bgColor: '#fef9c3',
      borderColor: '#fef08a',
      arrowBg: '#ca8a04',
      image: '/images/cat_lighting.jpg'
    },
    {
      id: 'cat-5',
      name: 'Dây & Cáp điện',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      arrowBg: '#dc2626',
      image: '/images/cat_wires.jpg'
    },
    {
      id: 'cat-6',
      name: 'Ống nhựa & Phụ kiện',
      bgColor: '#f5f3ff',
      borderColor: '#ddd6fe',
      arrowBg: '#7c3aed',
      image: '/images/cat_pipes.jpg'
    },
    {
      id: 'cat-7',
      name: 'Dụng cụ cầm tay',
      bgColor: '#ecfeff',
      borderColor: '#a5f3fc',
      arrowBg: '#0891b2',
      image: '/images/cat_tools.jpg'
    },
    {
      id: 'cat-8',
      name: 'Phụ kiện khác',
      bgColor: '#fdf2f8',
      borderColor: '#fbcfe8',
      arrowBg: '#db2777',
      image: '/images/cat_all.jpg'
    }
  ];

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ color: '#0066cc' }}>
            <LayoutGrid size={20} />
          </div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
            DANH MỤC SẢN PHẨM
          </h2>
        </div>

        <button
          onClick={onShowAll}
          style={{
            background: 'none',
            border: 'none',
            color: '#0066cc',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            cursor: 'pointer'
          }}
        >
          <span>Xem tất cả</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 4-column Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px'
      }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.name)}
            className="mobile-cat-card"
            style={{
              backgroundColor: cat.bgColor,
              borderColor: cat.borderColor
            }}
          >
            {/* Image */}
            <div style={{
              width: '100%',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img
                src={cat.image}
                alt={cat.name}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Bottom title & arrow */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '4px',
              marginTop: '6px'
            }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#1e293b',
                lineHeight: 1.2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {cat.name}
              </span>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: cat.arrowBg,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ChevronRight size={10} strokeWidth={3} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
