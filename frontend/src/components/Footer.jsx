import React from 'react';
import { Home, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#0066cc',
      marginTop: '24px',
      padding: '16px 0 10px',
      color: '#dbeafe'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
          gap: '12px',
          marginBottom: '10px'
        }}>
          {/* Col 1: Store Intro */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Home size={18} />
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                ĐIỆN NƯỚC CAMERA
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '8px' }}>
              Chuyên phân phối và lắp đặt thiết bị điện dân dụng, thiết bị ngành nước, đèn chiếu sáng và hệ thống camera an ninh giám sát chính hãng.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="#bae6fd" />
                <span>Hotline: <strong style={{ color: '#fff' }}>0987 654 321</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} color="#bae6fd" />
                <span>Email: lienhe@diennuoc-camera.vn</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} color="#bae6fd" />
                <span>Giờ mở cửa: 8:00 - 22:00 hàng ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.25)',
          paddingTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '4px',
          fontSize: '0.72rem',
          color: '#bfdbfe'
        }}>
          <div>© 2026 ĐIỆN NƯỚC CAMERA. Bản quyền thuộc về Điện Nước Camera Việt Nam.</div>
          <div>Chất lượng tạo nên niềm tin</div>
        </div>
      </div>
    </footer>
  );
}
