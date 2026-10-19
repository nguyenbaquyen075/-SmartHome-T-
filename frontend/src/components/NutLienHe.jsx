import React, { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { api } from '../utils/api';

// Hai nút tròn nổi ở góc dưới phải: Gọi điện (tel:) và nhắn Zalo (zalo.me/<số>).
// Số lấy từ Quản trị > Nút gọi & Zalo; ô nào để trống thì nút đó ẩn.
export default function NutLienHe() {
  const [lienHe, setLienHe] = useState(null);

  useEffect(() => {
    api.getSettings().then((s) => setLienHe(s.lienHe || null)).catch(() => {});
  }, []);

  const dienThoai = (lienHe?.dienThoai || '').replace(/[^\d+]/g, '');
  const zalo = (lienHe?.zalo || '').replace(/\D/g, '');
  if (!dienThoai && !zalo) return null;

  return (
    <div className="nut-lien-he">
      {zalo && (
        <a
          className="nut-lien-he-zalo"
          href={`https://zalo.me/${zalo}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Nhắn Zalo ${zalo}`}
          title="Nhắn tin Zalo"
        >
          <img src="/images/zalo-logo-moi.png" alt="Zalo" width="52" height="52" />
        </a>
      )}
      {dienThoai && (
        <a className="nut-lien-he-goi" href={`tel:${dienThoai}`} aria-label={`Gọi ${dienThoai}`} title="Gọi ngay">
          <Phone size={24} fill="currentColor" strokeWidth={1.5} />
        </a>
      )}
    </div>
  );
}
