import React from 'react';

export default function ProductCard({
  product,
  index = 0,
  onViewDetails
}) {
  // 4 anh dau nam ngay trong man hinh dau tien -> tai ngay, dung lazy.
  // loading="lazy" tren anh trong viewport lam trinh duyet hoan tai => LCP cham.
  const isAboveFold = index < 4;

  return (
    <div className="store-product-card">
      {/* Product Image */}
      <div 
        onClick={() => onViewDetails(product)}
        style={{
          cursor: 'pointer',
          width: '100%',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          overflow: 'hidden',
          marginBottom: '8px'
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading={isAboveFold ? 'eager' : 'lazy'}
          fetchPriority={isAboveFold ? 'high' : 'auto'}
          decoding="async"
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            transition: 'transform 0.25s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        />
      </div>

      {/* Product Title */}
      <h3
        onClick={() => onViewDetails(product)}
        style={{
          fontSize: '0.88rem',
          fontWeight: 600,
          color: '#1e293b',
          lineHeight: 1.35,
          cursor: 'pointer',
          marginBottom: '4px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '38px',
          transition: 'color 0.15s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#1e293b'}
      >
        {product.name}
      </h3>

      {/* Subtitle / Spec snippet */}
      <p style={{
        fontSize: '0.76rem',
        color: '#94a3b8',
        marginBottom: '6px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {product.subTitle || product.description || 'Chính hãng 100%'}
      </p>

      {/* Xem chi tiet */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={() => onViewDetails(product)}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '7px 8px',
            fontSize: '0.8rem',
            backgroundColor: '#0066cc',
            borderRadius: '6px'
          }}
        >
          <span>Xem chi tiết</span>
        </button>
      </div>
    </div>
  );
}
