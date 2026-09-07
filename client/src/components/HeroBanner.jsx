import React, { useState } from 'react';
import { 
  Menu, 
  Camera, 
  Zap, 
  Droplets, 
  Lightbulb, 
  Cog, 
  Wrench, 
  Tag, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Tv,
  Smartphone,
  UserCheck
} from 'lucide-react';

export default function HeroBanner({ onSelectCategory, onViewCatalog }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const categoriesList = [
    { name: 'Camera an ninh', icon: Camera },
    { name: 'Thiết bị điện', icon: Zap },
    { name: 'Thiết bị nước', icon: Droplets },
    { name: 'Đèn chiếu sáng', icon: Lightbulb },
    { name: 'Vật tư phụ', icon: Cog },
    { name: 'Phụ kiện', icon: Wrench },
    { name: 'Thương hiệu', icon: Tag }
  ];

  return (
    <div style={{ paddingTop: '12px', paddingBottom: '16px' }}>
      <div className="container">
        {/* ================= DESKTOP 3-COLUMN HERO ================= */}
        <div className="desktop-only" style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr 280px',
            gap: '16px',
            alignItems: 'stretch'
          }}>
            {/* Left Column: DANH MỤC SẢN PHẨM Sidebar */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                backgroundColor: '#0066cc',
                color: '#fff',
                padding: '12px 16px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Menu size={18} />
                <span>DANH MỤC SẢN PHẨM</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {categoriesList.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.name}
                      onClick={() => onSelectCategory(cat.name)}
                      style={{
                        padding: '11px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: idx === categoriesList.length - 1 ? 'none' : '1px solid #f1f5f9',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#334155',
                        fontWeight: 500,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f7ff';
                        e.currentTarget.style.color = '#0066cc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.color = '#334155';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={16} color="#0066cc" />
                        <span>{cat.name}</span>
                      </div>
                      <ChevronRight size={15} color="#94a3b8" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center Slider */}
            <div style={{
              background: 'linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)',
              borderRadius: '10px',
              position: 'relative',
              overflow: 'hidden',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '30px 36px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ position: 'relative', zIndex: 2, maxWidth: '420px' }}>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '6px', color: '#fff' }}>
                  CAMERA AN NINH
                </h2>
                <p style={{ fontSize: '1rem', fontWeight: 500, color: '#e0f2fe', marginBottom: '20px' }}>
                  Giám sát mọi lúc - Bảo vệ mọi nơi
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Tv size={14} />
                    </div>
                    <span>Hình ảnh sắc nét Full HD/4K</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Smartphone size={14} />
                    </div>
                    <span>Xem từ xa qua điện thoại</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wrench size={14} />
                    </div>
                    <span>Lắp đặt nhanh chóng</span>
                  </div>
                </div>

                <button 
                  onClick={onViewCatalog}
                  style={{
                    backgroundColor: '#fff',
                    color: '#0066cc',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    padding: '9px 20px',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                  }}
                >
                  <span>Xem ngay</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <div style={{
                position: 'absolute',
                right: '25px',
                bottom: '25px',
                zIndex: 1
              }}>
                <img
                  src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=450&q=80"
                  alt="Security Camera"
                  style={{
                    width: '210px',
                    height: '160px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    border: '3px solid rgba(255,255,255,0.4)'
                  }}
                />
              </div>
            </div>

            {/* Right 2 Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div 
                onClick={() => onSelectCategory('Thiết bị nước')}
                style={{
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: '1px solid #93c5fd'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1', marginBottom: '2px' }}>
                    THIẾT BỊ NƯỚC
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#0284c7', marginBottom: '10px' }}>
                    Bền bỉ - Tiết kiệm
                  </p>
                  <span style={{
                    backgroundColor: '#0284c7',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    Xem ngay <ChevronRight size={12} />
                  </span>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=150&q=80" 
                  alt="Thiết bị nước" 
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                />
              </div>

              <div 
                onClick={() => onSelectCategory('Thiết bị điện')}
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: '1px solid #fcd34d'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#b45309', marginBottom: '2px' }}>
                    THIẾT BỊ ĐIỆN
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#d97706', marginBottom: '10px' }}>
                    An toàn - Hiện đại
                  </p>
                  <span style={{
                    backgroundColor: '#d97706',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    Xem ngay <ChevronRight size={12} />
                  </span>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=150&q=80" 
                  alt="Thiết bị điện" 
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= MOBILE HERO BANNER (MATCHING MOBILE SCREENSHOT) ================= */}
        <div className="mobile-only" style={{ marginBottom: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #005bb5 100%)',
            borderRadius: '14px',
            padding: '18px 16px 20px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 14px rgba(0, 102, 204, 0.2)'
          }}>
            {/* Pill Tag */}
            <div style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
              marginBottom: '8px'
            }}>
              CAMERA AN NINH
            </div>

            {/* Headline */}
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '4px'
            }}>
              GIÁM SÁT MỌI LÚC
            </h2>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#facc15',
              marginBottom: '12px'
            }}>
              BẢO VỆ MỌI NƠI
            </h2>

            {/* 3 Mobile Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '0.65rem'
                }}>
                  HD
                </span>
                <span>Full HD/4K</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCheck size={10} />
                </div>
                <span>Phát hiện chuyển động</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Smartphone size={10} />
                </div>
                <span>Xem từ xa qua điện thoại</span>
              </div>
            </div>

            {/* Yellow CTA Button */}
            <button
              onClick={onViewCatalog}
              style={{
                backgroundColor: '#facc15',
                color: '#0f172a',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <span>Xem ngay</span>
              <ArrowRight size={14} />
            </button>

            {/* Right Camera Image Preview */}
            <div style={{
              position: 'absolute',
              right: '-10px',
              bottom: '10px',
              width: '160px',
              height: '130px',
              pointerEvents: 'none'
            }}>
              <img
                src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=300&q=80"
                alt="Camera surveillance"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  opacity: 0.95,
                  transform: 'rotate(-4deg)'
                }}
              />
            </div>

            {/* Carousel Dots */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '5px',
              marginTop: '16px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }}></span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }}></span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }}></span>
            </div>
          </div>
        </div>

        {/* ================= 4 SERVICE COMMITMENTS ================= */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          {/* Commitment 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0066cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#1e293b', lineHeight: 1.2 }}>Cam kết chính hãng</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>100%</div>
            </div>
          </div>

          {/* Commitment 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0066cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#1e293b', lineHeight: 1.2 }}>Giao hàng nhanh</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Toàn quốc</div>
            </div>
          </div>

          {/* Commitment 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0066cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#1e293b', lineHeight: 1.2 }}>Đổi trả dễ dàng</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Trong 7 ngày</div>
            </div>
          </div>

          {/* Commitment 4 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0066cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#1e293b', lineHeight: 1.2 }}>Tư vấn miễn phí</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Hỗ trợ 24/7</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
