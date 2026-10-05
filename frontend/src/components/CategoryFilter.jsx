import React, { useState, useEffect } from 'react';
import { LayoutGrid, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { AnhChay } from '../utils/anhChay';
import { useDanhMuc, iconDanhMuc, ANH_TAT_CA } from '../utils/danhMuc';

// Số ô trên một hàng, khớp với CSS bên dưới (<=480px: 2 ô, còn lại 4 ô)
function useCotMotHang() {
  const [cot, setCot] = useState(() => (window.matchMedia('(max-width: 480px)').matches ? 2 : 4));
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)');
    const f = () => setCot(mq.matches ? 2 : 4);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  return cot;
}

export default function CategoryFilter({
  selectedCategory,
  setSelectedCategory,
  onViewAll,
  dem = {},
  anhTheoDanhMuc = {}
}) {
  const [hoveredCat, setHoveredCat] = useState(null);
  const [moRong, setMoRong] = useState(false);
  const cot = useCotMotHang();
  const [lech, setLech] = useState(0); // số lần đã đổi ô

  // "Tất cả" + danh mục lấy từ trang Quản trị > Danh mục
  const danhMuc = useDanhMuc();
  const categories = [
    { name: 'Tất cả', label: 'Tất cả', icon: LayoutGrid, image: ANH_TAT_CA, alt: 'Tất cả sản phẩm' },
    ...danhMuc.map((d) => ({
      name: d.ten,
      label: d.ten,
      icon: iconDanhMuc(d.icon),
      image: d.anh || ANH_TAT_CA,
      alt: d.ten
    }))
  ];

  // Khi chưa bấm "Xem thêm": cứ 1s một ô (lần lượt từ trái sang) được thay bằng danh mục kế tiếp, rê chuột vào thì dừng
  const xoay = !moRong && categories.length > cot;
  useEffect(() => {
    if (!xoay || hoveredCat) return;
    const t = setInterval(() => setLech((l) => l + 1), 1000);
    return () => clearInterval(t);
  }, [xoay, hoveredCat]);
  // Ô s đã được thay ceil((lech - s) / cot) lần, mỗi lần nhảy cot danh mục
  const hang = xoay
    ? Array.from({ length: cot }, (_, s) => categories[(s + cot * Math.max(0, Math.ceil((lech - s) / cot))) % categories.length])
    : categories;

  return (
    <div style={{ marginBottom: '18px' }}>
      {/* 1. Header Bar: DANH MỤC SẢN PHẨM & Xem tất cả */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        {/* Left: 4-square grid icon + Section Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0066cc'
          }}>
            <LayoutGrid size={20} strokeWidth={2.4} />
          </div>
          <h2 style={{
            fontSize: '1.08rem',
            fontWeight: 800,
            color: '#0066cc',
            margin: 0,
            letterSpacing: '0.2px',
            textTransform: 'uppercase',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            DANH MỤC SẢN PHẨM
          </h2>
        </div>

        {/* Right: "Xem tất cả →" button */}
        <button
          onClick={() => (onViewAll ? onViewAll('Tất cả') : setSelectedCategory('Tất cả'))}
          style={{
            background: 'none',
            border: 'none',
            color: '#0066cc',
            fontSize: '0.86rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            padding: '3px 6px',
            borderRadius: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#eef6ff';
            e.currentTarget.style.transform = 'translateX(2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'none';
          }}
          title="Xem tất cả sản phẩm"
        >
          <span>Xem tất cả</span>
          <ArrowRight size={15} strokeWidth={2.4} />
        </button>
      </div>

      {/* 2. 4 Khung Ô Danh Mục (Tất cả, Thiết bị điện, Thiết bị mạng, Thiết bị nước) */}
      <div
        className="category-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px'
        }}
      >
        {hang.map((cat, i) => {
          const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
            (cat.name === 'Tất cả' && selectedCategory === 'Tất cả');
          const isHovered = hoveredCat === cat.name;
          const IconComponent = cat.icon;
          // Số sản phẩm: quá 99 thì rút gọn cho khỏi vỡ ô
          const so = dem[cat.name] || 0;
          const soHien = so > 99 ? '99+' : so;

          return (
            <div
              key={`${i}-${cat.name}`}
              onClick={() => setSelectedCategory(cat.name)}
              onMouseEnter={() => setHoveredCat(cat.name)}
              onMouseLeave={() => setHoveredCat(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedCategory(cat.name);
                }
              }}
              className="cat-card-item"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '0px', // Không bo góc
                border: (isActive || isHovered) ? '1.5px solid #0066cc' : '1.5px solid #60a5fa', // Viền xanh mặc định, đậm hơn khi chọn/rê chuột
                padding: '10px 14px 12px 14px',
                height: '122px', // Chiều cao chuẩn thanh thoát
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isActive
                  ? '0 4px 16px rgba(96, 165, 250, 0.22)'
                  : isHovered
                    ? '0 4px 12px rgba(96, 165, 250, 0.15)'
                    : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transform: isActive || isHovered ? 'translateY(-2px)' : 'none',
                transition: 'all 0.18s ease',
                userSelect: 'none',
                // Ô mở thêm hiện lần lượt, cách nhau 0.05s
                ...(i >= cot && { animation: 'catHien 0.25s ease backwards', animationDelay: `${(i - cot) * 0.05}s` }),
                // Ô vừa được thay nhảy ra
                ...(xoay && lech > 0 && i === (lech - 1) % cot && { animation: 'catHien 0.3s ease backwards' })
              }}
            >
              {/* Số sản phẩm - chấm đỏ góc trên bên phải */}
              {so > 0 && <span className="cat-card-so">{soHien}</span>}

              {/* Ảnh đại diện: chỉ ảnh chính của sản phẩm, tự đảo vài giây 1 lần.
                  Danh mục chưa có hàng thì dùng ảnh minh họa mặc định. */}
              <div style={{
                height: '66px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                overflow: 'visible'
              }}>
                <AnhChay
                  ds={anhTheoDanhMuc[cat.name] || []}
                  macDinh={cat.image}
                  alt={cat.alt}
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.2s ease',
                    transform: isHovered || isActive ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
              </div>

              {/* Bottom bar: Circular Blue Icon + Title */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: 'auto',
                paddingTop: '4px'
              }}>
                {/* Icon Pill Circle */}
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#0066cc' : '#eff6ff',
                  border: isActive ? '1px solid #0066cc' : '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: isActive ? '#ffffff' : '#0066cc',
                  transition: 'all 0.2s ease'
                }}>
                  <IconComponent size={14} strokeWidth={2.4} />
                </div>

                {/* Title */}
                <span
                  className="cat-card-title"
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: '#0066cc',
                    lineHeight: 1.25,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {cat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {categories.length > cot && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            onClick={() => setMoRong((v) => !v)}
            style={{
              background: '#eef6ff', border: '1.5px solid #60a5fa', color: '#0066cc',
              fontSize: '0.86rem', fontWeight: 700, padding: '6px 18px', borderRadius: '999px',
              display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer'
            }}
          >
            {moRong ? 'Thu gọn' : 'Xem thêm'}
            {moRong ? <ChevronUp size={15} strokeWidth={2.4} /> : <ChevronDown size={15} strokeWidth={2.4} />}
          </button>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @keyframes catHien { from { opacity: 0; transform: translateY(8px) scale(0.92); } to { opacity: 1; transform: none; } }
        @media (max-width: 768px) {
          .category-cards-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 8px !important;
          }
          .cat-card-item {
            height: 108px !important;
            padding: 8px 6px 10px 6px !important;
          }
          .cat-card-item img {
            max-height: 54px !important;
          }
          .cat-card-title {
            font-size: 0.72rem !important;
          }
        }
        @media (max-width: 480px) {
          .category-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .cat-card-item {
            height: 112px !important;
            padding: 8px 10px !important;
          }
          .cat-card-title {
            font-size: 0.82rem !important;
          }
        }
      `}</style>
    </div>
  );
}
