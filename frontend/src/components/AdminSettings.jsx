import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, RotateCcw } from 'lucide-react';
import { api } from '../utils/api';
import { nenAnhFile, coFile } from '../utils/anh';

// phan = 'ticker' | 'banner' | 'lien-he': mỗi mục trong menu quản trị chỉ hiện đúng phần của nó.
// Lưu thanh chạy / banner không gửi lienHe nên máy chủ giữ nguyên số liên hệ cũ.
export default function AdminSettings({ onBao, phan }) {
  const [ticker, setTicker] = useState([]);
  const [banner, setBanner] = useState(null);
  const [lienHe, setLienHe] = useState({ dienThoai: '', zalo: '' });
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then((s) => { setTicker(s.ticker || []); setBanner(s.banner || null); setLienHe(s.lienHe || { dienThoai: '', zalo: '' }); })
      .catch(() => onBao('Không tải được cài đặt', 'error'))
      .finally(() => setDangTai(false));
  }, []);

  const luu = async (duLieu) => {
    setDangLuu(true);
    try {
      const kq = await api.saveSettings(duLieu);
      setTicker(kq.ticker || []);
      setBanner(kq.banner || null);
      if (kq.lienHe) setLienHe(kq.lienHe);
      onBao('Đã lưu');
    } catch (err) {
      onBao(err.message, 'error');
    } finally {
      setDangLuu(false);
    }
  };

  const chonBanner = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 40 * 1024 * 1024) {
      onBao(`Ảnh quá lớn (${coFile(file.size)}). Chọn ảnh nhỏ hơn 40MB.`, 'error');
      return;
    }
    try {
      // Nén ngay trên máy trước khi gửi lên
      const goi = await nenAnhFile(file);
      if (goi.size > 6 * 1024 * 1024) {
        onBao('Ảnh quá nặng, chọn ảnh khác', 'error');
        return;
      }
      const { url } = await api.taiAnhLen(goi, 'banner');
      await luu({ ticker, banner: url });
    } catch (err) {
      onBao(err.message, 'error');
    }
  };

  if (dangTai) return <p className="adm-trong">Đang tải…</p>;

  return (
    <div className="adm-caidat">
      {/* ===== Nút gọi & Zalo nổi ở góc dưới phải trang khách ===== */}
      {phan === 'lien-he' && (
      <section>
        <p className="adm-ghichu">
          Hai nút tròn ở góc dưới bên phải trang web. Khách bấm nút xanh lá để gọi, nút Zalo để nhắn tin.
          Để trống ô nào thì nút đó ẩn.
        </p>
        <label className="adm-lien-he">
          <span>Số điện thoại (nút Gọi)</span>
          <input
            inputMode="tel"
            value={lienHe.dienThoai}
            onChange={(e) => setLienHe({ ...lienHe, dienThoai: e.target.value })}
            placeholder="VD: 0987654321"
          />
        </label>
        <label className="adm-lien-he">
          <span>Số Zalo (nút Zalo)</span>
          <input
            inputMode="tel"
            value={lienHe.zalo}
            onChange={(e) => setLienHe({ ...lienHe, zalo: e.target.value })}
            placeholder="VD: 0368338988"
          />
        </label>
        <div className="adm-caidat-nut">
          <button className="btn-primary" disabled={dangLuu} onClick={() => luu({ ticker, banner, lienHe })}>
            {dangLuu ? 'Đang lưu…' : 'Lưu số liên hệ'}
          </button>
        </div>
      </section>
      )}

      {/* ===== Thanh chạy ===== */}
      {phan === 'ticker' && (
      <section>
        <p className="adm-ghichu">Mỗi dòng là một thông báo, chạy lần lượt trên trang chủ.</p>

        {ticker.map((dong, i) => (
          <div key={i} className="adm-dong-ticker">
            <input
              value={dong}
              onChange={(e) => {
                const moi = [...ticker];
                moi[i] = e.target.value;
                setTicker(moi);
              }}
              placeholder="Nội dung thông báo"
            />
            <button onClick={() => setTicker(ticker.filter((_, j) => j !== i))}
              title="Xóa dòng" className="xoa"><Trash2 size={15} /></button>
          </div>
        ))}

        <div className="adm-caidat-nut">
          <button onClick={() => setTicker([...ticker, ''])}>
            <Plus size={15} /> Thêm dòng
          </button>
          <button className="btn-primary" disabled={dangLuu}
            onClick={() => luu({ ticker: ticker.filter((t) => t.trim()), banner })}>
            {dangLuu ? 'Đang lưu…' : 'Lưu thanh chạy'}
          </button>
        </div>
      </section>
      )}

      {/* ===== Ảnh banner ===== */}
      {phan === 'banner' && (
      <section>
        <p className="adm-ghichu">
          Dùng ảnh ngang, tỉ lệ khoảng 1024×317, dưới 400KB.
        </p>

        <div className="adm-banner-xem">
          <img src={banner || '/images/banner_hero_1024.jpg'} alt="Banner hiện tại" />
          {!banner && <span className="adm-banner-nhan">Đang dùng ảnh mặc định</span>}
        </div>

        <div className="adm-caidat-nut">
          <label className="adm-btn-tai">
            <Upload size={15} /> Chọn ảnh banner
            <input type="file" accept="image/*" onChange={chonBanner} hidden />
          </label>
          {banner && (
            <button onClick={() => luu({ ticker, banner: null })} disabled={dangLuu}>
              <RotateCcw size={15} /> Về ảnh mặc định
            </button>
          )}
        </div>
      </section>
      )}
    </div>
  );
}
