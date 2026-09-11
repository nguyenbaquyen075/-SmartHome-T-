import React from 'react';
import { Home, Phone, Mail, Clock, Zap, Droplet } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#fff',
      borderTop: '1px solid #e2e8f0',
      marginTop: '40px',
      padding: '40px 0 20px',
      color: '#64748b'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
          gap: '30px',
          marginBottom: '35px'
        }}>
          {/* Col 1: Store Intro */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: '2px solid #0066cc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0066cc'
              }}>
                <Home size={22} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0066cc' }}>
                ĐIỆN NƯỚC CAMERA
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '14px' }}>
              Chuyên phân phối và lắp đặt thiết bị điện dân dụng, thiết bị ngành nước, đèn chiếu sáng và hệ thống camera an ninh giám sát chính hãng.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="#0066cc" />
                <span>Hotline: <strong style={{ color: '#0066cc' }}>0987 654 321</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} color="#0066cc" />
                <span>Email: lienhe@diennuoc-camera.vn</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} color="#0066cc" />
                <span>Giờ mở cửa: 8:00 - 22:00 hàng ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.8rem',
          color: '#94a3b8'
        }}>
          <div>© 2026 ĐIỆN NƯỚC CAMERA. Bản quyền thuộc về Điện Nước Camera Việt Nam.</div>
          <div>Chất lượng tạo nên niềm tin</div>
        </div>
      </div>
    </footer>
  );
}
