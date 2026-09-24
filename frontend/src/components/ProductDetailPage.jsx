import React, { useState, useEffect } from 'react';
import {
  Home,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Heart,
  Share2,
  SlidersHorizontal,
  Check,
  CircleCheck,
} from 'lucide-react';
import ProductCard from './ProductCard';
import { doiNhan, DaiNoiBat } from '../utils/sanPham';

export default function ProductDetailPage({
  product,
  allProducts = [],
  onBack,
  onSelectProduct
}) {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const images = product?.images?.length ? product.images : [product?.image].filter(Boolean);
  const hasIntro = Boolean(product?.description?.trim() || product?.highlights?.length);

  // Chỉ hiện những gì đã nhập. Sản phẩm cũ chưa có thongTin thì dựng từ dữ liệu cũ, không chèn nội dung mặc định.
  const baoHanh = [
    product?.baoHanh?.thoiGian && `Bảo hành: ${product.baoHanh.thoiGian}`,
    product?.baoHanh?.doiTra && `Đổi trả: ${product.baoHanh.doiTra}`
  ].filter(Boolean);
  const thongTin = product?.thongTin?.length ? product.thongTin : [
    Object.keys(product?.specs || {}).length && {
      tieuDe: 'Thông số kỹ thuật',
      noiDung: Object.entries(product.specs).map(([khoa, giaTri]) => `${doiNhan(khoa)}: ${giaTri}`)
    },
    product?.huongDan?.length && { tieuDe: 'Hướng dẫn cài đặt & sử dụng', noiDung: product.huongDan },
    baoHanh.length && { tieuDe: 'Bảo hành & đổi trả', noiDung: baoHanh }
  ].filter(Boolean);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedImgIdx(0);
  }, [product?.id]);

  if (!product) return null;

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

            {product.subTitle && (
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '14px' }}>
                {product.subTitle}
              </p>
            )}

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
        {/* 3. NỘI DUNG SẢN PHẨM (GIỚI THIỆU + CÁC MỤC THÔNG TIN)                     */}
        {/* ========================================================================= */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          marginBottom: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {/* Nội dung */}
          <div style={{ padding: '28px 24px' }}>
            {/* Giới thiệu tổng quan cũ (nếu có) */}
            {hasIntro && (
              <>
                <section id="sec-intro" style={{ marginBottom: '36px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <CircleCheck size={20} color="#0066cc" aria-hidden="true" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                      Giới thiệu tổng quan & Thiết kế
                    </h2>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
                    gap: '28px',
                    alignItems: 'start'
                  }}>
                    {product.description && (
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
                          {product.description}
                        </p>
                      </div>
                    )}

                    {product.highlights?.length > 0 && (
                      <div className="pd-diem">
                        <h4>Đặc điểm nổi bật</h4>
                        <ul>
                          {product.highlights.map((d, i) => (
                            <li key={i}>
                              <Check size={14} strokeWidth={3} />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
                {thongTin.length > 0 && (
                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '30px 0' }} />
                )}
              </>
            )}

            {/* Các mục tiêu đề lớn của Thông tin sản phẩm */}
            {thongTin.map((muc, i) => (
              <section
                key={`${muc.tieuDe}-${i}`}
                id={`sec-info-${i}`}
                style={{
                  marginBottom: i === thongTin.length - 1 ? 0 : '36px',
                  paddingBottom: i === thongTin.length - 1 ? 0 : '24px',
                  borderBottom: i === thongTin.length - 1 ? 'none' : '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <CircleCheck size={20} color="#0066cc" aria-hidden="true" />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                    {muc.tieuDe}
                  </h2>
                </div>
                <div className="pd-diem">
                  <ul>
                    {muc.noiDung.map((noiDung, j) => (
                      <li key={j}>
                        <Check size={14} strokeWidth={3} />
                        <span>{noiDung}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}

            {!hasIntro && thongTin.length === 0 && (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0', fontSize: '0.92rem' }}>
                Thông tin chi tiết về sản phẩm đang được cập nhật.
              </div>
            )}
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
