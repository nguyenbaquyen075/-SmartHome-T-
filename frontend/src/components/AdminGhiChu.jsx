import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { SquarePen, Search, Pin, PinOff, Trash2, ChevronLeft, ChevronRight, X, Folder, Plus, Pencil, Paperclip, Check, Download, FileDown } from 'lucide-react';
import { api } from '../utils/api';

// Sổ ghi chú riêng của quản trị, theo kiểu Ghi chú trên iPhone/Mac: thư mục > ghi chú.
// danh sách bên trái, soạn bên phải (ô tiêu đề riêng + nội dung), gõ tới đâu tự lưu tới đó.
// Tệp đính kèm nằm trong văn bản dưới dạng mã [[tep:<id>]], đứng đúng chỗ con trỏ lúc chèn (cùng dòng với chữ).
const MA_TEP = /\[\[tep:([\w-]+)\]\]/g;
const sachMa = (nd) => nd.replace(MA_TEP, '');
const maTrongNoiDung = (nd) => new Set([...nd.matchAll(MA_TEP)].map((m) => m[1]));

const dongDau = (nd) => sachMa(nd).split('\n').map((d) => d.trim()).filter(Boolean);
// Ghi chú cũ chưa có tiêu đề thì lấy dòng đầu của nội dung
const tieuDe = (g) => g.tieuDe || dongDau(g.noiDung)[0] || 'Ghi chú mới';
const xemTruoc = (g) => dongDau(g.noiDung)[g.tieuDe ? 0 : 1] || 'Không có nội dung thêm';
const trong = (g) => !g.tieuDe?.trim() && !sachMa(g.noiDung).trim() && !g.dinhKem?.length;

const DUOI_TEP = '.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.pdf,.txt,.png,.jpg,.jpeg,.webp';
const TOI_DA_TEP = 15 * 1024 * 1024;

const homNay = (iso) => new Date(iso).toDateString() === new Date().toDateString();
const gio = (iso) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const ngay = (iso) => new Date(iso).toLocaleDateString('vi-VN');
const ngayRutGon = (iso) => `${ngay(iso)} lúc ${gio(iso)}`;
const ngayDayDu = (iso) => `${ngay(iso)} lúc ${gio(iso)}`;

const nhomCua = (g) => {
  if (g.ghim) return 'Đã ghim';
  const ngayTruoc = (Date.now() - new Date(g.suaLuc).getTime()) / 864e5;
  if (homNay(g.suaLuc)) return 'Hôm nay';
  return ngayTruoc <= 7 ? '7 ngày qua' : 'Cũ hơn';
};
const THU_TU_NHOM = ['Đã ghim', 'Hôm nay', '7 ngày qua', 'Cũ hơn'];

const DUOI_XEM = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt'];   // mở thẳng trong trình duyệt; còn lại tải về

// Khung soạn kiểu văn bản: chữ và link tệp nằm chung một dòng, chữ dài thì tự xuống dòng.
// Lưu thành chuỗi có mã [[tep:id]]; dựng lại từ chuỗi khi mở ghi chú.
const dungChip = (t) => {
  const a = document.createElement('span');
  a.className = 'gc-lien';
  a.contentEditable = 'false';
  a.dataset.tep = t.id;
  a.title = 'Bấm để mở hoặc tải về';
  const ten = document.createElement('span');
  ten.className = 'gc-lien-ten';
  ten.textContent = t.ten;
  const x = document.createElement('span');
  x.className = 'gc-lien-x';
  x.dataset.xoa = '1';
  x.title = 'Xóa tệp';
  x.textContent = '×';
  a.append(ten, x);
  return a;
};

const dungDom = (goc, nd, dinhKem) => {
  goc.textContent = '';
  let cuoi = 0;
  for (const m of nd.matchAll(MA_TEP)) {
    if (m.index > cuoi) goc.append(nd.slice(cuoi, m.index));
    const t = dinhKem.find((x) => x.id === m[1]);
    if (t) goc.append(dungChip(t));
    cuoi = m.index + m[0].length;
  }
  if (cuoi < nd.length) goc.append(nd.slice(cuoi));
};

// DOM -> chuỗi. Xuống dòng của trình duyệt (BR hoặc DIV) đều quy về \n
const docDom = (goc) => {
  let kq = '';
  const di = (nut) => {
    for (const c of nut.childNodes) {
      if (c.nodeType === 3) kq += c.nodeValue.replace(/\u00a0/g, ' ');
      else if (c.dataset?.tep) kq += `[[tep:${c.dataset.tep}]]`;
      else if (c.nodeName === 'BR') { if (!(c === nut.lastChild && nut === goc)) kq += '\n'; }
      else if (c.nodeType === 1) {
        if (kq && !kq.endsWith('\n')) kq += '\n';
        di(c);
      }
    }
  };
  di(goc);
  return kq;
};

const VanBan = forwardRef(function VanBan({ value, dinhKem, onChange, onMo, onXoa }, ref) {
  const el = useRef(null);
  const vung = useRef(null);       // vùng chọn / con trỏ lần cuối trong khung
  const cuoiGui = useRef(value);   // chuỗi vừa báo lên, để không dựng lại khi chính mình vừa gõ

  useLayoutEffect(() => {
    if (cuoiGui.current !== value || !el.current.firstChild) { dungDom(el.current, value, dinhKem); cuoiGui.current = value; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const luu = () => {
      const sel = window.getSelection();
      if (sel.rangeCount && el.current?.contains(sel.anchorNode)) vung.current = sel.getRangeAt(0).cloneRange();
    };
    document.addEventListener('selectionchange', luu);
    return () => document.removeEventListener('selectionchange', luu);
  }, []);

  const baoLen = () => {
    const nd = docDom(el.current);
    if (nd === cuoiGui.current) return;
    cuoiGui.current = nd;
    onChange(nd);
  };

  useImperativeHandle(ref, () => ({
    focus: () => el.current?.focus(),
    // Chèn link đúng chỗ con trỏ (không có con trỏ thì cuối bài), kèm một dấu cách để gõ tiếp được
    chen: (t) => {
      const g = el.current;
      const r = vung.current && g.contains(vung.current.startContainer) ? vung.current : (() => {
        const x = document.createRange();
        x.selectNodeContents(g);
        x.collapse(false);
        return x;
      })();
      r.deleteContents();
      const chip = dungChip(t);
      const cach = document.createTextNode(' ');
      r.insertNode(cach);
      r.insertNode(chip);
      r.setStartAfter(cach);
      r.collapse(true);
      vung.current = r;
      g.focus();                                  // con trỏ nằm sau link, gõ tiếp được ngay
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      baoLen();
    },
    go: (fid) => {
      el.current.querySelectorAll(`[data-tep="${fid}"]`).forEach((n) => n.remove());
      baoLen();
    }
  }));

  return (
    <div
      ref={el}
      className="gc-van-ban"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      data-placeholder="Nội dung ghi chú…"
      onInput={() => { if (!el.current.textContent && !el.current.querySelector('[data-tep]')) el.current.textContent = ''; baoLen(); }}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.execCommand('insertText', false, '\n'); } }}
      onPaste={(e) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); }}
      onClick={(e) => {
        const chip = e.target.closest?.('[data-tep]');
        if (!chip) return;
        const t = dinhKem.find((x) => x.id === chip.dataset.tep);
        if (!t) return;
        if (e.target.closest('[data-xoa]')) onXoa(t); else onMo(t);
      }}
    />
  );
});

export default function AdminGhiChu({ onBao }) {
  const [ds, setDs] = useState([]);
  const [tm, setTm] = useState([]);                // thư mục
  const [tmChon, setTmChon] = useState(null);       // null = màn chính | 'tat-ca' | 'khong' | id thư mục
  const [dangTai, setDangTai] = useState(true);
  const [chon, setChon] = useState(null);
  const [tim, setTim] = useState('');
  const [hetThuMuc, setHetThuMuc] = useState(false);   // màn chính: xem hết thư mục
  const [man, setMan] = useState('ds');               // điện thoại: màn đang xem (ds > soan)
  const [trangThai, setTrangThai] = useState('');
  const cho = useRef(null);                         // { id, data } đang chờ lưu
  const hen = useRef(null);
  const [dangTaiTep, setDangTaiTep] = useState(false);
  const oTep = useRef(null);
  const vanRef = useRef(null);
  const oTieuDe = useRef(null);
  const dsRef = useRef(ds);
  dsRef.current = ds;

  const loi = (err) => { setTrangThai('Chưa lưu được'); onBao(err.message, 'error'); };

  // Gửi bản đang chờ lên server ngay
  const luuNgay = async () => {
    clearTimeout(hen.current);
    const c = cho.current;
    if (!c) return true;
    cho.current = null;
    try {
      await api.suaGhiChu(c.id, c.data);
      setTrangThai('Đã lưu');
      return true;
    } catch (err) { loi(err); return false; }
  };

  // Nút Lưu: lưu ngay, không chờ tự lưu
  const luuTay = async () => {
    if (await luuNgay()) { setTrangThai('Đã lưu'); onBao('Đã lưu ghi chú'); }
  };

  useEffect(() => {
    Promise.all([api.getGhiChu(), api.getThuMucGhiChu()])
      .then(([d, t]) => { setDs(d); setTm(t); setDangTai(false); })
      .catch((e) => { setDangTai(false); loi(e); });
    const khiDong = () => { if (cho.current) { api.luuGhiChuKhiDong(cho.current.id, cho.current.data); cho.current = null; } };
    window.addEventListener('beforeunload', khiDong);
    return () => { window.removeEventListener('beforeunload', khiDong); luuNgay(); };   // rời trang thì lưu nốt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sua = (id, patch) => {
    setDs((cu) => cu.map((g) => (g.id === id ? { ...g, ...patch, suaLuc: new Date().toISOString() } : g)));
    const g = { ...dsRef.current.find((x) => x.id === id), ...patch };
    cho.current = { id, data: { tieuDe: g.tieuDe || '', noiDung: g.noiDung, ghim: g.ghim, thuMuc: g.thuMuc || '' } };
    setTrangThai('Đang lưu…');
    clearTimeout(hen.current);
    hen.current = setTimeout(luuNgay, 700);
  };

  // Ghi chú trống bị bỏ đi khi rời khỏi nó, giống app Ghi chú
  const roiKhoi = async (id) => {
    await luuNgay();
    const g = dsRef.current.find((x) => x.id === id);
    if (g && trong(g)) {
      setDs((cu) => cu.filter((x) => x.id !== id));
      api.xoaGhiChu(id).catch(() => {});
    }
  };

  const mo = async (id) => {
    if (chon && chon !== id) await roiKhoi(chon);
    setChon(id);
    setMan('soan');
    setTrangThai('');
  };

  const them = async () => {
    try {
      if (chon) await roiKhoi(chon);
      const moi = await api.themGhiChu({ tieuDe: '', noiDung: '', ghim: false, thuMuc: tm.some((t) => t.id === tmChon) ? tmChon : '' });
      setDs((cu) => [moi, ...cu]);
      setChon(moi.id);
      setMan('soan');
      setTrangThai('');
      setTim('');
      if (!tmChon) setTmChon('khong');
      setTimeout(() => oTieuDe.current?.focus(), 0);
    } catch (err) { loi(err); }
  };

  const xoa = async () => {
    const g = ds.find((x) => x.id === chon);
    if (!g) return;
    if (!trong(g) && !window.confirm(`Xóa ghi chú "${tieuDe(g)}"?`)) return;
    cho.current = null;
    clearTimeout(hen.current);
    try {
      await api.xoaGhiChu(g.id);
      setDs((cu) => cu.filter((x) => x.id !== g.id));
      setChon(null);
      setMan('ds');
      setTrangThai('');
    } catch (err) { loi(err); }
  };

  // ---- Tệp đính kèm: lưu trên server, máy hỏng vẫn còn ----
  const chonTep = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    const id = chon;
    if (!id || !files.length) return;
    setDangTaiTep(true);
    for (const f of files) {
      if (f.size > TOI_DA_TEP) { onBao(`"${f.name}" quá nặng, tối đa 15MB`, 'error'); continue; }
      try {
        const tep = await api.taiTepGhiChu(id, f);
        setDs((cu) => cu.map((g) => (g.id === id ? { ...g, dinhKem: [...(g.dinhKem || []), tep] } : g)));
        vanRef.current?.chen(tep);
      } catch (err) { onBao(err.message, 'error'); }
    }
    setDangTaiTep(false);
  };

  // Bấm vào tệp: PDF, ảnh, TXT mở trong thẻ mới; Word, Excel... tải về
  const moTep = async (t) => {
    const xem = DUOI_XEM.includes(t.ten.split('.').pop().toLowerCase());
    const cua = xem ? window.open('', '_blank') : null;   // mở sẵn thẻ trước khi chờ tải, tránh bị chặn popup
    try {
      const url = URL.createObjectURL(await api.layTepGhiChu(t.id, xem));
      if (cua) cua.location.href = url;
      else {
        const a = document.createElement('a');
        a.href = url;
        a.download = t.ten;
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) { cua?.close(); onBao(err.message, 'error'); }
  };

  const xoaTep = async (g, t) => {
    if (!window.confirm(`Xóa tệp "${t.ten}"?`)) return;
    try {
      await api.xoaTepGhiChu(g.id, t.id);
      vanRef.current?.go(t.id);
      setDs((cu) => cu.map((x) => (x.id === g.id ? { ...x, dinhKem: x.dinhKem.filter((y) => y.id !== t.id) } : x)));
    } catch (err) { onBao(err.message, 'error'); }
  };

  // ---- Sao lưu & xuất file ----
  const luuFile = (blob, ten) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ten;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const [dangSaoLuu, setDangSaoLuu] = useState(false);
  const saoLuu = async () => {
    setDangSaoLuu(true);
    try {
      await luuNgay();
      luuFile(await api.saoLuuGhiChu(), `ghi-chu-sao-luu-${new Date().toISOString().slice(0, 10)}.zip`);
      onBao('Đã tải bản sao lưu (file .zip)');
    } catch (err) { onBao(err.message, 'error'); }
    setDangSaoLuu(false);
  };

  // Xuất ghi chú đang mở ra file .txt (mở được bằng Notepad, Word)
  const xuatTxt = (g) => {
    const tepTen = new Map((g.dinhKem || []).map((t) => [t.id, t.ten]));
    const chu = g.noiDung.replace(MA_TEP, (m, id) => `[Tệp đính kèm: ${tepTen.get(id) || 'đã xóa'}]`);
    const noi = `${tieuDe(g)}\r\nCập nhật: ${ngayDayDu(g.suaLuc)}\r\n\r\n${chu.replace(/\n/g, '\r\n')}\r\n`;
    luuFile(new Blob(['\ufeff', noi], { type: 'text/plain;charset=utf-8' }), `${tieuDe(g).replace(/[\\/:*?"<>|]+/g, '_').slice(0, 60)}.txt`);
  };

  // ---- Thư mục ----
  const themThuMuc = async () => {
    const ten = window.prompt('Tên thư mục mới');
    if (!ten?.trim()) return;
    try {
      const moi = await api.themThuMucGhiChu(ten);
      setTm((cu) => [...cu, moi]);
      setTmChon(moi.id);
      setMan('ds');
    } catch (err) { onBao(err.message, 'error'); }
  };

  const doiTenThuMuc = async (t) => {
    const ten = window.prompt('Đổi tên thư mục', t.ten);
    if (!ten?.trim() || ten.trim() === t.ten) return;
    try {
      const moi = await api.suaThuMucGhiChu(t.id, ten);
      setTm((cu) => cu.map((x) => (x.id === t.id ? moi : x)));
    } catch (err) { onBao(err.message, 'error'); }
  };

  const xoaThuMuc = async (t) => {
    const n = ds.filter((g) => g.thuMuc === t.id).length;
    const hoi = n ? `Xóa thư mục "${t.ten}"? ${n} ghi chú bên trong sẽ chuyển về "Chưa phân loại".` : `Xóa thư mục "${t.ten}"?`;
    if (!window.confirm(hoi)) return;
    try {
      await luuNgay();
      await api.xoaThuMucGhiChu(t.id);
      setTm((cu) => cu.filter((x) => x.id !== t.id));
      setDs((cu) => cu.map((g) => (g.thuMuc === t.id ? { ...g, thuMuc: '' } : g)));
      setTmChon(null);
    } catch (err) { onBao(err.message, 'error'); }
  };

  const chonThuMuc = async (id) => {
    if (chon) await roiKhoi(chon);
    setChon(null);
    setTmChon(id);
    setTim('');
    setMan('ds');
  };

  const dem = (id) => (ds.filter((g) => (id === 'khong' ? !g.thuMuc : g.thuMuc === id)).length);
  const tenThuMuc = !tmChon ? 'Kết quả tìm' : tmChon === 'tat-ca' ? 'Tất cả ghi chú' : tmChon === 'khong' ? 'Chưa phân loại' : tm.find((t) => t.id === tmChon)?.ten || 'Ghi chú';
  const hienThi = useMemo(() => {
    const q = tim.trim().toLowerCase();
    // Đang tìm thì tìm trong mọi thư mục, như app Ghi chú
    const trongThuMuc = q || tmChon === 'tat-ca' ? ds : ds.filter((g) => (tmChon === 'khong' ? !g.thuMuc : g.thuMuc === tmChon));
    const loc = q ? trongThuMuc.filter((g) => `${g.tieuDe || ''}\n${sachMa(g.noiDung)}`.toLowerCase().includes(q)) : trongThuMuc;
    const sx = [...loc].sort((a, b) => new Date(b.suaLuc) - new Date(a.suaLuc));
    return THU_TU_NHOM
      .map((ten) => ({ ten, muc: sx.filter((g) => nhomCua(g) === ten) }))
      .filter((n) => n.muc.length);
  }, [ds, tim, tmChon]);

  const hienTai = ds.find((g) => g.id === chon);
  // Tệp đính kèm từ bản cũ, chưa có chỗ trong văn bản: hiện dưới cùng
  const daChen = hienTai ? maTrongNoiDung(hienTai.noiDung) : new Set();
  const tepChuaChen = hienTai ? (hienTai.dinhKem || []).filter((t) => !daChen.has(t.id)) : [];

  const ngoaiThuMuc = dem('khong');
  const cacThuMuc = [...tm, ...(ngoaiThuMuc ? [{ id: 'khong', ten: 'Chưa phân loại' }] : [])];

  // Mở thẳng một ghi chú từ màn chính: vào đúng thư mục của nó
  const moTuManChinh = (g) => {
    setTmChon(g.thuMuc || 'khong');
    setChon(g.id);
    setMan('soan');
    setTrangThai('');
  };

  // Màn chính: thư mục + ghi chú gần đây. Có gõ tìm kiếm thì vào thẳng kết quả trong mọi thư mục.
  if (!tmChon && !tim.trim()) {
    const ganDay = [...ds]
      .sort((a, b) => Number(b.ghim) - Number(a.ghim) || new Date(b.suaLuc) - new Date(a.suaLuc))
      .slice(0, 5);
    const tenCua = (g) => tm.find((t) => t.id === g.thuMuc)?.ten || 'Chưa phân loại';
    const hienTM = hetThuMuc ? cacThuMuc : cacThuMuc.slice(0, 4);
    return (
      <div className="gc-ngoai">
        <div className="gc-tc-dau">
          <h1>Ghi chú</h1>
          <button className="gc-sao-luu" onClick={saoLuu} disabled={dangSaoLuu} title="Tải về toàn bộ ghi chú và tệp đính kèm">
            <Download size={16} /> {dangSaoLuu ? 'Đang tạo…' : 'Sao lưu'}
          </button>
        </div>
        <div className="gc-tim gc-tim-rong">
          <Search size={16} />
          <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder="Tìm ghi chú" />
        </div>

        {dangTai ? <p className="gc-trong">Đang tải…</p> : (
          <>
            <div className="gc-muc-dau">
              <h2>Thư mục ({cacThuMuc.length})</h2>
              <button className="gc-them-tm" onClick={themThuMuc}><Plus size={15} strokeWidth={2.4} /> Thư mục mới</button>
            </div>
            <div className="gc-luoi-tm">
              {hienTM.map((t, i) => (
                <button key={t.id} className="gc-the-tm" onClick={() => chonThuMuc(t.id)}>
                  <i className={`gc-bieu-tuong gc-mau-${i % 4}`}><Folder size={22} strokeWidth={1.8} /></i>
                  <span className="gc-the-chu">
                    <strong>{t.ten}</strong>
                    <small>{dem(t.id)} ghi chú</small>
                  </span>
                  <ChevronRight size={18} className="gc-mui-ten" />
                </button>
              ))}
            </div>
            {cacThuMuc.length > 4 && (
              <button className="gc-xem-them" onClick={() => setHetThuMuc((v) => !v)}>
                {hetThuMuc ? 'Thu gọn' : `Xem thêm ${cacThuMuc.length - 4} thư mục`}
                <ChevronRight size={15} className={hetThuMuc ? 'gc-len' : 'gc-xuong'} />
              </button>
            )}

            <div className="gc-muc-dau">
              <h2>Ghi chú gần đây</h2>
              {ds.length > 0 && (
                <button onClick={() => { setTmChon('tat-ca'); setMan('ds'); }}>Xem tất cả <ChevronRight size={15} /></button>
              )}
            </div>
            {ganDay.length === 0 ? (
              <p className="gc-trong">Chưa có ghi chú</p>
            ) : (
              <div className="gc-gan-day">
                {ganDay.map((g) => (
                  <button key={g.id} className="gc-dong" onClick={() => moTuManChinh(g)}>
                    <span className="gc-ghim">{g.ghim && <Pin size={17} fill="currentColor" />}</span>
                    <span className="gc-dong-chu">
                      <strong>{tieuDe(g)}</strong>
                      <small>{xemTruoc(g)}</small>
                    </span>
                    <span className="gc-dong-phai">
                      <em>{new Date(g.suaLuc).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</em>
                      <span className="gc-chip"><Folder size={14} /><span className="gc-chip-chu">{tenCua(g)}</span></span>
                    </span>
                    <ChevronRight size={18} className="gc-mui-ten" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  const thuMucDangChon = tm.find((t) => t.id === tmChon);

  return (
    <div className="gc-ngoai">
    <div className={`gc gc-man-${man}`}>
      <aside className="gc-ds">
        <div className="gc-ds-dau">
          <button className="gc-nut" onClick={() => chonThuMuc(null)} title="Về các thư mục" aria-label="Về các thư mục"><ChevronLeft size={22} /></button>
          <h1>{tim ? 'Kết quả tìm' : tenThuMuc}</h1>
          {thuMucDangChon && !tim && (
            <>
              <button className="gc-nut gc-nho" onClick={() => doiTenThuMuc(thuMucDangChon)} title="Đổi tên thư mục"><Pencil size={15} /></button>
              <button className="gc-nut gc-nho" onClick={() => xoaThuMuc(thuMucDangChon)} title="Xóa thư mục"><Trash2 size={15} /></button>
            </>
          )}
          {tmChon && <button className="gc-nut gc-moi" onClick={them} title="Ghi chú mới" aria-label="Ghi chú mới"><SquarePen size={20} /></button>}
        </div>
        <div className="gc-tim">
          <Search size={15} />
          <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder="Tìm kiếm" />
          {tim && <button onClick={() => setTim('')} aria-label="Xóa tìm kiếm"><X size={14} /></button>}
        </div>

        <div className="gc-cuon">
          {dangTai ? (
            <p className="gc-trong">Đang tải…</p>
          ) : hienThi.length === 0 ? (
            <p className="gc-trong">{tim ? 'Không tìm thấy ghi chú' : 'Chưa có ghi chú nào'}</p>
          ) : hienThi.map((n) => (
            <section key={n.ten}>
              <h3 className="gc-nhom">{n.ten}</h3>
              <ul>
                {n.muc.map((g) => (
                  <li key={g.id}>
                    <button className={`gc-muc${g.id === chon ? ' on' : ''}`} onClick={() => mo(g.id)}>
                      <strong>{g.ghim && <Pin size={11} />} {tieuDe(g)}{g.dinhKem?.length > 0 && <Paperclip size={12} className="gc-kep" />}</strong>
                      <em>{ngayRutGon(g.suaLuc)}</em>
                      <span>{xemTruoc(g)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="gc-dem">{hienThi.reduce((n, x) => n + x.muc.length, 0)} ghi chú</p>
      </aside>

      <section className="gc-soan">
        {hienTai ? (
          <>
            <div className="gc-soan-dau">
              <button className="gc-nut gc-ve" onClick={() => roiKhoi(hienTai.id).then(() => { setMan('ds'); setChon(null); })} aria-label="Về danh sách">
                <ChevronLeft size={22} /> <span className="gc-ve-chu">{tenThuMuc}</span>
              </button>
              <span className="gc-tt">{trangThai}</span>
              <button className="gc-nut" onClick={() => xuatTxt(hienTai)} title="Xuất ghi chú này ra file .txt"><FileDown size={19} /></button>
              <button className="gc-nut" onClick={() => sua(hienTai.id, { ghim: !hienTai.ghim })} title={hienTai.ghim ? 'Bỏ ghim' : 'Ghim'}>
                {hienTai.ghim ? <PinOff size={19} /> : <Pin size={19} />}
              </button>
              <button className="gc-nut gc-xoa" onClick={xoa} title="Xóa ghi chú"><Trash2 size={19} /></button>
            </div>
            <div className="gc-doc">
              <p className="gc-ngay">{ngayDayDu(hienTai.suaLuc)}</p>
              <input
                ref={oTieuDe}
                key={`t-${hienTai.id}`}
                className="gc-tieude"
                value={hienTai.tieuDe || ''}
                maxLength={200}
                placeholder="Tiêu đề"
                onChange={(e) => sua(hienTai.id, { tieuDe: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); vanRef.current?.focus(); } }}
              />
              <VanBan
                key={hienTai.id}
                ref={vanRef}
                value={hienTai.noiDung}
                dinhKem={hienTai.dinhKem || []}
                onChange={(nd) => sua(hienTai.id, { noiDung: nd })}
                onMo={moTep}
                onXoa={(t) => xoaTep(hienTai, t)}
              />
              {tepChuaChen.map((t) => (
                <span key={t.id} className="gc-van-ban gc-lien-roi">
                  <span className="gc-lien" onClick={() => moTep(t)}><span className="gc-lien-ten">{t.ten}</span>
                    <span className="gc-lien-x" onClick={(e) => { e.stopPropagation(); xoaTep(hienTai, t); }}>×</span></span>
                </span>
              ))}
              {/* Bấm vào khoảng trống bên dưới thì con trỏ vào cuối bài */}
              <div className="gc-doc-trong" onClick={() => vanRef.current?.focus()} />
            </div>
            <div className="gc-tep">
              <div className="gc-tep-hang">
              <input ref={oTep} type="file" multiple accept={DUOI_TEP} hidden onChange={chonTep} />
              <button className="gc-tep-them" onClick={() => oTep.current?.click()} disabled={dangTaiTep}>
                <Paperclip size={16} /> {dangTaiTep ? 'Đang tải lên…' : 'Đính kèm tệp'}
              </button>
              <button className="gc-luu" onClick={luuTay} title="Lưu ghi chú"><Check size={16} strokeWidth={2.6} /> Lưu</button>
              </div>
            </div>
          </>
        ) : (
          <div className="gc-chua-chon">
            <SquarePen size={40} />
            <p>Chọn một ghi chú để xem</p>
          </div>
        )}
      </section>
    </div>
    </div>
  );
}
