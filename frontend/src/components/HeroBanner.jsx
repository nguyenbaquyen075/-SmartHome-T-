import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

// Server cache ảnh 1 năm: đổi số v khi thay ảnh slide để trình duyệt tải lại
const SLIDES = [1, 2, 3, 4].map((n) => `/images/slide_${n}.jpg?v=2`);

export default function HeroBanner({ onSelectCategory, onViewCatalog }) {
  // Anh banner thay duoc trong trang quan tri
  const [banner, setBanner] = useState(null);
  useEffect(() => {
    api.getSettings().then((s) => setBanner(s.banner || null)).catch(() => {});
  }, []);

  // Trượt từ phải sang trái; ảnh đầu được nhân bản ở cuối để vòng lặp không trượt ngược
  const slides = banner ? [banner] : SLIDES;
  const track = slides.length > 1 ? [...slides, slides[0]] : slides;
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(true);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => { setAnim(true); setIdx((i) => (i < slides.length ? i + 1 : i)); }, 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div style={{ paddingTop: '10px', paddingBottom: '16px' }}>
      <div className="container">
        {/* Banner chính theo đúng kích thước 1024 x 317 */}
        <div
          onClick={onViewCatalog}
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            backgroundColor: '#005bb5',
            position: 'relative',
            width: '100%',
            aspectRatio: banner ? '1024 / 317' : '2159 / 728',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 102, 204, 0.16)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
          }}
          title="Xem danh mục sản phẩm"
        >
          <div
            onTransitionEnd={() => { if (idx === slides.length) { setAnim(false); setIdx(0); } }}
            style={{
              display: 'flex', width: '100%', height: '100%',
              transform: `translateX(-${idx * 100}%)`,
              transition: anim ? 'transform 0.7s ease' : 'none'
            }}
          >
            {track.map((src, i) => (
              <div key={i} style={{ flex: '0 0 100%', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={src}
                  alt="SmartHome T&D Banner"
                  fetchPriority={i === 0 ? 'high' : undefined}
                  decoding="async"
                  style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
