import React, { useState } from 'react';
import { X, Trash2, ShoppingCart, ArrowRight, ShieldCheck, Tag, Plus, Minus } from 'lucide-react';
import { formatPrice } from '../utils/api';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  discount,
  setDiscount,
  voucherCode,
  setVoucherCode
}) {
  if (!isOpen) return null;

  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    setVoucherError('');
    setVoucherSuccess('');

    const code = voucherCode.trim().toUpperCase();
    if (code === 'DIENNUOC' || code === 'CAMERATD') {
      setDiscount(50000);
      setVoucherSuccess('Đã áp dụng mã giảm 50.000₫!');
    } else if (code === 'PROVIP') {
      setDiscount(100000);
      setVoucherSuccess('Đã áp dụng mã VIP giảm 100.000₫!');
    } else {
      setVoucherError('Mã không hợp lệ. Thử: DIENNUOC hoặc PROVIP');
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 25px rgba(0,0,0,0.15)',
          animation: 'slideLeft 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0066cc',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={20} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Giỏ Hàng ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Highlight */}
        <div style={{
          backgroundColor: '#f0fdf4',
          borderBottom: '1px solid #bbf7d0',
          padding: '8px 18px',
          fontSize: '0.8rem',
          color: '#166534',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldCheck size={16} color="#16a34a" />
          <span>Đơn hàng đủ điều kiện <strong>Miễn phí vận chuyển</strong></span>
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
              <ShoppingCart size={40} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
              <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Giỏ hàng của bạn đang trống</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Hãy chọn thiết bị điện nước hoặc camera phù hợp</p>
              <button onClick={onClose} className="btn-primary" style={{ padding: '8px 18px' }}>
                Tiếp tục mua hàng
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr auto',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#fff'
                  }}
                >
                  <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '2px', lineHeight: 1.3 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e11d48', marginBottom: '6px' }}>
                      {formatPrice(item.price)}
                    </div>
                    {/* Quantity controls */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        style={{ background: '#f8fafc', border: 'none', padding: '2px 8px', cursor: 'pointer' }}
                      >
                        <Minus size={11} />
                      </button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        style={{ background: '#f8fafc', border: 'none', padding: '2px 8px', cursor: 'pointer' }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            {/* Voucher input */}
            <form onSubmit={handleApplyVoucher} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Mã giảm giá (DIENNUOC)"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '30px', fontSize: '0.8rem' }}
                />
                <Tag size={13} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <button type="submit" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Áp dụng
              </button>
            </form>
            {voucherError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '-8px', marginBottom: '8px' }}>{voucherError}</p>}
            {voucherSuccess && <p style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: '-8px', marginBottom: '8px' }}>{voucherSuccess}</p>}

            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Vận chuyển</span>
                <span style={{ color: '#16a34a' }}>Miễn phí</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid #e2e8f0',
                fontWeight: 800,
                fontSize: '1.05rem'
              }}>
                <span>Tổng cộng:</span>
                <span style={{ color: '#e11d48' }}>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onOpenCheckout}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
