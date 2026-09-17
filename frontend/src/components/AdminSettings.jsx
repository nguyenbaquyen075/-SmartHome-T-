import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, RotateCcw } from 'lucide-react';
import { api } from '../utils/api';

// phan = 'ticker' | 'banner': mỗi mục trong menu quản trị chỉ hiện đúng phần của nó.
// Lưu vẫn gửi cả 2 giá trị để không làm mất phần kia.
export default function AdminSettings({ onBao, phan }) {
  const [ticker, setTicker] = useState([]);
  const [banner, setBanner] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then((s) => { setTicker(s.ticker || []); setBanner(s.banner || null); })
      .catch(() => onBao('Không tải được cài đặt', 'error'))
      .finally(() => setDangTai(false));
  }, []);

  const luu = async (duLieu) => {
    setDangLuu(true);
    try {
      const kq = await api.saveSettings(duLieu);
      setTicker(kq.ticker || []);
      setBanner(kq.banner || null);
      onBao('Đã lưu, tải lại trang chủ là thấy');
    } catch (err) {
      onBao(err.message, 'error');
    } finally {
      setDangLuu(false);
    }
  };

  const chonBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      onBao('Ảnh quá nặng (tối đa 6MB). Nén bớt rồi tải lại.', 'error');
      return;
    }
    const doc = new FileReader();
    doc.onload = async () => {
      try {
        const { url } = await api.uploadImage(doc.result, 'banner');
        await luu({ ticker, banner: url });
      } catch (err) {
        onBao(err.message, 'error');
      }
    };
    doc.readAsDataURL(file);
  };

  if (dangTai) return <p className="adm-trong">Đang tải…</p>;

  return (
    <div className="adm-caidat">
      {/* ===== Thanh chạy ===== */}
      {phan !== 'banner' && (
      <section>
        <p className="adm-ghichu">Mỗi dòng là một thông điệp, chạy vòng liên tục ở trang chủ.</p>

        {ticker.map((dong, i) => (
          <div key={i} className="adm-dong-ticker">
            <input
              value={dong}
              onChange={(e) => {
                const moi = [...ticker];
                moi[i] = e.target.value;
                setTicker(moi);
              }}
              placeholder="VD: 🔧 LẮP ĐẶT TẬN NƠI - MIỄN PHÍ KHẢO SÁT"
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
      {phan !== 'ticker' && (
      <section>
        <p className="adm-ghichu">
          Nên dùng ảnh ngang tỉ lệ khoảng 1024×317. Ảnh càng nặng trang càng chậm —
          nén xuống dưới 400KB trước khi tải lên.
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
