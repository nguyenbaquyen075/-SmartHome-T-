import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Pencil, Pin, PinOff, X, Play, Camera, HardDrive, Cloud } from 'lucide-react';
import { api, anhNho, ngayVN } from '../utils/api';

// Giới hạn của gói Cloudinary miễn phí (lưu trên máy cũng dùng luôn cho đơn giản)
const TOI_DA = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024 };
const homNay = () => new Date().toLocaleDateString('sv-SE');   // "2026-09-15" theo giờ máy

// Ảnh/video trong khung 9:16. Video không có ảnh bìa thì hiện khung hình đầu của chính video
function KhungXem({ m }) {
  const bia = anhNho(m, 300, 16 / 9);
  return bia
    ? <img src={bia} alt="" loading="lazy" />
    : <video src={`${m.url}#t=0.1`} muted playsInline preload="metadata" />;
}

const BieuTuongLoai = ({ loai }) => (
  <span className="gtq-loai">
    {loai === 'video' ? <Play size={11} fill="#fff" /> : <Camera size={11} />}
  </span>
);

export default function AdminGiaiTri({ onBao }) {
  const [ds, setDs] = useState([]);
  const [cheDo, setCheDo] = useState(null);       // 'cloudinary' | 'may'
  const [loc, setLoc] = useState('tat-ca');       // 'tat-ca' | 'image' | 'video'
  const [cho, setCho] = useState([]);             // file đã chọn, đang chờ đăng
  const [dangDang, setDangDang] = useState(false);
  const [dangSua, setDangSua] = useState(null);   // bản nháp của bài đang sửa
  const [keoVao, setKeoVao] = useState(false);
  const inputRef = useRef(null);

  const taiDs = () => api.getGiaiTriQuanTri().then(setDs).catch((err) => onBao(err.message, 'error'));

  useEffect(() => {
    taiDs();
    api.cheDoGiaiTri().then((r) => setCheDo(r.cheDo)).catch(() => {});
  }, []);

  // ---- Chờ đăng ----
  const themFile = (files) => {
    const moi = [];
    for (const file of Array.from(files)) {
      const loai = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : null;
      if (!loai) {
        onBao(`"${file.name}" không phải ảnh hay video`, 'error');
      } else if (file.size > TOI_DA[loai]) {
        onBao(`"${file.name}" quá nặng — ${loai === 'video' ? 'video tối đa 100MB' : 'ảnh tối đa 10MB'}`, 'error');
      } else {
        moi.push({
          key: `${Date.now()}-${Math.random()}`,
          file,
          loai,
          url: URL.createObjectURL(file),   // xem trước ngay, chưa cần tải lên
          chuThich: '',
          ngay: homNay(),
          tienDo: null,
          loi: ''
        });
      }
    }
    setCho((c) => [...c, ...moi]);
  };

  const suaCho = (key, thayDoi) => setCho((c) => c.map((x) => (x.key === key ? { ...x, ...thayDoi } : x)));
  const boCho = (x) => {
    URL.revokeObjectURL(x.url);
    setCho((c) => c.filter((y) => y.key !== x.key));
  };
  const boHet = () => {
    cho.forEach((x) => URL.revokeObjectURL(x.url));
    setCho([]);
  };

  // Đăng lần lượt từng file; file lỗi ở lại hàng chờ kèm lý do để đăng lại
  const dangTatCa = async () => {
    setDangDang(true);
    let xong = 0;
    for (const x of cho) {
      suaCho(x.key, { tienDo: 0, loi: '' });
      try {
        await api.taiLenGiaiTri(x.file, { chuThich: x.chuThich, ngay: x.ngay }, (p) => suaCho(x.key, { tienDo: p }));
        boCho(x);
        xong++;
      } catch (err) {
        suaCho(x.key, { tienDo: null, loi: err.message });
      }
    }
    setDangDang(false);
    if (xong) {
      onBao(`Đã đăng ${xong} bài`);
      taiDs();
    }
  };

  // ---- Đã đăng ----
  const luuBai = async (bai, thongBao) => {
    try {
      await api.suaGiaiTri(bai);
      onBao(thongBao);
      setDangSua(null);
      taiDs();
    } catch (err) {
      onBao(err.message, 'error');
    }
  };

  const xoa = async (m) => {
    if (!window.confirm(`Xóa ${m.loai === 'video' ? 'video' : 'ảnh'} này? Khách sẽ không xem được nữa.`)) return;
    try {
      await api.xoaGiaiTri(m.id, m.loai);
      onBao('Đã xóa');
      taiDs();
    } catch (err) {
      onBao(err.message, 'error');
    }
  };

  const soAnh = ds.filter((m) => m.loai === 'image').length;
  const hien = loc === 'tat-ca' ? ds : ds.filter((m) => m.loai === loc);

  return (
    <div>
      <div className="qt-tieude">
        <div>
          <h1>Hậu trường thi công</h1>
          <p>Ảnh, video hậu trường thi công. Đăng lên là khách xem được ngay ở trang chủ, bài ghim luôn nằm đầu.</p>
        </div>
        {cheDo && (
          <span
            className={`gtq-luu ${cheDo}`}
            title={cheDo === 'may' ? 'Chưa cấu hình CLOUDINARY_URL: file nằm trên máy này, deploy lên Render sẽ mất' : ''}
          >
            {cheDo === 'cloudinary'
              ? <><Cloud size={13} /> Lưu trên Cloudinary</>
              : <><HardDrive size={13} /> Lưu trên máy (chạy thử)</>}
          </span>
        )}
      </div>

      {/* Vùng kéo thả */}
      <div
        className={`gtq-tha${keoVao ? ' keo' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setKeoVao(true); }}
        onDragLeave={() => setKeoVao(false)}
        onDrop={(e) => { e.preventDefault(); setKeoVao(false); themFile(e.dataTransfer.files); }}
      >
        <Upload size={30} />
        <strong>Kéo thả ảnh, video vào đây</strong>
        <small>hoặc bấm để chọn — chọn được nhiều file một lúc · ảnh ≤ 10MB · video ≤ 100MB</small>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => { themFile(e.target.files); e.target.value = ''; }}
      />

      {cho.length > 0 && (
        <section className="gtq-muc">
          <div className="gtq-muc-dau">
            <h3>Chờ đăng ({cho.length})</h3>
            <div className="gtq-muc-nut">
              <button className="adm-btn-tai" onClick={boHet} disabled={dangDang}>Bỏ hết</button>
              <button className="gtq-dang" onClick={dangTatCa} disabled={dangDang}>
                {dangDang ? 'Đang đăng…' : `Đăng ${cho.length} bài`}
              </button>
            </div>
          </div>

          <div className="gtq-luoi">
            {cho.map((x) => (
              <div key={x.key} className="gtq-o">
                <div className="gtq-the">
                  <KhungXem m={x} />
                  <BieuTuongLoai loai={x.loai} />
                  {!dangDang && (
                    <button className="gtq-bo" onClick={() => boCho(x)} aria-label="Bỏ file này">
                      <X size={14} />
                    </button>
                  )}
                  {x.tienDo !== null && (
                    <div className="gtq-tien">
                      <div style={{ width: `${x.tienDo}%` }} />
                      <span>{x.tienDo}%</span>
                    </div>
                  )}
                </div>
                <textarea
                  className="gtq-nhap"
                  rows={2}
                  maxLength={300}
                  placeholder="Chú thích vui…"
                  value={x.chuThich}
                  disabled={dangDang}
                  onChange={(e) => suaCho(x.key, { chuThich: e.target.value })}
                />
                <input
                  className="gtq-nhap"
                  type="date"
                  value={x.ngay}
                  disabled={dangDang}
                  onChange={(e) => suaCho(x.key, { ngay: e.target.value })}
                />
                {x.loi && <p className="gtq-loi">{x.loi}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="gtq-muc">
        <div className="gtq-muc-dau">
          <h3>Đã đăng</h3>
          <div className="gtq-loc">
            {[
              ['tat-ca', `Tất cả ${ds.length}`],
              ['image', `Ảnh ${soAnh}`],
              ['video', `Video ${ds.length - soAnh}`]
            ].map(([k, nhan]) => (
              <button key={k} className={`gtq-chip${loc === k ? ' on' : ''}`} onClick={() => setLoc(k)}>
                {nhan}
              </button>
            ))}
          </div>
        </div>

        {hien.length === 0 ? (
          <p className="adm-trong">Chưa có bài nào</p>
        ) : (
          <div className="gtq-luoi">
            {hien.map((m) => (
              <div key={m.id} className="gtq-o">
                <div className="gtq-the">
                  <KhungXem m={m} />
                  {m.ghim && <span className="gtq-ghim"><Pin size={10} /> Ghim</span>}
                  <BieuTuongLoai loai={m.loai} />
                  <div className="gtq-the-chu">
                    {m.chuThich || <i>Không có chú thích</i>}
                    <span>{ngayVN(m.ngay)}</span>
                  </div>
                </div>
                <div className="gtq-nut">
                  <button
                    onClick={() => luuBai({ ...m, ghim: !m.ghim }, m.ghim ? 'Đã bỏ ghim' : 'Đã ghim lên đầu')}
                    title={m.ghim ? 'Bỏ ghim' : 'Ghim lên đầu'}
                    className={m.ghim ? 'on' : ''}
                  >
                    {m.ghim ? <PinOff size={15} /> : <Pin size={15} />}
                  </button>
                  <button onClick={() => setDangSua({ ...m })} title="Sửa"><Pencil size={15} /></button>
                  <button onClick={() => xoa(m)} title="Xóa" className="xoa"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {dangSua && (
        <div className="modal-overlay" onClick={() => setDangSua(null)}>
          <form
            className="gtq-sua"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); luuBai(dangSua, 'Đã lưu thay đổi'); }}
          >
            <div className="gtq-the">
              <KhungXem m={dangSua} />
              <BieuTuongLoai loai={dangSua.loai} />
            </div>

            <div className="gtq-sua-form">
              <div className="adm-form-head">
                <strong>Sửa bài</strong>
                <button type="button" onClick={() => setDangSua(null)} aria-label="Đóng"><X size={18} /></button>
              </div>

              <label className="adm-mota" style={{ marginTop: 0 }}>
                <span>Chú thích</span>
                <textarea
                  rows={4}
                  maxLength={300}
                  value={dangSua.chuThich}
                  onChange={(e) => setDangSua({ ...dangSua, chuThich: e.target.value })}
                  placeholder="Chú thích vui…"
                />
              </label>

              <div className="adm-grid" style={{ marginTop: '12px' }}>
                <label>
                  <span>Ngày</span>
                  <input
                    type="date"
                    value={dangSua.ngay}
                    onChange={(e) => setDangSua({ ...dangSua, ngay: e.target.value })}
                  />
                </label>
              </div>

              <label className="gtq-check">
                <input
                  type="checkbox"
                  checked={dangSua.ghim}
                  onChange={(e) => setDangSua({ ...dangSua, ghim: e.target.checked })}
                />
                Ghim lên đầu
              </label>

              <div className="adm-form-foot">
                <button type="button" onClick={() => setDangSua(null)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
