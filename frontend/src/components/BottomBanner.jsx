import React from 'react';
import { ShieldCheck, RotateCcw, Wrench } from 'lucide-react';

export default function BottomBanner() {
  return (
    <div style={{ marginTop: '35px', marginBottom: '40px' }}>
      <div className="container">
        <div style={{
          background: 'linear-gradient(90deg, #005bb5 0%, #0066cc 50%, #005bb5 100%)',
          borderRadius: '10px',
          padding: '18px 28px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 4px 14px rgba(0, 102, 204, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Left Decorative Image */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img 
              src="/images/products/1557597774-9d273605dfa9.jpg" 
              alt="Camera" 
              style={{ width: '65px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.3)' }}
            />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                SẢN PHẨM <span style={{ color: '#fef08a' }}>CHÍNH HÃNG</span> - GIÁ TỐT NHẤT
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#e0f2fe' }}>
                Phân phối thiết bị điện, nước và camera an ninh hàng đầu
              </p>
            </div>
          </div>

          {/* Three Commitment Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              <ShieldCheck size={18} color="#fef08a" />
              <span>Bảo hành chính hãng</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              <RotateCcw size={18} color="#fef08a" />
              <span>Đổi trả linh hoạt</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              <Wrench size={18} color="#fef08a" />
              <span>Hỗ trợ lắp đặt</span>
            </div>
          </div>

          {/* Right Pipe Illustration */}
          <div>
            <img 
              src="/images/products/1584622650111-993a426fbf0a.jpg" 
              alt="Equipment" 
              style={{ width: '65px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.3)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
