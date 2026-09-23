import React, { useState, useEffect } from 'react';

// Ảnh đại diện của ô danh mục tự đảo: cứ vài giây lại sang ảnh chính của sản phẩm tiếp theo.
// Chỉ lấy ảnh đại diện (ảnh đầu tiên) của mỗi sản phẩm, không lấy ảnh phụ.
const GIAY = 3;

export const anhChinh = (sp) => sp?.image || sp?.images?.[0] || '';

// Gom ảnh đại diện theo danh mục: { 'Tất cả': [...], 'Thiết bị mạng': [...] }
export const gomAnhTheoDanhMuc = (ds = []) => {
  const gom = { 'Tất cả': [] };
  ds.forEach((sp) => {
    const a = anhChinh(sp);
    if (!a) return;
    gom['Tất cả'].push(a);
    (gom[sp.category] ||= []).push(a);
  });
  return gom;
};

// ds = danh sách ảnh. lech = để mỗi ô đổi lệch nhau cho đỡ nhấp nháy cùng lúc.
export function AnhChay({ ds = [], macDinh, alt = '', className, style }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (ds.length < 2) return;
    const hen = setInterval(() => setI((c) => (c + 1) % ds.length), GIAY * 1000);
    return () => clearInterval(hen);
  }, [ds.length]);

  // Danh mục chưa có hàng thì dùng ảnh minh họa sẵn có
  const src = ds.length ? ds[i % ds.length] : macDinh;
  if (!src) return null;

  return (
    <img
      key={src}
      src={src}
      alt={alt}
      loading="lazy"
      className={`anh-chay${className ? ' ' + className : ''}`}
      style={style}
      onError={(e) => { e.currentTarget.hidden = true; }}
    />
  );
}
