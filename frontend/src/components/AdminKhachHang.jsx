import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Search, Phone, MapPin, ImagePlus } from 'lucide-react';
import { api } from '../utils/api';
import { useLuiVe } from '../utils/luiVe';

// Khách hàng: danh sách khách, mỗi khách có các thiết bị đã lắp đặt kèm hạn bảo hành (tự tính từ ngày lắp + số tháng).
const pad = (n) => String(n).padStart(2, '0');
const homNay = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const ngayVN = (iso) => iso.split('-').reverse().join('/');
const utc = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const soNgayCach = (a, b) => Math.round((utc(a) - utc(b)) / 864e5);

// Cộng n tháng vào ngày; tháng đích ngắn hơn thì lấy ngày cuối tháng (31/01 + 1 tháng = 28/02)
const themThang = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dich = new Date(y, m - 1 + n, 1);
  const cuoi = new Date(dich.getFullYear(), dich.getMonth() + 1, 0).getDate();
  return `${dich.getFullYear()}-${pad(dich.getMonth() + 1)}-${pad(Math.min(d, cuoi))}`;
};
const hanBH = (tb) => (tb.baoHanhThang > 0 ? themThang(tb.ngayLapDat, tb.baoHanhThang) : null);

// con = còn bảo hành, sap = sắp hết (30 ngày tới), het = hết hạn, khong = không bảo hành
const tinhTrang = (tb) => {
  const han = hanBH(tb);
  if (!han) return { k: 'khong', chu: 'Không bảo hành', han: null };
  const con = soNgayCach(han, homNay());
  if (con < 0) return { k: 'het', chu: `Hết hạn ${-con} ngày`, han, con };
  if (con <= 30) return { k: 'sap', chu: con === 0 ? 'Hết hạn hôm nay' : `Còn ${con} ngày`, han, con };
  return { k: 'con', chu: 'Còn bảo hành', han, con };
};

const chuCai = (ten) => ten.trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase();
const demTrangThai = (k) => {
  const r = { con: 0, sap: 0, het: 0, khong: 0 };
  (k.thietBi || []).forEach((t) => { r[tinhTrang(t).k] += 1; });
  return r;
};

// Thu nhỏ ảnh trước khi tải lên (tối đa 1000px, JPEG 70%): vẫn đọc rõ tem mã nhưng nhẹ gấp 3-4 lần, kho đỡ phình
const TOI_DA_CANH = 1000;
const CHAT_LUONG = 0.7;
const TOI_DA_ANH = 4;   // số ảnh tối đa cho mỗi thiết bị (khớp với server)
const nenAnh = (file) => new Promise((xong) => {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const t = Math.min(1, TOI_DA_CANH / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * t);
    c.height = Math.round(img.height * t);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    c.toBlob((b) => { URL.revokeObjectURL(url); xong(b ? { blob: b, ten: 'anh.jpg' } : { blob: file, ten: file.name }); }, 'image/jpeg', CHAT_LUONG);
  };
  img.onerror = () => { URL.revokeObjectURL(url); xong({ blob: file, ten: file.name }); };
  img.src = url;
});

// Ảnh thiết bị xem phải đăng nhập: tải bằng token rồi hiện, nhớ lại để khỏi tải lại
const boNhoAnh = new Map();
const layUrlAnh = (aid) => {
  if (!boNhoAnh.has(aid)) boNhoAnh.set(aid, api.layAnhKhach(aid).then((b) => URL.createObjectURL(b)).catch(() => { boNhoAnh.delete(aid); return ''; }));
  return boNhoAnh.get(aid);
};
function AnhKH({ id, onMo }) {
  const [url, setUrl] = useState('');
  useEffect(() => { let con = true; layUrlAnh(id).then((u) => con && setUrl(u)); return () => { con = false; }; }, [id]);
  return url
    ? <button type="button" className="kh-anh" onClick={() => onMo(url)}><img src={url} alt="Ảnh thiết bị" /></button>
    : <span className="kh-anh cho" />;
}
function XemAnh({ url, onDong }) {
  useEffect(() => {
    const phim = (e) => e.key === 'Escape' && onDong();
    window.addEventListener('keydown', phim);
    return () => window.removeEventListener('keydown', phim);
  }, [onDong]);
  return (
    <div className="kh-xem" onClick={onDong}>
      <button type="button" onClick={onDong} aria-label="Đóng"><X size={24} /></button>
      <img src={url} alt="Ảnh thiết bị" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

function Chip({ tt }) {
  return <span className={`kh-chip ${tt.k}`}>{tt.chu}</span>;
}

function HopForm({ tieuDe, onDong, onLuu, children, nhanLuu = 'Lưu' }) {
  const [dang, setDang] = useState(false);
  return (
    <div className="cc-nen" onClick={onDong}>
      <form className="cc-hop kh-hop" onClick={(e) => e.stopPropagation()}
        onSubmit={async (e) => { e.preventDefault(); setDang(true); await onLuu(); setDang(false); }}>
        <div className="cc-hop-dau">
          <h2>{tieuDe}</h2>
          <button type="button" onClick={onDong} aria-label="Đóng"><X size={20} /></button>
        </div>
        {children}
        <div className="cc-hop-nut">
          <button type="button" className="cc-phu" onClick={onDong}>Hủy</button>
          <button type="submit" className="cc-chinh" disabled={dang}>{dang ? 'Đang lưu…' : nhanLuu}</button>
        </div>
      </form>
    </div>
  );
}

// Thêm khách: nhập luôn các sản phẩm đã lắp (tên máy, mã, ảnh) để sau này kiểm tra. Sửa khách chỉ sửa thông tin liên hệ.
const sanPhamTrong = () => ({ key: `${Date.now()}-${Math.random()}`, ten: '', ma: '', ngayLapDat: homNay(), baoHanhThang: 12, anh: [] });

function FormKhach({ kh, onLuu, onDong }) {
  const [f, setF] = useState({ ten: kh?.ten || '', sdt: kh?.sdt || '', diaChi: kh?.diaChi || '' });
  const [sp, setSp] = useState(kh ? [] : [sanPhamTrong()]);
  const o = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const doiSp = (key, patch) => setSp((cu) => cu.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const chonAnh = (key, e) => {
    const cac = [...e.target.files];
    e.target.value = '';
    setSp((cu) => cu.map((x) => (x.key !== key ? x : { ...x, anh: [...x.anh, ...cac.slice(0, Math.max(0, TOI_DA_ANH - x.anh.length)).map((file) => ({ file, url: URL.createObjectURL(file) }))] })));
  };
  return (
    <HopForm tieuDe={kh ? 'Sửa khách hàng' : 'Thêm khách hàng'} onDong={onDong}
      onLuu={() => onLuu({ ...f, ghiChu: kh?.ghiChu || '' }, sp)}>
      <label>Họ tên<input autoFocus maxLength={120} placeholder="Nguyễn Văn A" {...o('ten')} /></label>
      <label>Số điện thoại<input maxLength={20} inputMode="tel" placeholder="0987 654 321" {...o('sdt')} /></label>
      <label>Địa chỉ<input maxLength={250} placeholder="Số nhà, đường, quận" {...o('diaChi')} /></label>

      {!kh && (
        <div className="kh-sp-khoi">
          <span className="kh-anh-tieu">Sản phẩm đã lắp</span>
          {sp.map((x, i) => (
            <div key={x.key} className="kh-sp">
              <div className="kh-sp-dau">
                <b>Sản phẩm {i + 1}</b>
                {sp.length > 1 && <button type="button" onClick={() => setSp((cu) => cu.filter((y) => y.key !== x.key))} aria-label="Xóa sản phẩm"><Trash2 size={15} /></button>}
              </div>
              <label>Tên máy<input maxLength={150} placeholder="Hikvision DS-2CD1123G0E-I" value={x.ten} onChange={(e) => doiSp(x.key, { ten: e.target.value })} /></label>
              <label>Mã / số seri<input maxLength={120} placeholder="Mã in trên tem máy" value={x.ma} onChange={(e) => doiSp(x.key, { ma: e.target.value })} /></label>
              <div className="kh-anh-luoi">
                {x.anh.map((a) => (
                  <div key={a.url} className="kh-anh-o">
                    <span className="kh-anh"><img src={a.url} alt="Ảnh sản phẩm" /></span>
                    <button type="button" className="kh-anh-xoa" aria-label="Bỏ ảnh" onClick={() => doiSp(x.key, { anh: x.anh.filter((y) => y.url !== a.url) })}><X size={12} /></button>
                  </div>
                ))}
                {x.anh.length < TOI_DA_ANH && (
                  <label className="kh-anh-them">
                    <input type="file" accept="image/*" multiple hidden onChange={(e) => chonAnh(x.key, e)} />
                    <ImagePlus size={20} /><span>Thêm ảnh</span>
                  </label>
                )}
              </div>
              <div className="kh-hang">
                <label>Ngày lắp<input type="date" value={x.ngayLapDat} onChange={(e) => doiSp(x.key, { ngayLapDat: e.target.value })} /></label>
                <label>Bảo hành (tháng)<input type="number" min="0" max="120" inputMode="numeric" value={x.baoHanhThang} onChange={(e) => doiSp(x.key, { baoHanhThang: e.target.value })} /></label>
              </div>
            </div>
          ))}
          <button type="button" className="kh-sp-them" onClick={() => setSp((cu) => [...cu, sanPhamTrong()])}><Plus size={16} /> Thêm sản phẩm</button>
        </div>
      )}
    </HopForm>
  );
}

const THANG_NHANH = [6, 12, 24, 36, 60];

function FormThietBi({ tb, dsCongTrinh, onLuu, onDong }) {
  const [f, setF] = useState({
    ten: tb?.ten || '', tenMay: tb?.tenMay || '', ma: tb?.ma || tb?.seri || '', soLuong: tb?.soLuong || 1, congTrinh: tb?.congTrinh || '',
    ngayLapDat: tb?.ngayLapDat || homNay(), baoHanhThang: tb?.baoHanhThang ?? 12
  });
  const [anhCu, setAnhCu] = useState(tb?.anh || []);      // ảnh đã lưu trên server
  const [daXoa, setDaXoa] = useState([]);                 // ảnh cũ bấm xóa, xóa thật khi bấm Lưu
  const [anhMoi, setAnhMoi] = useState([]);               // ảnh vừa chọn, tải lên khi bấm Lưu
  const [xem, setXem] = useState('');
  useLuiVe(Boolean(xem), () => setXem(''));
  const oFile = useRef(null);
  const o = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const han = f.ngayLapDat && Number(f.baoHanhThang) > 0 ? themThang(f.ngayLapDat, Number(f.baoHanhThang)) : null;
  const tong = anhCu.length + anhMoi.length;
  const chonAnh = (e) => {
    const cac = [...e.target.files].slice(0, Math.max(0, TOI_DA_ANH - tong));
    e.target.value = '';
    setAnhMoi((cu) => [...cu, ...cac.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };
  return (
    <HopForm tieuDe={tb ? 'Sửa thiết bị' : 'Thêm thiết bị'} onDong={onDong}
      onLuu={() => onLuu({ ...f, ghiChu: tb?.ghiChu || '', soLuong: Number(f.soLuong), baoHanhThang: Number(f.baoHanhThang) }, anhMoi.map((a) => a.file), daXoa)}>
      <label>Tên thiết bị<input autoFocus maxLength={150} placeholder="Camera, đầu ghi, máy bơm…" {...o('ten')} /></label>
      <label>Tên máy / model<input maxLength={150} placeholder="Hikvision DS-2CD1123G0E-I" {...o('tenMay')} /></label>
      <label>Mã / số seri<input maxLength={120} placeholder="Mã in trên tem máy" {...o('ma')} /></label>

      <div className="kh-anh-khoi">
        <span className="kh-anh-tieu">Ảnh thiết bị, tem mã <small>({tong}/{TOI_DA_ANH})</small></span>
        <div className="kh-anh-luoi">
          {anhCu.map((a) => (
            <div key={a.id} className="kh-anh-o">
              <AnhKH id={a.id} onMo={setXem} />
              <button type="button" className="kh-anh-xoa" aria-label="Xóa ảnh" onClick={() => { setAnhCu((cu) => cu.filter((x) => x.id !== a.id)); setDaXoa((cu) => [...cu, a.id]); }}><X size={12} /></button>
            </div>
          ))}
          {anhMoi.map((a) => (
            <div key={a.url} className="kh-anh-o">
              <button type="button" className="kh-anh" onClick={() => setXem(a.url)}><img src={a.url} alt="Ảnh mới chọn" /></button>
              <button type="button" className="kh-anh-xoa" aria-label="Bỏ ảnh" onClick={() => setAnhMoi((cu) => cu.filter((x) => x.url !== a.url))}><X size={12} /></button>
            </div>
          ))}
          {tong < TOI_DA_ANH && (
            <>
              <input ref={oFile} type="file" accept="image/*" multiple hidden onChange={chonAnh} />
              <button type="button" className="kh-anh-them" onClick={() => oFile.current?.click()}><ImagePlus size={20} /><span>Thêm ảnh</span></button>
            </>
          )}
        </div>
      </div>

      <div className="kh-hang">
        <label>Số lượng<input type="number" min="1" inputMode="numeric" {...o('soLuong')} /></label>
        <label>Ngày lắp đặt<input type="date" {...o('ngayLapDat')} /></label>
      </div>
      <label>Công trình / vị trí
        <input list="kh-ds-ct" maxLength={200} placeholder="Nhà phố 4 tầng, tầng 2…" {...o('congTrinh')} />
        <datalist id="kh-ds-ct">{dsCongTrinh.map((c) => <option key={c} value={c} />)}</datalist>
      </label>
      <label>Bảo hành (tháng)
        <input type="number" min="0" max="120" inputMode="numeric" {...o('baoHanhThang')} />
      </label>
      <div className="kh-nhanh">
        {THANG_NHANH.map((t) => (
          <button type="button" key={t} className={Number(f.baoHanhThang) === t ? 'on' : ''} onClick={() => setF({ ...f, baoHanhThang: t })}>{t} tháng</button>
        ))}
        <button type="button" className={Number(f.baoHanhThang) === 0 ? 'on' : ''} onClick={() => setF({ ...f, baoHanhThang: 0 })}>Không BH</button>
      </div>
      <p className="kh-han">{han ? <>Hết hạn bảo hành: <b>{ngayVN(han)}</b></> : 'Không bảo hành'}</p>
      {xem && <XemAnh url={xem} onDong={() => setXem('')} />}
    </HopForm>
  );
}

export default function AdminKhachHang({ onBao, diToi, con }) {
  const [ds, setDs] = useState(null);
  const [tim, setTim] = useState('');
  const [loc, setLoc] = useState('tat-ca');
  const [formKhach, setFormKhach] = useState(null);    // null | {} (thêm) | khách (sửa)
  const [formTB, setFormTB] = useState(null);          // null | {} (thêm) | thiết bị (sửa)
  const [xemAnh, setXemAnh] = useState('');             // ảnh đang phóng to
  useLuiVe(Boolean(formKhach), () => setFormKhach(null));
  useLuiVe(Boolean(formTB), () => setFormTB(null));
  useLuiVe(Boolean(xemAnh), () => setXemAnh(''));

  useEffect(() => {
    api.getKhachHang().then(setDs).catch((e) => onBao(e.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const danhSach = useMemo(() => {
    if (!ds) return [];
    const q = tim.trim().toLowerCase();
    return ds.filter((k) => {
      if (q && !`${k.ten} ${k.sdt} ${k.diaChi} ${(k.thietBi || []).map((t) => `${t.ten} ${t.tenMay || ''} ${t.ma || t.seri || ''}`).join(' ')}`.toLowerCase().includes(q)) return false;
      const d = demTrangThai(k);
      return loc === 'sap' ? d.sap > 0 : loc === 'het' ? d.het > 0 : true;
    });
  }, [ds, tim, loc]);

  if (!ds) return <p className="adm-trong">Đang tải…</p>;

  const capNhat = (moi) => setDs((cu) => cu.map((k) => (k.id === moi.id ? moi : k)));

  const luuKhach = async (f, sanPham = []) => {
    try {
      if (formKhach.id) {
        capNhat({ ...ds.find((k) => k.id === formKhach.id), ...(await api.suaKhachHang(formKhach.id, f)) });
        setFormKhach(null);
        return;
      }
      // Kiểm tra các sản phẩm trước khi tạo, để không tạo khách rồi mới báo lỗi
      const coDuLieu = sanPham.filter((x) => x.ten.trim() || x.ma.trim() || x.anh.length);
      for (const [i, x] of coDuLieu.entries()) {
        if (!x.ten.trim()) return onBao(`Nhập tên máy cho sản phẩm ${i + 1}`, 'error');
        if (!x.ngayLapDat) return onBao(`Chọn ngày lắp cho sản phẩm ${i + 1}`, 'error');
      }
      const moi = { ...(await api.themKhachHang(f)), thietBi: [] };
      for (const x of coDuLieu) {
        try {
          const tb = { ...(await api.themThietBi(moi.id, { ten: x.ten, ma: x.ma, ngayLapDat: x.ngayLapDat, baoHanhThang: Number(x.baoHanhThang), soLuong: 1 })), anh: [] };
          for (const a of x.anh) {
            try {
              const { blob, ten } = await nenAnh(a.file);
              tb.anh.push(await api.taiAnhThietBi(moi.id, tb.id, blob, ten));
            } catch (err) { onBao(err.message, 'error'); }
          }
          moi.thietBi.push(tb);
        } catch (err) { onBao(err.message, 'error'); }
      }
      setDs((cu) => [moi, ...cu]);
      setFormKhach(null);
      diToi('khach-hang', moi.id);
    } catch (err) { onBao(err.message, 'error'); }
  };

  const xoaKhach = async (k) => {
    const n = (k.thietBi || []).length;
    if (!window.confirm(`Xóa khách hàng "${k.ten}"${n ? ` và ${n} thiết bị đã ghi` : ''}?`)) return;
    try {
      await api.xoaKhachHang(k.id);
      setDs((cu) => cu.filter((x) => x.id !== k.id));
      diToi('khach-hang');
    } catch (err) { onBao(err.message, 'error'); }
  };

  const id = con?.[0];

  // ===== Chi tiết một khách hàng =====
  if (id) {
    const k = ds.find((x) => x.id === id);
    if (!k) return <p className="adm-trong">Không tìm thấy khách hàng. <a href="#/khach-hang">Về danh sách</a></p>;
    const tbs = k.thietBi || [];
    const d = demTrangThai(k);

    // Lưu thiết bị rồi xử lý ảnh (xóa ảnh đã bỏ, tải ảnh mới lên); ảnh nào lỗi thì báo nhưng không bỏ dở cả thiết bị
    const luuTB = async (f, filesMoi, daXoa) => {
      try {
        let tb;
        if (formTB.id) tb = { ...(await api.suaThietBi(k.id, formTB.id, f)), anh: formTB.anh || [] };
        else tb = { ...(await api.themThietBi(k.id, f)), anh: [] };
        for (const aid of daXoa) {
          try { await api.xoaAnhThietBi(k.id, tb.id, aid); tb.anh = tb.anh.filter((a) => a.id !== aid); } catch (err) { onBao(err.message, 'error'); }
        }
        for (const file of filesMoi) {
          try {
            const { blob, ten } = await nenAnh(file);
            tb.anh = [...tb.anh, await api.taiAnhThietBi(k.id, tb.id, blob, ten)];
          } catch (err) { onBao(err.message, 'error'); }
        }
        setDs((cu) => cu.map((x) => (x.id !== k.id ? x : { ...x, thietBi: formTB.id ? x.thietBi.map((t) => (t.id === tb.id ? tb : t)) : [...(x.thietBi || []), tb] })));
        setFormTB(null);
      } catch (err) { onBao(err.message, 'error'); }
    };
    const xoaTB = async (t) => {
      if (!window.confirm(`Xóa thiết bị "${t.ten}"?`)) return;
      try {
        await api.xoaThietBi(k.id, t.id);
        capNhat({ ...k, thietBi: tbs.filter((x) => x.id !== t.id) });
      } catch (err) { onBao(err.message, 'error'); }
    };

    // Nhóm theo công trình (công trình lắp gần nhất lên trước), trong nhóm xếp theo hạn bảo hành
    const nhom = new Map();
    [...tbs].sort((a, b) => b.ngayLapDat.localeCompare(a.ngayLapDat)).forEach((t) => {
      const ten = t.congTrinh || 'Chưa ghi công trình';
      nhom.set(ten, [...(nhom.get(ten) || []), t]);
    });
    const hanSapXep = (t) => hanBH(t) || '9999-99-99';
    const dsCongTrinh = [...new Set(tbs.map((t) => t.congTrinh).filter(Boolean))];

    return (
      <div className="cc kh">
        <a className="cc-ve" href="#/khach-hang"><ChevronLeft size={18} /> Khách hàng</a>
        <div className="cc-ho-so">
          <i className="cc-avt lon">{chuCai(k.ten)}</i>
          <div className="cc-ho-so-chu">
            <h1>{k.ten}</h1>
            <p>
              {k.sdt && <a className="kh-lien" href={`tel:${k.sdt.replace(/\s/g, '')}`}><Phone size={13} /> {k.sdt}</a>}
              {k.sdt && k.diaChi && ' · '}
              {k.diaChi && <span><MapPin size={13} /> {k.diaChi}</span>}
              {!k.sdt && !k.diaChi && 'Chưa có số điện thoại'}
            </p>
          </div>
          <div className="cc-ho-so-nut">
            <button className="cc-icon" onClick={() => setFormKhach(k)} title="Sửa" aria-label="Sửa"><Pencil size={17} /></button>
            <button className="cc-icon xoa" onClick={() => xoaKhach(k)} title="Xóa" aria-label="Xóa"><Trash2 size={17} /></button>
          </div>
        </div>
        {k.ghiChu && <p className="kh-ghi-chu">{k.ghiChu}</p>}

        <div className="cc-dai kh-dai">
          <div><b>{tbs.length}</b><span>Thiết bị</span></div>
          <div><b className="xanh">{d.con}</b><span>Còn BH</span></div>
          <div><b className="cam">{d.sap}</b><span>Sắp hết</span></div>
          <div><b className="do">{d.het}</b><span>Hết hạn</span></div>
        </div>

        <div className="kh-dau-muc">
          <h2>Thiết bị đã lắp đặt</h2>
          <button className="cc-chinh" onClick={() => setFormTB({})}><Plus size={16} /> Thêm thiết bị</button>
        </div>

        {tbs.length === 0 ? (
          <div className="cc-rong"><p>Chưa có thiết bị nào. Bấm “Thêm thiết bị” để ghi lại.</p></div>
        ) : [...nhom.entries()].map(([ct, dsTB]) => (
          <section key={ct} className="kh-nhom">
            <h3>{ct}</h3>
            {[...dsTB].sort((a, b) => hanSapXep(a).localeCompare(hanSapXep(b))).map((t) => {
              const tt = tinhTrang(t);
              return (
                <div key={t.id} className={`kh-tb ${tt.k}`}>
                  <div className="kh-tb-chu">
                    <strong>{t.ten}{t.soLuong > 1 && <em> × {t.soLuong}</em>}</strong>
                    {(t.tenMay || t.ma || t.seri) && (
                      <small className="kh-may">{[t.tenMay && `Máy: ${t.tenMay}`, (t.ma || t.seri) && `Mã: ${t.ma || t.seri}`].filter(Boolean).join(' · ')}</small>
                    )}
                    <small>Lắp ngày {ngayVN(t.ngayLapDat)}{tt.han ? ` · BH ${t.baoHanhThang} tháng, đến ${ngayVN(tt.han)}` : ''}</small>
                    {t.ghiChu && <small className="kh-phu">{t.ghiChu}</small>}
                    {(t.anh || []).length > 0 && <div className="kh-anh-luoi nho">{t.anh.map((a) => <AnhKH key={a.id} id={a.id} onMo={setXemAnh} />)}</div>}
                  </div>
                  <Chip tt={tt} />
                  <div className="kh-tb-nut">
                    <button onClick={() => setFormTB(t)} aria-label="Sửa thiết bị"><Pencil size={15} /></button>
                    <button className="xoa" onClick={() => xoaTB(t)} aria-label="Xóa thiết bị"><Trash2 size={15} /></button>
                  </div>
                </div>
              );
            })}
          </section>
        ))}

        {xemAnh && <XemAnh url={xemAnh} onDong={() => setXemAnh('')} />}
        {formKhach && <FormKhach kh={formKhach.id ? formKhach : null} onLuu={luuKhach} onDong={() => setFormKhach(null)} />}
        {formTB && <FormThietBi tb={formTB.id ? formTB : null} dsCongTrinh={dsCongTrinh} onLuu={luuTB} onDong={() => setFormTB(null)} />}
      </div>
    );
  }

  // ===== Danh sách khách hàng =====
  const tong = ds.reduce((a, k) => { const d = demTrangThai(k); return { sap: a.sap + (d.sap > 0 ? 1 : 0), het: a.het + (d.het > 0 ? 1 : 0) }; }, { sap: 0, het: 0 });
  return (
    <div className="cc kh">
      <div className="cc-tieude">
        <h1>Khách hàng</h1>
        <button className="cc-chinh" onClick={() => setFormKhach({})}><Plus size={16} /> Thêm khách</button>
      </div>

      <div className="kh-tim">
        <Search size={16} />
        <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder="Tìm tên khách, số điện thoại, tên máy, mã…" />
        {tim && <button onClick={() => setTim('')} aria-label="Xóa tìm kiếm"><X size={14} /></button>}
      </div>
      <div className="kh-loc">
        <button className={loc === 'tat-ca' ? 'on' : ''} onClick={() => setLoc('tat-ca')}>Tất cả ({ds.length})</button>
        <button className={`cam${loc === 'sap' ? ' on' : ''}`} onClick={() => setLoc('sap')}>Sắp hết bảo hành ({tong.sap})</button>
        <button className={`do${loc === 'het' ? ' on' : ''}`} onClick={() => setLoc('het')}>Hết hạn ({tong.het})</button>
      </div>

      {ds.length === 0 ? (
        <div className="cc-rong"><p>Chưa có khách hàng. Bấm “Thêm khách” để bắt đầu ghi lại.</p></div>
      ) : danhSach.length === 0 ? (
        <div className="cc-rong"><p>Không có khách nào khớp.</p></div>
      ) : (
        <div className="cc-ds">
          {danhSach.map((k) => {
            const d = demTrangThai(k);
            return (
              <button key={k.id} className="cc-nv" onClick={() => diToi('khach-hang', k.id)}>
                <i className="cc-avt">{chuCai(k.ten)}</i>
                <span className="cc-nv-chu">
                  <strong>{k.ten}</strong>
                  <small>{[k.sdt, k.diaChi].filter(Boolean).join(' · ') || 'Chưa có liên hệ'}</small>
                </span>
                <span className="cc-nv-so">
                  <b>{(k.thietBi || []).length} thiết bị</b>
                  <span className="kh-huy">
                    {d.het > 0 && <span className="kh-chip het">{d.het} hết hạn</span>}
                    {d.sap > 0 && <span className="kh-chip sap">{d.sap} sắp hết</span>}
                  </span>
                </span>
                <ChevronRight size={18} className="cc-mui" />
              </button>
            );
          })}
        </div>
      )}
      {formKhach && <FormKhach kh={formKhach.id ? formKhach : null} onLuu={luuKhach} onDong={() => setFormKhach(null)} />}
    </div>
  );
}
