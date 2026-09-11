import React from 'react';
import { Home, Phone, Mail, Clock, MapPin, ShieldCheck, Zap, Droplet } from 'lucide-react';

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

          {/* Col 2: Showroom */}
          <div>
            <h4 style={{ color: '#1e293b', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>
              Địa Chỉ Cửa Hàng
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} color="#0066cc" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Cơ sở 1:</strong> 120 Thái Hà, P. Trung Liệt, Đống Đa, Hà Nội
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} color="#0066cc" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Cơ sở 2:</strong> 84 Trần Quang Khải, P. Tân Định, Quận 1, TP.HCM
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} color="#0066cc" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Cơ sở 3:</strong> 45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Policy */}
          <div>
            <h4 style={{ color: '#1e293b', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>
              Chính Sách & Dịch Vụ
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <li>• Chính sách bảo hành chính hãng 24 tháng</li>
              <li>• Dịch vụ tư vấn & khảo sát lắp đặt tận nơi</li>
              <li>• Đổi mới 100% trong 7 ngày nếu lỗi sản xuất</li>
              <li>• Hỗ trợ cài đặt phần mềm camera qua điện thoại</li>
            </ul>
          </div>

          {/* Col 4: Authorized brands */}
          <div>
            <h4 style={{ color: '#1e293b', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>
              Thương Hiệu Hợp Tác
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['HIKVISION', 'IMOU', 'DAHUA', 'SCHNEIDER', 'CADIVI', 'PANASONIC', 'RẠNG ĐÔNG', 'BÌNH MINH'].map((b) => (
                <span key={b} style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#334155'
                }}>
                  {b}
                </span>
              ))}
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
