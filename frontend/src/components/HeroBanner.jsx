import React from 'react';

export default function HeroBanner({ onSelectCategory, onViewCatalog }) {
  return (
    <div style={{ paddingTop: '10px', paddingBottom: '16px' }}>
      <div className="container">
        {/* Banner chính theo đúng kích thước 1024 x 317 */}
        <div
          onClick={onViewCatalog}
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            backgroundColor: '#005bb5',
            position: 'relative',
            width: '100%',
            aspectRatio: '1024 / 317',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 102, 204, 0.16)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
          }}
          title="Xem danh mục sản phẩm"
        >
          <img
            src="/images/banner_hero_1024.jpg"
            srcSet="/images/banner_hero_640.jpg 640w, /images/banner_hero_1024.jpg 1024w, /images/banner_hero_2x.jpg 2048w"
            sizes="(max-width: 768px) 100vw, 1024px"
            alt="SmartHome T&D Banner"
            fetchPriority="high"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
      </div>
    </div>
  );
}
