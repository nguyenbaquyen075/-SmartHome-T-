import React, { useState, useEffect, useMemo } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, ChevronDown, Download, Check, Plus, Pencil, Trash2, X, MessageSquareText } from 'lucide-react';
import { api } from '../utils/api';

// Chấm công: danh sách nhân viên (tổng công mỗi người), xem chi tiết từng người,
// và màn Chấm công: nhân viên bên trái, lịch tháng bên phải, bấm vào ngày để tích.
const pad = (n) => String(n).padStart(2, '0');
const khoaNgay = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const soNgay = (y, m) => new Date(y, m, 0).getDate();
const thuDauThang = (y, m) => (new Date(y, m - 1, 1).getDay() + 6) % 7;   // thứ 2 = 0
const cong = (n) => String(Math.round(n * 2) / 2).replace('.', ',');
const homNayKhoa = () => { const n = new Date(); return khoaNgay(n.getFullYear(), n.getMonth() + 1, n.getDate()); };
const THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const chuCai = (ten) => ten.trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase();

const tongThang = (dl, id, y, m) =>
  Object.entries(dl.cong[id] || {}).filter(([k]) => k.startsWith(`${y}-${pad(m)}-`)).reduce((a, [, v]) => a + v, 0);
const tongNam = (dl, id, y) =>
  Object.entries(dl.cong[id] || {}).filter(([k]) => k.startsWith(`${y}-`)).reduce((a, [, v]) => a + v, 0);
const tongTatCa = (dl, id) => Object.values(dl.cong[id] || {}).reduce((a, v) => a + v, 0);
const demNgay = (dl, id, y, m, gia) =>
  Object.entries(dl.cong[id] || {}).filter(([k, v]) => k.startsWith(`${y}-${pad(m)}-`) && v === gia).length;

// Ghép bản đã lưu với phần đang tích dở (chưa bấm Lưu) để mọi con số hiện đúng ngay
const ghepNhap = (goc, nhap) => {
  const cong2 = {};
  for (const [id, v] of Object.entries(goc.cong)) cong2[id] = { ...v };
  const ct2 = {};
  for (const [id, v] of Object.entries(goc.chuThich || {})) ct2[id] = { ...v };
  for (const [id, ngay] of Object.entries(nhap)) {
    for (const [k, e] of Object.entries(ngay)) {
      if (e.gia !== undefined) { cong2[id] = cong2[id] || {}; if (e.gia === 0) delete cong2[id][k]; else cong2[id][k] = e.gia; }
      if (e.chuThich !== undefined) { ct2[id] = ct2[id] || {}; if (!e.chuThich) delete ct2[id][k]; else ct2[id][k] = e.chuThich; }
    }
  }
  return { ...goc, cong: cong2, chuThich: ct2 };
};
const ngayVN = (k) => k.split('-').reverse().join('/');

function Avatar({ ten, lon }) {
  return <i className={`cc-avt${lon ? ' lon' : ''}`}>{chuCai(ten)}</i>;
}

function ThanhThang({ thang, setThang }) {
  const di = (n) => setThang(({ y, m }) => { const d = new Date(y, m - 1 + n, 1); return { y: d.getFullYear(), m: d.getMonth() + 1 }; });
  const n = new Date();
  return (
    <div className="cc-thang">
      <button onClick={() => di(-1)} aria-label="Tháng trước"><ChevronLeft size={22} /></button>
      <button className="cc-thang-ten" onClick={() => setThang({ y: n.getFullYear(), m: n.getMonth() + 1 })} title="Về tháng này">
        tháng {thang.m} năm {thang.y}
      </button>
      <button onClick={() => di(1)} aria-label="Tháng sau"><ChevronRight size={22} /></button>
    </div>
  );
}

// Lịch tháng: ô vuông, ngày có công tô màu (xanh lá = 1 công, vàng = nửa công, đỏ = vắng của tháng đã qua).
// luu = bấm vào ngày để chọn công (không có thì chỉ xem)
function Lich({ dl, id, thang, luu }) {
  const { y, m } = thang;
  const homNay = homNayKhoa();
  const bay = new Date();
  const daQua = y * 12 + m < bay.getFullYear() * 12 + bay.getMonth() + 1;   // tháng đã hết: ngày không tích là vắng
  const o = [];
  for (let i = 0; i < thuDauThang(y, m); i++) o.push(<span key={`t${i}`} className="cc-trong" />);
  for (let d = 1; d <= soNgay(y, m); d++) {
    const k = khoaNgay(y, m, d);
    const gia = dl.cong[id]?.[k] || 0;
    const chu = dl.chuThich?.[id]?.[k] || '';
    const thu = (thuDauThang(y, m) + d - 1) % 7;
    const sau = k > homNay;   // ngày chưa tới: không chấm được
    const cls = `cc-ngay${sau ? ' sau' : ''}${gia === 1 ? ' du' : gia === 0.5 ? ' nua' : daQua ? ' vang' : ''}${thu >= 5 ? ' cuoituan' : ''}${k === homNay ? ' nay' : ''}`;
    const noiDung = (
      <>
        <small>{d}</small>
        {gia === 1 ? <Check size={18} strokeWidth={3} /> : gia === 0.5 ? <b>½</b> : null}
        {chu && <u className="cc-dau-ct" />}
      </>
    );
    o.push(luu && !sau
      ? <button key={k} className={cls} onClick={() => luu(k)} aria-label={`Ngày ${d}`} title={chu || undefined}>{noiDung}</button>
      : <span key={k} className={cls} title={chu || undefined}>{noiDung}</span>);
  }
  return (
    <div className="cc-lich">
      {THU.map((t) => <em key={t}>{t}</em>)}
      {o}
    </div>
  );
}

// Các chú thích của tháng, xếp theo ngày
function DsChuThich({ dl, id, thang }) {
  const tienTo = `${thang.y}-${pad(thang.m)}-`;
  const ds = Object.entries(dl.chuThich?.[id] || {}).filter(([k]) => k.startsWith(tienTo)).sort(([a], [b]) => a.localeCompare(b));
  if (!ds.length) return null;
  return (
    <div className="cc-ct-ds">
      <h3>Chú thích trong tháng</h3>
      {ds.map(([k, v]) => <p key={k}><b>{ngayVN(k).slice(0, 5)}</b> {v}</p>)}
    </div>
  );
}

// Bấm vào ngày: chọn 1 công (xanh) hoặc nửa công (vàng); đã tích thì có thêm "Bỏ tích"
function HopCong({ ten, ngay, gia, chu, onChon, onGhiChu, onDong }) {
  useEffect(() => {
    const phim = (e) => e.key === 'Escape' && onDong();
    window.addEventListener('keydown', phim);
    return () => window.removeEventListener('keydown', phim);
  }, [onDong]);
  return (
    <div className="cc-nen" onClick={onDong}>
      <div className="cc-hop cc-hop-be" role="dialog" aria-label="Chọn công" onClick={(e) => e.stopPropagation()}>
        <div className="cc-hop-dau">
          <h2>Ngày {ngayVN(ngay).slice(0, 5)}</h2>
          <button type="button" onClick={onDong} aria-label="Đóng"><X size={20} /></button>
        </div>
        <p className="cc-hop-phu">{ten}</p>
        <div className="cc-chon-cong">
          <button className={`xanh${gia === 1 ? ' on' : ''}`} onClick={() => onChon(1)}>
            <b>1 công</b>{gia === 1 && <Check size={18} strokeWidth={3} />}
          </button>
          <button className={`vang${gia === 0.5 ? ' on' : ''}`} onClick={() => onChon(0.5)}>
            <b>Nửa công</b>{gia === 0.5 && <Check size={18} strokeWidth={3} />}
          </button>
        </div>
        <button className="cc-ct-nut" onClick={onGhiChu}>
          <MessageSquareText size={16} /> <span>{chu || 'Thêm chú thích'}</span>
        </button>
        {gia > 0 && <button className="cc-bo-tich" onClick={() => onChon(0)}>Bỏ tích</button>}
      </div>
    </div>
  );
}

// Hộp ghi chú thích cho một ngày
function HopChuThich({ ten, ngay, giaTri, onXong, onDong }) {
  const [chu, setChu] = useState(giaTri);
  return (
    <div className="cc-nen" onClick={onDong}>
      <form className="cc-hop" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onXong(chu.trim()); }}>
        <div className="cc-hop-dau">
          <h2>Chú thích ngày {ngayVN(ngay).slice(0, 5)}</h2>
          <button type="button" onClick={onDong} aria-label="Đóng"><X size={20} /></button>
        </div>
        <p className="cc-hop-phu">{ten}</p>
        <textarea autoFocus rows={3} maxLength={200} value={chu} onChange={(e) => setChu(e.target.value)} placeholder="Ví dụ: đi muộn 1 tiếng, nghỉ có phép, làm thêm giờ…" />
        <div className="cc-hop-nut">
          {giaTri && <button type="button" className="cc-phu" onClick={() => onXong('')}>Xóa chú thích</button>}
          <button type="submit" className="cc-chinh">Xong</button>
        </div>
      </form>
    </div>
  );
}

function FormNV({ nv, onLuu, onDong }) {
  const [f, setF] = useState({ ten: nv?.ten || '', chucVu: nv?.chucVu || '', sdt: nv?.sdt || '' });
  const [dang, setDang] = useState(false);
  const gui = async (e) => {
    e.preventDefault();
    if (!f.ten.trim()) return;
    setDang(true);
    await onLuu(f);
    setDang(false);
  };
  return (
    <div className="cc-nen" onClick={onDong}>
      <form className="cc-hop" onClick={(e) => e.stopPropagation()} onSubmit={gui}>
        <div className="cc-hop-dau">
          <h2>{nv ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h2>
          <button type="button" onClick={onDong} aria-label="Đóng"><X size={20} /></button>
        </div>
        <label>Họ tên<input autoFocus value={f.ten} maxLength={80} onChange={(e) => setF({ ...f, ten: e.target.value })} placeholder="Nguyễn Văn A" /></label>
        <label>Chức vụ<input value={f.chucVu} maxLength={60} onChange={(e) => setF({ ...f, chucVu: e.target.value })} placeholder="Thợ chính, kỹ thuật viên…" /></label>
        <label>Số điện thoại<input value={f.sdt} maxLength={20} inputMode="tel" onChange={(e) => setF({ ...f, sdt: e.target.value })} placeholder="0987 654 321" /></label>
        <div className="cc-hop-nut">
          <button type="button" className="cc-phu" onClick={onDong}>Hủy</button>
          <button type="submit" className="cc-chinh" disabled={dang || !f.ten.trim()}>{dang ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminChamCong({ onBao, diToi, con }) {
  const [goc, setGoc] = useState(null);         // bản đã lưu trên server
  const [nhap, setNhap] = useState({});          // phần đang tích dở, chưa bấm Lưu: { idNV: { ngày: { gia?, chuThich? } } }
  const [dangLuu, setDangLuu] = useState(false);
  const [moCt, setMoCt] = useState(null);         // { id, ngay } đang sửa chú thích
  const [moDs, setMoDs] = useState(false);       // danh sách chọn nhân viên đang mở
  const [chonNgay, setChonNgay] = useState(null);  // { id, ngay } đang chọn 1 công / nửa công
  const [thang, setThang] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() + 1 }; });
  const [form, setForm] = useState(null);          // null | {} (thêm) | nhân viên (sửa)
  const [chon, setChon] = useState(null);          // nhân viên đang chấm công

  useEffect(() => {
    api.getChamCong().then((d) => setGoc({ chuThich: {}, ...d })).catch((e) => onBao(e.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dl = useMemo(() => (goc ? ghepNhap(goc, nhap) : null), [goc, nhap]);
  const soThayDoi = Object.values(nhap).reduce((a, v) => a + Object.keys(v).length, 0);

  // Đang tích dở mà đóng hoặc tải lại trang thì trình duyệt hỏi lại
  useEffect(() => {
    if (!soThayDoi) return undefined;
    const hoi = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', hoi);
    return () => window.removeEventListener('beforeunload', hoi);
  }, [soThayDoi]);

  if (!dl) return <p className="adm-trong">Đang tải…</p>;

  const luuNV = async (f) => {
    try {
      if (form.id) {
        const moi = await api.suaNhanVien(form.id, f);
        setGoc((d) => ({ ...d, nhanVien: d.nhanVien.map((n) => (n.id === moi.id ? moi : n)) }));
      } else {
        const moi = await api.themNhanVien(f);
        setGoc((d) => ({ ...d, nhanVien: [...d.nhanVien, moi] }));
      }
      setForm(null);
    } catch (err) { onBao(err.message, 'error'); }
  };

  const xoaNV = async (nv) => {
    if (!window.confirm(`Xóa nhân viên "${nv.ten}" và toàn bộ công đã chấm?`)) return;
    try {
      await api.xoaNhanVien(nv.id);
      setGoc((d) => {
        const cong2 = { ...d.cong };
        const ct2 = { ...d.chuThich };
        delete cong2[nv.id];
        delete ct2[nv.id];
        return { nhanVien: d.nhanVien.filter((n) => n.id !== nv.id), cong: cong2, chuThich: ct2 };
      });
      setNhap((n) => { const k = { ...n }; delete k[nv.id]; return k; });
      diToi('cham-cong');
    } catch (err) { onBao(err.message, 'error'); }
  };

  // Xuất bảng chấm công của một tháng ra file Excel (lấy từ bản đã lưu trên server)
  const xuatExcel = async (y, m) => {
    if (soThayDoi && !window.confirm(`Còn ${soThayDoi} thay đổi chưa lưu, file Excel sẽ không có các thay đổi này. Vẫn xuất?`)) return;
    try {
      const url = URL.createObjectURL(await api.xuatChamCong(`${y}-${pad(m)}`));
      const a = document.createElement('a');
      a.href = url;
      a.download = `bang-cong-thang-${m}-${y}.xlsx`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) { onBao(err.message, 'error'); }
  };

  // Ghi vào bản nháp; trùng với bản đã lưu thì bỏ khỏi nháp để đếm đúng số thay đổi
  const datNhap = (id, ngay, patch) => setNhap((n) => {
    const cur = { ...(n[id]?.[ngay] || {}), ...patch };
    const daLuu = { gia: goc.cong[id]?.[ngay] || 0, chuThich: goc.chuThich?.[id]?.[ngay] || '' };
    const e = {};
    if (cur.gia !== undefined && cur.gia !== daLuu.gia) e.gia = cur.gia;
    if (cur.chuThich !== undefined && cur.chuThich !== daLuu.chuThich) e.chuThich = cur.chuThich;
    const ngayNV = { ...(n[id] || {}) };
    if (Object.keys(e).length) ngayNV[ngay] = e; else delete ngayNV[ngay];
    const kq = { ...n };
    if (Object.keys(ngayNV).length) kq[id] = ngayNV; else delete kq[id];
    return kq;
  });

  const luuTatCa = async () => {
    const thayDoi = Object.entries(nhap).flatMap(([nhanVienId, ngay]) => Object.entries(ngay).map(([k, e]) => ({ nhanVienId, ngay: k, ...e })));
    if (!thayDoi.length) return;
    setDangLuu(true);
    try {
      await api.luuChamCong(thayDoi);
      setGoc(dl);          // dl đã gồm phần nháp
      setNhap({});
      onBao('Đã lưu chấm công');
    } catch (err) { onBao(err.message, 'error'); }
    setDangLuu(false);
  };

  const huyNhap = () => {
    if (soThayDoi && window.confirm(`Bỏ ${soThayDoi} thay đổi chưa lưu?`)) setNhap({});
  };

  const [dau, id] = con || [];
  const hopForm = form && <FormNV nv={form.id ? form : null} onLuu={luuNV} onDong={() => setForm(null)} />;
  const homNay = homNayKhoa();
  const moTaCong = (v) => (v === 1 ? 'Đủ công' : v === 0.5 ? 'Nửa công' : 'Chưa chấm');

  // ===== Chi tiết một nhân viên =====
  if (dau === 'nv') {
    const nv = dl.nhanVien.find((n) => n.id === id);
    if (!nv) return <p className="adm-trong">Không tìm thấy nhân viên. <a href="#/cham-cong">Về danh sách</a></p>;
    return (
      <div className="cc">
        <a className="cc-ve" href="#/cham-cong"><ChevronLeft size={18} /> Chấm công</a>
        <div className="cc-ho-so">
          <Avatar ten={nv.ten} lon />
          <div className="cc-ho-so-chu">
            <h1>{nv.ten}</h1>
            <p>{[nv.chucVu, nv.sdt].filter(Boolean).join(' · ') || 'Chưa có chức vụ'}</p>
          </div>
          <div className="cc-ho-so-nut">
            <button className="cc-chinh" onClick={() => { setChon(nv.id); diToi('cham-cong', 'cham'); }}><CalendarCheck size={16} /> Chấm công</button>
            <button className="cc-icon" onClick={() => setForm(nv)} title="Sửa" aria-label="Sửa"><Pencil size={17} /></button>
            <button className="cc-icon xoa" onClick={() => xoaNV(nv)} title="Xóa" aria-label="Xóa"><Trash2 size={17} /></button>
          </div>
        </div>

        <ThanhThang thang={thang} setThang={setThang} />
        <div className="cc-dai">
          <div><b>{cong(tongThang(dl, nv.id, thang.y, thang.m))}</b><span>Công tháng {thang.m}</span></div>
          <div><b>{demNgay(dl, nv.id, thang.y, thang.m, 1)}</b><span>Đủ công</span></div>
          <div><b>{demNgay(dl, nv.id, thang.y, thang.m, 0.5)}</b><span>Nửa công</span></div>
        </div>
        <p className="cc-phu-tt">Cả năm {thang.y}: {cong(tongNam(dl, nv.id, thang.y))} công · Tất cả: {cong(tongTatCa(dl, nv.id))} công</p>
        <div className="cc-khung"><Lich dl={dl} id={nv.id} thang={thang} /><DsChuThich dl={dl} id={nv.id} thang={thang} /></div>
        {hopForm}
      </div>
    );
  }

  // ===== Màn Chấm công: nhân viên bên trái, lịch bên phải =====
  if (dau === 'cham') {
    const dsNV = dl.nhanVien;
    const nv = dsNV.find((n) => n.id === (id || chon)) || dsNV[0];
    return (
      <div className="cc">
        <div className="cc-dau-cham">
          <a className="cc-ve lon" href="#/cham-cong" aria-label="Về danh sách nhân viên"><ChevronLeft size={26} /></a>
          {nv && (
            <div className="cc-dau-phai">
              {/* Chọn nhân viên: một nút, bấm vào xổ danh sách như chọn tài khoản Google */}
              <div className="cc-chon-nv">
                <button className="cc-chon-nut" onClick={() => setMoDs((v) => !v)} aria-expanded={moDs} aria-haspopup="listbox">
                  <Avatar ten={nv.ten} />
                  <span className="cc-chon-chu">
                    <strong>{nv.ten}</strong>
                    <small>{cong(tongThang(dl, nv.id, thang.y, thang.m))} công</small>
                  </span>
                  <ChevronDown size={16} className={moDs ? 'cc-xoay' : ''} />
                </button>
                {moDs && (
                  <>
                    <div className="cc-nen-trong" onClick={() => setMoDs(false)} />
                    <div className="cc-nv-menu" role="listbox">
                      {dsNV.map((n) => (
                        <button key={n.id} role="option" aria-selected={n.id === nv.id} className={`cc-nv-muc${n.id === nv.id ? ' on' : ''}`} onClick={() => { setChon(n.id); setMoDs(false); }}>
                          <Avatar ten={n.ten} />
                          <span className="cc-chon-chu">
                            <strong>{n.ten}</strong>
                            <small>{n.chucVu || 'Chưa có chức vụ'}</small>
                          </span>
                          <b>{cong(tongThang(dl, n.id, thang.y, thang.m))}</b>
                          {n.id === nv.id && <Check size={16} strokeWidth={3} className="cc-tick-chon" />}
                        </button>
                      ))}
                      <button className="cc-nv-them" onClick={() => { setMoDs(false); setForm({}); }}><Plus size={16} /> Thêm nhân viên</button>
                    </div>
                  </>
                )}
              </div>
              <button className="cc-phu cc-xuat" onClick={() => xuatExcel(thang.y, thang.m)} title={`Xuất bảng công tháng ${thang.m}/${thang.y} ra Excel`}>
                <Download size={16} /> <span className="cc-nhan-dai">Xuất Excel</span><span className="cc-nhan-ngan">Xuất</span>
              </button>
            </div>
          )}
        </div>
        {!nv ? (
          <div className="cc-rong">
            <p>Chưa có nhân viên để chấm công.</p>
            <button className="cc-chinh" onClick={() => setForm({})}><Plus size={16} /> Thêm nhân viên</button>
          </div>
        ) : (
          <div className="cc-cham">
            <section className="cc-phai">
              <div className="cc-thang-hang"><ThanhThang thang={thang} setThang={setThang} /></div>
              <Lich dl={dl} id={nv.id} thang={thang} luu={(k) => setChonNgay({ id: nv.id, ngay: k })} />
              <p className="cc-ghi-chu">Bấm vào ngày để chọn 1 công hoặc nửa công (ngày chưa tới không chấm được). Xanh: 1 công · Vàng: nửa công · Đỏ: vắng (tháng đã qua).</p>
              <DsChuThich dl={dl} id={nv.id} thang={thang} />
            </section>
          </div>
        )}
        {nv && soThayDoi > 0 ? (
          <div className="cc-luu-bar">
            <span className="chua">{soThayDoi} thay đổi chưa lưu</span>
            <button className="cc-phu" onClick={huyNhap} disabled={dangLuu}>Hủy</button>
            <button className="cc-chinh" onClick={luuTatCa} disabled={dangLuu}><Check size={16} /> {dangLuu ? 'Đang lưu…' : 'Lưu'}</button>
          </div>
        ) : null}
        {chonNgay && (
          <HopCong
            ten={`${dsNV.find((n) => n.id === chonNgay.id)?.ten || ''} · ${ngayVN(chonNgay.ngay)}`}
            ngay={chonNgay.ngay}
            gia={dl.cong[chonNgay.id]?.[chonNgay.ngay] || 0}
            chu={dl.chuThich?.[chonNgay.id]?.[chonNgay.ngay] || ''}
            onGhiChu={() => { setMoCt(chonNgay); setChonNgay(null); }}
            onChon={(v) => { datNhap(chonNgay.id, chonNgay.ngay, { gia: v }); setChonNgay(null); }}
            onDong={() => setChonNgay(null)}
          />
        )}
        {moCt && (
          <HopChuThich
            ten={`${dsNV.find((n) => n.id === moCt.id)?.ten || ''} · ${ngayVN(moCt.ngay)}`}
            ngay={moCt.ngay}
            giaTri={dl.chuThich?.[moCt.id]?.[moCt.ngay] || ''}
            onXong={(chu) => { datNhap(moCt.id, moCt.ngay, { chuThich: chu }); setMoCt(null); }}
            onDong={() => setMoCt(null)}
          />
        )}
        {hopForm}
      </div>
    );
  }

  // ===== Trang chính: danh sách nhân viên =====
  const bayGio = new Date();
  const y = bayGio.getFullYear();
  const m = bayGio.getMonth() + 1;   // trang chính luôn hiện công của tháng này
  return (
    <div className="cc">
      <div className="cc-tieude">
        <h1>Chấm công</h1>
        <div className="cc-tieude-nut">
          <button className="cc-phu" onClick={() => xuatExcel(y, m)} disabled={!dl.nhanVien.length} title={`Xuất bảng công tháng ${m}/${y} ra Excel`}><Download size={16} /> <span className="cc-nhan">Xuất Excel</span></button>
          <button className="cc-chinh" onClick={() => diToi('cham-cong', 'cham')} disabled={!dl.nhanVien.length}><CalendarCheck size={16} /> Chấm công</button>
        </div>
      </div>

      {dl.nhanVien.length === 0 ? (
        <div className="cc-rong"><p>Chưa có nhân viên. Bấm “Thêm nhân viên” để bắt đầu.</p></div>
      ) : (
        <div className="cc-ds">
          {dl.nhanVien.map((n) => {
            const hn = dl.cong[n.id]?.[homNay] || 0;
            return (
              <button key={n.id} className="cc-nv" onClick={() => diToi('cham-cong', 'nv', n.id)}>
                <Avatar ten={n.ten} />
                <span className="cc-nv-chu">
                  <strong>{n.ten}</strong>
                  <small>{[n.chucVu, n.sdt].filter(Boolean).join(' · ') || 'Chưa có chức vụ'}</small>
                </span>
                <span className="cc-nv-so">
                  <b>{cong(tongThang(dl, n.id, y, m))} công</b>
                  <small className={hn ? 'co' : ''}>{hn ? moTaCong(hn) : 'Chưa chấm hôm nay'}</small>
                </span>
                <ChevronRight size={18} className="cc-mui" />
              </button>
            );
          })}
        </div>
      )}
      <button className="cc-them" onClick={() => setForm({})}><Plus size={16} /> Thêm nhân viên</button>
      {hopForm}
    </div>
  );
}
