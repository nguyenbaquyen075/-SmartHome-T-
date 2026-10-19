import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

// Mỗi slide có sẵn 4 cỡ WebP (480/800/1200/1800px): điện thoại tải bản nhỏ ~20-40KB thay vì JPG 360KB.
// Server cache ảnh 1 năm: thay ảnh slide thì tạo lại các bản webp (tên file mới) để trình duyệt tải lại.
const CO_ANH = [480, 800, 1200, 1800];
const SLIDES = [1, 2, 3, 4].map((n) => ({
  src: `/images/slide_${n}-1200.webp`,
  srcSet: CO_ANH.map((w) => `/images/slide_${n}-${w}.webp ${w}w`).join(', ')
}));
// Banner rộng hết khung trang (tối đa ~1230px trên máy tính)
const SIZES = '(max-width: 1280px) 100vw, 1230px';

export default function HeroBanner({ onSelectCategory, onViewCatalog }) {
  // Anh banner thay duoc trong trang quan tri
  const [banner, setBanner] = useState(null);
  useEffect(() => {
    api.getSettings().then((s) => setBanner(s.banner || null)).catch(() => {});
  }, []);

  // Trượt từ phải sang trái; ảnh đầu được nhân bản ở cuối để vòng lặp không trượt ngược
  const slides = banner ? [{ src: banner }] : SLIDES;
  // Chỉ ảnh đầu tải ngay; các ảnh sau đợi ảnh đầu hiện xong mới tải, khỏi giành mạng lúc mở trang
  const [taiTiep, setTaiTiep] = useState(false);
  const track = slides.length > 1 ? [...slides, slides[0]] : slides;
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(true);
  useEffect(() => {
    if (slides.length < 2 || !taiTiep) return;   // chưa tải ảnh sau thì chưa trượt, khỏi lộ khung trống
    const t = setInterval(() => { setAnim(true); setIdx((i) => (i < slides.length ? i + 1 : i)); }, 4000);
    return () => clearInterval(t);
  }, [slides.length, taiTiep]);

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
            {track.map((anh, i) => (
              <div key={i} style={{ flex: '0 0 100%', position: 'relative', overflow: 'hidden' }}>
                {(i === 0 || taiTiep) && (
                  <img
                    src={anh.src}
                    srcSet={anh.srcSet}
                    sizes={anh.srcSet ? SIZES : undefined}
                    alt="SmartHome T&D Banner"
                    width={1800}
                    height={608}
                    fetchPriority={i === 0 ? 'high' : 'low'}
                    decoding={i === 0 ? 'sync' : 'async'}
                    onLoad={i === 0 ? () => setTimeout(() => setTaiTiep(true), 800) : undefined}
                    style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
