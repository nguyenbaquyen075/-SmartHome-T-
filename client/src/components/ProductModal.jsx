import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { formatPrice } from '../utils/api';

export default function ProductModal({
  product,
  onClose,
  onAddToCart,
  onToggleCompare,
  isCompared,
  onBuyNow
}) {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'desc'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '850px',
          padding: '28px',
          backgroundColor: '#fff'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Body */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '24px'
        }}>
          {/* Image */}
          <div>
            <div style={{
              width: '100%',
              height: '300px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              backgroundColor: '#fff',
              marginBottom: '14px'
            }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Quick guarantees */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.8rem',
              color: '#64748b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} color="#0066cc" />
                <span>Bảo hành chính hãng 24 tháng</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={15} color="#0066cc" />
                <span>Giao hàng nhanh toàn quốc 1-3 ngày</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RotateCcw size={15} color="#0066cc" />
                <span>Đổi mới trong 7 ngày nếu có lỗi kỹ thuật</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              marginBottom: '8px'
            }}>
              {product.brand} • {product.category}
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.3, marginBottom: '8px' }}>
              {product.name}
            </h2>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
              {product.subTitle}
            </p>

            {/* Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', color: '#f59e0b', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>({product.reviewsCount || 50} đánh giá)</span>
            </div>

            {/* Price */}
            <div style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #ffe4e6',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e11d48' }}>
                  {formatPrice(product.price)}{product.unit === 'mét' ? '/m' : ''}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                    {formatPrice(product.originalPrice)}{product.unit === 'mét' ? '/m' : ''}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} strokeWidth={3} />
                <span>Giá đã bao gồm VAT & Cam kết hàng mới 100% nguyên đai nguyên kiện</span>
              </div>
            </div>

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Số lượng:</span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: '#f8fafc', border: 'none', padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}
                >
                  -
                </button>
                <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: '#f8fafc', border: 'none', padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                ● Sẵn sàng giao ngay
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="btn-secondary"
                style={{ padding: '10px', borderColor: '#0066cc', color: '#0066cc' }}
              >
                <ShoppingCart size={16} />
                <span>Thêm vào giỏ</span>
              </button>
              <button
                onClick={() => onBuyNow(product, quantity)}
                className="btn-primary"
                style={{ padding: '10px' }}
              >
                <span>Mua ngay</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Specs Table */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
            Thông số kỹ thuật chi tiết
          </h3>
          {product.specs && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '10px'
            }}>
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                    {key}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}
          {product.description && (
            <p style={{ marginTop: '14px', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
              {product.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
