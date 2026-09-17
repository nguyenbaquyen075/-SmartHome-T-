import React, { useState, useEffect } from 'react';
import {
  Home,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Heart,
  Share2,
  SlidersHorizontal,
  Check,
  FileText,
  Cog,
  BookOpen
} from 'lucide-react';
import ProductCard from './ProductCard';
import { doiNhan, DaiNoiBat, MAU_HUONG_DAN, BAO_HANH_MAC_DINH } from '../utils/sanPham';

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

  // Chi hien anh that cua san pham, khong chen anh minh hoa khong lien quan
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);

  // Huong dan va bao hanh: lay tu du lieu, chua nhap thi dung mau theo danh muc
  const huongDan = product.huongDan?.length
    ? product.huongDan
    : MAU_HUONG_DAN[product.category] || MAU_HUONG_DAN['Phụ kiện'];
  const baoHanh = {
    thoiGian: product.baoHanh?.thoiGian || BAO_HANH_MAC_DINH.thoiGian,
    doiTra: product.baoHanh?.doiTra || BAO_HANH_MAC_DINH.doiTra
  };

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
        <div className="container nut-dong-hang" style={{ fontSize: '0.82rem', color: '#64748b' }}>
          <div className="nut-dong-crumb">
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
          </div>

          <button className="nut-tro-ve" onClick={onBack}>
            <ArrowLeft size={15} />
            <span>Quay lại</span>
          </button>
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

              {/* Nut chuyen anh: chi hien khi co tu 2 anh */}
              {images.length > 1 && (<>
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
              </>)}
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
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
            </div>
            )}
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

            {/* 4 ô nổi bật: nhập trong quản trị, chưa nhập thì ẩn cho khỏi hiện sai */}
            <DaiNoiBat ds={product.noiBat} />

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
                    {product.description || <><strong>{product.name}</strong> — thông tin chi tiết đang được cập nhật.</>}
                  </p>
                </div>

                {/* Đặc điểm nổi bật: lấy từ dữ liệu, thiếu thì rút từ thông số */}
                {(() => {
                  const diem = product.highlights?.length
                    ? product.highlights
                    : Object.values(product.specs || {}).slice(0, 4);
                  if (!diem.length) return null;
                  return (
                    <div className="pd-diem">
                      <h4>Đặc điểm nổi bật</h4>
                      <ul>
                        {diem.map((d, i) => (
                          <li key={i}>
                            <Check size={14} strokeWidth={3} />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
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

              {Object.keys(product.specs || {}).length > 0 ? (
                <dl className="pd-ts">
                  {Object.entries(product.specs).map(([khoa, giaTri]) => (
                    <div key={khoa} className="pd-ts-o">
                      <dt>{doiNhan(khoa)}</dt>
                      <dd>{giaTri}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="pd-ts-trong">Sản phẩm này chưa có thông số chi tiết.</p>
              )}
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

              <ol className="pd-buoc">
                {huongDan.map((noiDung, i) => (
                  <li key={i}>
                    <span className="pd-buoc-so">{i + 1}</span>
                    <div>
                      <strong>Bước {i + 1}</strong>
                      <p>{noiDung}</p>
                    </div>
                  </li>
                ))}
              </ol>
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

              <div className="pd-camket">
                <div className="pd-camket-o">
                  <div className="pd-camket-icon"><ShieldCheck size={20} /></div>
                  <div className="pd-camket-tt">
                    <strong>Bảo hành {baoHanh.thoiGian}</strong>
                    <p>Chính hãng tại tất cả trung tâm bảo hành trên toàn quốc</p>
                  </div>
                </div>
                <div className="pd-camket-o">
                  <div className="pd-camket-icon"><RotateCcw size={20} /></div>
                  <div className="pd-camket-tt">
                    <strong>{baoHanh.doiTra}</strong>
                    <p>Áp dụng khi lỗi phần cứng từ nhà sản xuất</p>
                  </div>
                </div>
                <div className="pd-camket-o">
                  <div className="pd-camket-icon"><Headphones size={20} /></div>
                  <div className="pd-camket-tt">
                    <strong>Hỗ trợ kỹ thuật</strong>
                    <p>
                      Gọi <a href="tel:0987654321">0987 654 321</a><br />
                      Phục vụ 8:00 - 22:00 hàng ngày
                    </p>
                  </div>
                </div>
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

          {/* Chay ngang: vuot tay tren dien thoai, truot ngang tren may tinh */}
          <div className="rel-track">
            {displayRelated.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                index={99}
                onViewDetails={onSelectProduct}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
