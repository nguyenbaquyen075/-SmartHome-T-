import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  Heart, 
  Share2, 
  SlidersHorizontal,
  Check,
  Droplets,
  Moon,
  Tv,
  FileText,
  Cog,
  BookOpen,
  Compass,
  CheckCircle2
} from 'lucide-react';

export default function ProductDetailPage({
  product,
  allProducts = [],
  onBack,
  onSelectProduct
}) {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('intro');
  const [isLiked, setIsLiked] = useState(false);

  // 4 Main Tabs: Giới thiệu, Thông số kỹ thuật, Hướng dẫn sử dụng, Chính sách bảo hành
  const tabs = [
    { id: 'sec-intro', key: 'intro', label: 'Giới thiệu', short: 'Giới thiệu', icon: FileText },
    { id: 'sec-specs', key: 'specs', label: 'Thông số kỹ thuật', short: 'Thông số', icon: Cog },
    { id: 'sec-guide', key: 'guide', label: 'Hướng dẫn sử dụng', short: 'Hướng dẫn', icon: BookOpen },
    { id: 'sec-warranty', key: 'warranty', label: 'Chính sách bảo hành', short: 'Bảo hành', icon: ShieldCheck }
  ];

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedImgIdx(0);
    setActiveTab('intro');
  }, [product?.id]);

  // ScrollSpy listener: tracks scroll position and lights up corresponding tab
  // ScrollSpy listener: tracks scroll position and lights up corresponding tab
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = tabs.length - 1; i >= 0; i--) {
        const item = tabs[i];
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            setActiveTab(item.key);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tabs]);

  const scrollToTabSection = (id, key) => {
    setActiveTab(key);
    const elem = document.getElementById(id);
    if (elem) {
      const yOffset = -65; // Position heading right below the sticky tab bar
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!product) return null;

  // Multiple gallery images
  const images = product.images && product.images.length > 1 ? product.images : [
    product.image,
    '/images/products/1558002038-1055907df827.jpg',
    '/images/products/1557597774-9d273605dfa9.jpg',
    '/images/products/1584622650111-993a426fbf0a.jpg',
    '/images/products/1581092160607-ee22621dd758.jpg'
  ];

  // Related products
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 5);

  const displayRelated = relatedProducts.length >= 3 
    ? relatedProducts 
    : allProducts.filter((p) => p.id !== product.id).slice(0, 5);


  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* 1. Breadcrumbs (Matching Screenshot) */}
      <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
          >
            <Home size={14} />
          </button>
          <ChevronRight size={13} color="#94a3b8" />
          <span style={{ cursor: 'pointer' }} onClick={onBack}>Camera</span>
          <ChevronRight size={13} color="#94a3b8" />
          <span style={{ cursor: 'pointer' }} onClick={onBack}>{product.category}</span>
          <ChevronRight size={13} color="#94a3b8" />
          <span style={{ color: '#0066cc', fontWeight: 600 }}>{product.name}</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '20px' }}>
        {/* 2. Top Main Product Grid (Gallery + Buy Box) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
          gap: '36px',
          marginBottom: '35px'
        }}>
          {/* Column 1: Image Gallery */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '380px',
              backgroundColor: '#fff',
              marginBottom: '16px'
            }}>
              {/* Brand Logo on Top Right */}
              <div style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0066cc',
                letterSpacing: '0.5px'
              }}>
                {product.brand}
              </div>

              {/* Main Image */}
              <img
                src={images[selectedImgIdx]}
                alt={product.name}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />

              {/* Navigation Arrows */}
              <button
                onClick={() => setSelectedImgIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setSelectedImgIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Thumbnails Row */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImgIdx(idx)}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '8px',
                    border: selectedImgIdx === idx ? '2px solid #0066cc' : '1px solid #e2e8f0',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#fff'
                  }}
                >
                  <img src={img} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
              ))}
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: 600,
                flexShrink: 0
              }}>
                +3
              </div>
            </div>
          </div>

          {/* Column 2: Buy Box */}
          <div>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '4px',
              marginBottom: '10px'
            }}>
              {product.category}
            </div>

            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#1e293b',
              lineHeight: 1.3,
              marginBottom: '10px'
            }}>
              {product.name}
            </h1>

            {/* 4 Feature Badges Strip (Matching Screenshot) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(130px, 100%), 1fr))',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 6px',
              marginBottom: '20px',
              gap: '8px'
            }}>
              {/* Feature 1: Resolution */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 8px',
                borderRight: '1px solid #e2e8f0'
              }}>
                <div style={{
                  border: '1.5px solid #0066cc',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  color: '#0066cc',
                  lineHeight: 1,
                  flexShrink: 0
                }}>
                  HD
                </div>
                <div style={{ fontSize: '0.73rem', color: '#334155', lineHeight: 1.3 }}>
                  <span style={{ color: '#64748b' }}>Độ phân giải</span><br />
                  <strong>2MP</strong> <span style={{ color: '#64748b', fontSize: '0.68rem' }}>(1920 x 1080)</span>
                </div>
              </div>

              {/* Feature 2: Night vision */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 8px',
                borderRight: '1px solid #e2e8f0'
              }}>
                <Moon size={18} color="#0066cc" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.73rem', color: '#334155', lineHeight: 1.3 }}>
                  <span style={{ color: '#64748b' }}>Hồng ngoại</span><br />
                  <strong>30m</strong> <span style={{ color: '#64748b', fontSize: '0.68rem' }}>quan sát ban đêm</span>
                </div>
              </div>

              {/* Feature 3: Waterproof */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 8px',
                borderRight: '1px solid #e2e8f0'
              }}>
                <Droplets size={18} color="#0066cc" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.73rem', color: '#334155', lineHeight: 1.3 }}>
                  <span style={{ color: '#64748b' }}>Chuẩn chống nước</span><br />
                  <strong>IP67</strong> <span style={{ color: '#64748b', fontSize: '0.68rem' }}>ngoài trời</span>
                </div>
              </div>

              {/* Feature 4: Warranty */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 8px'
              }}>
                <Wrench size={18} color="#0066cc" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.73rem', color: '#334155', lineHeight: 1.3 }}>
                  <span style={{ color: '#64748b' }}>Bảo hành chính hãng</span><br />
                  <strong>24 tháng</strong>
                </div>
              </div>
            </div>

            {/* In Stock Notice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#15803d', marginBottom: '20px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={12} strokeWidth={3} />
              </div>
              <span><strong>Còn hàng</strong> - Giao hàng nhanh 1 - 3 ngày trên toàn quốc</span>
            </div>

            {/* Extra Utilities */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '0.85rem', color: '#64748b' }}>
              <button
                onClick={() => setIsLiked(!isLiked)}
                style={{ background: 'none', border: 'none', color: isLiked ? '#e11d48' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
              >
                <Heart size={16} fill={isLiked ? '#e11d48' : 'none'} />
                <span>Thêm vào yêu thích</span>
              </button>
              <button
                onClick={() => alert('Đã sao chép liên kết sản phẩm!')}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
              >
                <Share2 size={16} />
                <span>Chia sẻ</span>
              </button>
              <button
                onClick={() => alert('Đã thêm sản phẩm vào so sánh!')}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
              >
                <SlidersHorizontal size={16} />
                <span>So sánh</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. STICKY HORIZONTAL TAB BAR WITH ICONS (ALWAYS VISIBLE ON SCROLL)        */}
        {/* ========================================================================= */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          marginBottom: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {/* Sticky Tab Navigation Bar - Stays permanently pinned at top while scrolling */}
          <div className="pd-tabbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => scrollToTabSection(tab.id, tab.key)}
                  className={`pd-tab ${isActive ? 'on' : ''}`}
                >
                  <Icon size={16} />
                  <span className="pd-tab-full">{tab.label}</span>
                  <span className="pd-tab-short">{tab.short}</span>
                </button>
              );
            })}
          </div>

          {/* Continuous Scrollable Content Sections */}
          <div style={{ padding: '28px 24px' }}>
            {/* SECTION 1: GIỚI THIỆU TỔNG QUAN & THIẾT KẾ (MATCHING SCREENSHOT) */}
            <section id="sec-intro" style={{ marginBottom: '40px' }}>
              {/* Section Heading with blue bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '4px', height: '22px', backgroundColor: '#0066cc', borderRadius: '2px' }}></div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                  1. Giới thiệu tổng quan & Thiết kế
                </h2>
              </div>

              {/* 2-Column Section from Screenshot */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
                gap: '28px',
                alignItems: 'start'
              }}>
                {/* Left Text with blue indicator tag */}
                <div>
                  <p style={{
                    fontSize: '0.92rem',
                    color: '#334155',
                    lineHeight: 1.7,
                    position: 'relative',
                    paddingLeft: '18px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '7px',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#93c5fd',
                      borderRadius: '2px',
                      display: 'inline-block'
                    }}></span>
                    <strong>{product.name}</strong> là dòng sản phẩm camera giám sát an ninh thế hệ mới được tối ưu hóa cho công trình nhà ở, biệt thự, văn phòng, nhà xưởng và chuỗi cửa hàng bán lẻ. Sản phẩm sở hữu thiết kế thân trụ gọn gàng, lớp vỏ đúc hợp kim nguyên khối kết hợp nắp che chống nắng mưa giúp máy vận hành ổn định liên tục 24/7/365 trong môi trường nhiệt đới gió mùa tại Việt Nam.
                  </p>
                </div>

                {/* Right: Đặc điểm nổi bật Box */}
                <div style={{
                  backgroundColor: '#f0f7ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '18px 20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 800, color: '#0066cc', marginBottom: '14px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid #0066cc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0066cc',
                      flexShrink: 0
                    }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span>Đặc điểm nổi bật</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      'Độ phân giải Full HD 2MP sắc nét',
                      'Hồng ngoại 30m, quan sát đêm hiệu quả',
                      'Chuẩn chống nước IP67, lắp đặt ngoài trời',
                      'Thiết kế bền bỉ, hoạt động ổn định'
                    ].map((bullet, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#1e3a8a' }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: '#0066cc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Check size={10} color="#fff" strokeWidth={3.5} />
                        </div>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '30px 0' }} />

            {/* SECTION 2: THÔNG SỐ KỸ THUẬT */}
            <section id="sec-specs" style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '4px', height: '22px', backgroundColor: '#0066cc', borderRadius: '2px' }}></div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                  2. Thông số kỹ thuật chi tiết
                </h2>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <tbody>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#64748b', width: '35%' }}>Độ phân giải</td>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#1e293b' }}>2.0 Megapixel (1920 × 1080) Full HD</td>
                    </tr>
                    <tr style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#64748b' }}>Cảm biến hình ảnh</td>
                      <td style={{ padding: '11px 16px', color: '#1e293b' }}>1/2.8" Progressive Scan CMOS thế hệ mới</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#64748b' }}>Tiêu cự ống kính</td>
                      <td style={{ padding: '11px 16px', color: '#1e293b' }}>2.8mm (góc rộng 103°) hoặc 4mm (góc nhìn 86°)</td>
                    </tr>
                    <tr style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#64748b' }}>Tầm xa hồng ngoại</td>
                      <td style={{ padding: '11px 16px', color: '#1e293b' }}>30 mét quan sát rõ nét ban đêm</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#64748b' }}>Tiêu chuẩn chống nước</td>
                      <td style={{ padding: '11px 16px', color: '#1e293b' }}>IP67 lắp đặt ngoài trời</td>
                    </tr>
                    <tr style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#64748b' }}>Chuẩn nén video</td>
                      <td style={{ padding: '11px 16px', color: '#1e293b' }}>H.265+ / H.265 / H.264+ / H.264</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#64748b' }}>Nguồn điện</td>
                      <td style={{ padding: '11px 16px', color: '#1e293b' }}>12V DC ± 25% hoặc Cấp nguồn PoE (802.3af)</td>
                    </tr>
                    <tr style={{ backgroundColor: '#fff' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#64748b' }}>Trọng lượng</td>
                      <td style={{ padding: '11px 16px', color: '#1e293b' }}>Khoảng 480g</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '30px 0' }} />

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '30px 0' }} />

            {/* SECTION 3: HƯỚNG DẪN SỬ DỤNG */}
            <section id="sec-guide" style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '4px', height: '22px', backgroundColor: '#0066cc', borderRadius: '2px' }}></div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                  3. Hướng dẫn cài đặt & sử dụng
                </h2>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', fontSize: '0.88rem', color: '#334155', lineHeight: 1.7 }}>
                <div style={{ marginBottom: '8px' }}>• <strong>Bước 1:</strong> Cố định camera lên tường và cắm nguồn điện 12V hoặc dây mạng PoE.</div>
                <div style={{ marginBottom: '8px' }}>• <strong>Bước 2:</strong> Tải ứng dụng trên điện thoại qua App Store hoặc Google Play.</div>
                <div style={{ marginBottom: '8px' }}>• <strong>Bước 3:</strong> Quét mã QR code in trên tem thân máy để kết nối.</div>
                <div>• <strong>Bước 4:</strong> Đặt mật khẩu và bắt đầu xem video trực tiếp từ xa 24/7.</div>
              </div>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '30px 0' }} />

            {/* SECTION 4: CHÍNH SÁCH BẢO HÀNH */}
            <section id="sec-warranty">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '4px', height: '22px', backgroundColor: '#0066cc', borderRadius: '2px' }}></div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                  4. Chính sách bảo hành & Cam kết
                </h2>
              </div>

              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', fontSize: '0.88rem', color: '#1e3a8a', lineHeight: 1.7 }}>
                <p style={{ marginBottom: '8px' }}>• <strong>Bảo hành:</strong> 24 tháng chính hãng tại tất cả trung tâm bảo hành toàn quốc.</p>
                <p style={{ marginBottom: '8px' }}>• <strong>Đổi mới:</strong> 1 đổi 1 trong vòng 7 ngày nếu lỗi phần cứng từ nhà sản xuất.</p>
                <p>• <strong>Hỗ trợ kỹ thuật:</strong> Gọi ngay hotline <strong style={{ color: '#0066cc' }}>0987 654 321</strong> phục vụ từ 8:00 đến 22:00 hàng ngày.</p>
              </div>
            </section>
          </div>
        </div>

        {/* 4. SẢN PHẨM LIÊN QUAN (RELATED PRODUCTS SECTION) */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
              Sản phẩm liên quan
            </h3>
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', color: '#0066cc', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Xem tất cả →
            </button>
          </div>

          {/* Related Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
            gap: '16px'
          }}>
            {displayRelated.map((rel) => {
              return (
                <div
                  key={rel.id}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                  }}
                  onClick={() => onSelectProduct(rel)}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 102, 204, 0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
                >
                  <div style={{ width: '100%', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', marginBottom: '8px' }}>
                    <img src={rel.image} alt={rel.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>

                  <h4 style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '34px',
                    marginBottom: '6px'
                  }}>
                    {rel.name}
                  </h4>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
