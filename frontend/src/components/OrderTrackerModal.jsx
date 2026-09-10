import React, { useState } from 'react';
import { X, Search, PackageCheck, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatPrice } from '../utils/api';

export default function OrderTrackerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) {
        throw new Error('Không tìm thấy đơn hàng với mã hoặc số điện thoại này.');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Không tìm thấy đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'processing', label: 'Tiếp nhận & Xử lý', icon: Clock },
    { key: 'shipping', label: 'Đang vận chuyển', icon: Truck },
    { key: 'completed', label: 'Giao thành công', icon: CheckCircle2 }
  ];

  const getStepIndex = (status) => {
    if (status === 'completed') return 2;
    if (status === 'shipping') return 1;
    return 0;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '650px',
          padding: '28px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PackageCheck size={24} color="#f59e0b" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              Tra Cứu Tiến Độ Đơn Hàng
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Nhập mã đơn (VD: ORD-98421) hoặc Số điện thoại đặt hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-control"
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0 20px' }}>
            <Search size={16} />
            <span>{loading ? 'Đang tìm...' : 'Tra cứu'}</span>
          </button>
        </form>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#fda4af',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details View */}
        {order && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>MÃ ĐƠN HÀNG</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>{order.id}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${order.orderStatus === 'completed' ? 'badge-emerald' : order.orderStatus === 'shipping' ? 'badge-cyan' : 'badge-amber'}`}>
                  {order.orderStatus === 'completed' ? 'Đã hoàn thành' : order.orderStatus === 'shipping' ? 'Đang vận chuyển' : 'Đang xử lý'}
                </span>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  Thanh toán: <strong style={{ color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'relative',
              marginBottom: '28px',
              padding: '0 10px'
            }}>
              {/* Line connector */}
              <div style={{
                position: 'absolute',
                top: '18px',
                left: '30px',
                right: '30px',
                height: '2px',
                background: 'rgba(255, 255, 255, 0.1)',
                zIndex: 1
              }}></div>

              {statusSteps.map((step, idx) => {
                const Icon = step.icon;
                const isCurrent = getStepIndex(order.orderStatus) >= idx;
                return (
                  <div key={step.key} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 2
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isCurrent ? '#f59e0b' : '#141b28',
                      color: isCurrent ? '#000' : '#64748b',
                      border: `2px solid ${isCurrent ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      <Icon size={16} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isCurrent ? '#f8fafc' : '#64748b' }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Customer Info */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              marginBottom: '16px',
              lineHeight: 1.6
            }}>
              <div><strong>Khách hàng:</strong> {order.customer?.name} ({order.customer?.phone})</div>
              <div><strong>Địa chỉ:</strong> {order.customer?.address}</div>
              {order.customer?.note && <div><strong>Ghi chú:</strong> {order.customer?.note}</div>}
            </div>

            {/* Order Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {order.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#cbd5e1' }}>
                    {item.name} <strong style={{ color: '#94a3b8' }}>x{item.quantity}</strong>
                  </span>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '12px'
            }}>
              <span style={{ fontWeight: 600, color: '#94a3b8' }}>Tổng cộng:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>
                {formatPrice(order.finalAmount)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
