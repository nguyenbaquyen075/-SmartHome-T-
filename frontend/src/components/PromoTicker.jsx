import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

// Sửa nội dung chạy ở đây. Thêm/bớt dòng tuỳ ý, thanh tự chạy lại cho khớp.
const MESSAGES = [
  '🔧 LẮP ĐẶT TẬN NƠI - MIỄN PHÍ KHẢO SÁT & TƯ VẤN',
  '🛡️ BẢO HÀNH CHÍNH HÃNG 24 THÁNG - 1 ĐỔI 1 TRONG 15 NGÀY',
  '📞 HOTLINE 24/7: 0987 654 321 - ZALO: 0368.338.988',
  '⚡ THI CÔNG ĐIỆN NƯỚC - CAMERA - MẠNG TRỌN GÓI'
];

export default function PromoTicker() {
  // Noi dung sua duoc trong trang quan tri; loi thi dung danh sach mac dinh duoi
  const [MESSAGES_LIVE, setMessages] = useState(MESSAGES);
  useEffect(() => {
    api.getSettings()
      .then((s) => { if (s.ticker?.length) setMessages(s.ticker); })
      .catch(() => {});
  }, []);
  // Lặp 2 lần để khi bản đầu chạy hết thì bản sau đã nối liền, không bị hụt
  const row = (
    <div className="ticker-row" aria-hidden="false">
      {MESSAGES_LIVE.map((m) => (
        <React.Fragment key={m}>
          <span className="ticker-item">{m}</span>
          <span className="ticker-dot">•</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="ticker">
      <div className="ticker-track">
        {row}
        {/* bản sao chỉ để chạy liền mạch, trình đọc màn hình bỏ qua */}
        <div className="ticker-row" aria-hidden="true">
          {MESSAGES_LIVE.map((m) => (
            <React.Fragment key={m}>
              <span className="ticker-item">{m}</span>
              <span className="ticker-dot">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
