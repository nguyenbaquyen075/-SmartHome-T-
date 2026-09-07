import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { formatPrice } from '../utils/api';

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart
}) {
  const discountPercent = product.discountPercent || (
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0
  );

  return (
    <div className="store-product-card">
      {/* Top Right Discount Badge */}
      {discountPercent > 0 && (
        <span className="discount-badge">
          -{discountPercent}%
        </span>
      )}

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
          loading="lazy"
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

      {/* Price section */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
        <span className="price-tag" style={{ fontSize: '1rem', fontWeight: 800, color: '#e11d48' }}>
          {formatPrice(product.price)}{product.unit === 'mét' ? '/m' : ''}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>
            {formatPrice(product.originalPrice)}{product.unit === 'mét' ? '/m' : ''}
          </span>
        )}
      </div>

      {/* Rating & Review count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', color: '#f59e0b', gap: '1px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
          ))}
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          ({product.reviewsCount || 50})
        </span>
      </div>

      {/* Add To Cart Button */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={() => onAddToCart(product)}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '7px 8px',
            fontSize: '0.8rem',
            backgroundColor: '#0066cc',
            borderRadius: '6px'
          }}
        >
          <ShoppingCart size={14} />
          <span>Thêm vào giỏ</span>
        </button>
      </div>
    </div>
  );
}
