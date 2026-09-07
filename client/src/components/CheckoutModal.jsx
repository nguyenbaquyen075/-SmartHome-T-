import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  QrCode, 
  Copy, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { formatPrice } from '../utils/api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  discount,
  onOrderSuccess
}) {
  if (!isOpen) return null;

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('vietqr');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalAmount = Math.max(0, subtotal - discount);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      setError('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        customer,
        items: cart,
        paymentMethod,
        discount
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo đơn hàng');
      }

      const createdOrder = await res.json();
      setCompletedOrder(createdOrder);
      onOrderSuccess(createdOrder);
    } catch (err) {
      setError(err.message || 'Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vietQrUrl = completedOrder
    ? `https://img.vietqr.io/image/970422-0987654321-compact2.png?amount=${completedOrder.finalAmount}&addInfo=${completedOrder.id}&accountName=DIEN%20NUOC%20CAMERA`
    : `https://img.vietqr.io/image/970422-0987654321-compact2.png?amount=${finalAmount}&addInfo=DIENNUOCCAMERA&accountName=DIEN%20NUOC%20CAMERA`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: completedOrder ? '550px' : '820px',
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
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {completedOrder ? (
          /* Confirmation View */
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={38} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
              Đặt Hàng Thành Công!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
              Cảm ơn bạn <strong>{completedOrder.customer.name}</strong>. Mã đơn hàng của bạn là:
            </p>

            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px dashed #0066cc',
              padding: '10px 18px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0066cc' }}>
                {completedOrder.id}
              </span>
              <button
                onClick={() => copyToClipboard(completedOrder.id)}
                style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Sao chép"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {/* If VietQR */}
            {completedOrder.paymentMethod === 'vietqr' && (
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ fontWeight: 700, color: '#0066cc', fontSize: '0.9rem', marginBottom: '10px' }}>
                  Quét Mã VietQR Thanh Toán Nhanh
                </div>
                <div style={{ backgroundColor: '#fff', padding: '10px', display: 'inline-block', borderRadius: '8px', marginBottom: '10px' }}>
                  <img src={vietQrUrl} alt="VietQR" style={{ width: '200px', height: '200px', display: 'block' }} />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
                  <div>Ngân hàng: <strong>MBBank</strong> • STK: <strong>0987654321</strong></div>
                  <div>Số tiền: <strong style={{ color: '#e11d48' }}>{formatPrice(completedOrder.finalAmount)}</strong></div>
                  <div>Nội dung CK: <strong style={{ color: '#0066cc' }}>{completedOrder.id}</strong></div>
                </div>
              </div>
            )}

            <button onClick={onClose} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
              Xong & Tiếp Tục Mua Sắm
            </button>
          </div>
        ) : (
          /* Form View */
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
              Thông Tin Giao Hàng & Đặt Hàng
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Điện Nước Camera cam kết bảo hành và kiểm tra hàng trước khi thanh toán
            </p>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitOrder}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                {/* Customer Details */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0066cc', marginBottom: '12px' }}>
                    1. Địa chỉ nhận hàng
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '3px' }}>Họ và tên *</label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        className="input-control"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '3px' }}>Số điện thoại *</label>
                      <input
                        type="tel"
                        placeholder="0912 345 678"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="input-control"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '3px' }}>Địa chỉ nhận hàng *</label>
                      <input
                        type="text"
                        placeholder="Số nhà, đường, phường, quận/huyện..."
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        className="input-control"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '3px' }}>Ghi chú đơn hàng</label>
                      <textarea
                        placeholder="Lắp đặt hoặc giao giờ hành chính..."
                        value={customer.note}
                        onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
                        className="input-control"
                        rows={2}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Payment & Summary */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0066cc', marginBottom: '12px' }}>
                    2. Phương thức thanh toán
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div 
                      onClick={() => setPaymentMethod('vietqr')}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: paymentMethod === 'vietqr' ? '2px solid #0066cc' : '1px solid #e2e8f0',
                        backgroundColor: paymentMethod === 'vietqr' ? '#eff6ff' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <QrCode size={18} color="#0066cc" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Chuyển khoản VietQR 24/7</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Quét mã QR qua app ngân hàng</div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: paymentMethod === 'cod' ? '2px solid #0066cc' : '1px solid #e2e8f0',
                        backgroundColor: paymentMethod === 'cod' ? '#eff6ff' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <Truck size={18} color="#0066cc" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Thanh toán khi nhận hàng (COD)</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Đồng kiểm hàng trước khi trả tiền</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Total Box */}
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>Tạm tính:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16a34a', marginBottom: '4px' }}>
                        <span>Giảm giá:</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Vận chuyển:</span>
                      <span style={{ color: '#16a34a' }}>Miễn phí</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '6px',
                      fontSize: '1.05rem',
                      fontWeight: 800
                    }}>
                      <span>Tổng thanh toán:</span>
                      <span style={{ color: '#e11d48' }}>{formatPrice(finalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Quay lại
                </button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '8px 24px' }}>
                  {loading ? 'Đang tạo đơn...' : 'Xác Nhận Đặt Hàng'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
