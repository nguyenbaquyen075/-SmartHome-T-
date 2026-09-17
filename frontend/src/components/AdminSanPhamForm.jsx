import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Trash2, Upload, Plus, Wand2, Link } from 'lucide-react';
import { api } from '../utils/api';
import { nenAnh, coFile, coDataUrl } from '../utils/anh';
import {
  DANH_MUC, DON_VI, MAU_THONG_SO, MAU_NOI_BAT, MAU_HUONG_DAN, BAO_HANH_MAC_DINH,
  BIEU_TUONG, BieuTuong, DaiNoiBat, doiNhan
} from '../utils/sanPham';
import { Truong, Khoi, ThanhLuu, DanhSachDong } from './AdminForm';

const TOI_DA_ANH = 6 * 1024 * 1024;    // giới hạn của /api/upload (tính sau khi nén)
const TOI_DA_CHON = 40 * 1024 * 1024;  // ảnh to hơn mức này thì máy nén cũng ì

// Đổi dữ liệu sản phẩm sang dạng để sửa trên form
const tuSanPham = (sp) => ({
  name: sp?.name || '',
  category: sp?.category || '',
  brand: sp?.brand || '',
  subTitle: sp?.subTitle || '',
  unit: sp?.unit || 'chiếc',
  featured: sp ? Boolean(sp.featured) : true,
  images: sp?.images?.length ? [...sp.images] : sp?.image ? [sp.image] : [],
  noiBat: (sp?.noiBat || []).map((o) => ({ ghiChu: '', ...o })),
  description: sp?.description || '',
  highlights: [...(sp?.highlights || [])],
  specs: Object.entries(sp?.specs || {}).map(([khoa, giaTri]) => ({ nhan: doiNhan(khoa), giaTri })),
  huongDan: [...(sp?.huongDan || [])],
  thoiGianBaoHanh: sp?.baoHanh?.thoiGian || BAO_HANH_MAC_DINH.thoiGian,
  doiTra: sp?.baoHanh?.doiTra || BAO_HANH_MAC_DINH.doiTra
});

const khungThongSo = (dm) => (MAU_THONG_SO[dm] || []).map(([nhan]) => ({ nhan, giaTri: '' }));
const khungNoiBat = (dm) => (MAU_NOI_BAT[dm] || []).map(([bieuTuong, nhan]) => ({ bieuTuong, nhan, giaTri: '', ghiChu: '' }));

export default function AdminSanPhamForm({ sp, ds, onBao, onXong, onHuy }) {
  const [f, setF] = useState(() => tuSanPham(sp));
  const [loi, setLoi] = useState({});
  const [dangLuu, setDangLuu] = useState(false);
  const [dangTaiAnh, setDangTaiAnh] = useState('');   // "2/5" khi đang tải nhiều ảnh
  const [duongDanAnh, setDuongDanAnh] = useState('');

  const doi = (khoa, giaTri) => setF((cu) => ({ ...cu, [khoa]: giaTri }));
  const cacHang = [...new Set(ds.map((p) => p.brand).filter(Boolean))];
  const mauThongSo = MAU_THONG_SO[f.category] || [];
  const viDuThongSo = Object.fromEntries(Object.values(MAU_THONG_SO).flat());

  // Chọn danh mục: tự điền khung thông số, 4 ô nổi bật, hướng dẫn của loại đó.
  // Phần nào anh đã nhập giá trị thì giữ nguyên, không ghi đè.
  const chonDanhMuc = (category) => setF((cu) => {
    const huongDanLaMauCu = JSON.stringify(cu.huongDan) === JSON.stringify(MAU_HUONG_DAN[cu.category] || []);
    return {
      ...cu,
      category,
      specs: cu.specs.some((r) => r.giaTri.trim()) ? cu.specs : khungThongSo(category),
      noiBat: cu.noiBat.some((o) => o.giaTri.trim()) ? cu.noiBat : khungNoiBat(category),
      huongDan: cu.huongDan.length && !huongDanLaMauCu ? cu.huongDan : [...(MAU_HUONG_DAN[category] || [])]
    };
  });

  const themDongThieu = () => doi('specs', [
    ...f.specs,
    ...khungThongSo(f.category).filter((m) => !f.specs.some((r) => r.nhan === m.nhan))
  ]);

  // ---- Ảnh ----
  const taiAnh = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const [i, file] of files.entries()) {
      if (file.size > TOI_DA_CHON) {
        onBao(`"${file.name}" quá lớn (${coFile(file.size)}). Chọn ảnh nhỏ hơn 40MB.`, 'error');
        continue;
      }
      setDangTaiAnh(`${i + 1}/${files.length}`);
      try {
        // Nén ngay trên máy: ảnh điện thoại vài MB còn vài trăm KB
        const goi = await nenAnh(file);
        if (coDataUrl(goi) > TOI_DA_ANH) {
          onBao(`"${file.name}" nén rồi vẫn quá nặng, thử ảnh khác.`, 'error');
          continue;
        }
        const { url } = await api.uploadImage(goi, f.name || file.name.replace(/\.[^.]+$/, ''));
        setF((cu) => ({ ...cu, images: [...cu.images, url] }));
        if (file.size > coDataUrl(goi) * 1.3) onBao(`Đã nén "${file.name}": ${coFile(file.size)} → ${coFile(coDataUrl(goi))}`);
      } catch (err) {
        onBao(err.message, 'error');
      }
    }
    setDangTaiAnh('');
  };

  const doiChoAnh = (i, j) => {
    const moi = [...f.images];
    [moi[i], moi[j]] = [moi[j], moi[i]];
    doi('images', moi);
  };

  const themAnhTuDuongDan = () => {
    if (!duongDanAnh.trim()) return;
    doi('images', [...f.images, duongDanAnh.trim()]);
    setDuongDanAnh('');
  };

  // ---- Lưu ----
  const luu = async (e) => {
    e.preventDefault();
    const thieu = { name: !f.name.trim(), category: !f.category, brand: !f.brand.trim(), images: !f.images.length };
    setLoi(thieu);
    if (Object.values(thieu).some(Boolean)) {
      onBao('Còn thiếu thông tin bắt buộc (ô viền đỏ)', 'error');
      requestAnimationFrame(() =>
        document.querySelector('.qt-truong.loi, .qt-anh.loi')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      );
      return;
    }

    const sach = (dsDong) => dsDong.map((s) => s.trim()).filter(Boolean);
    const duLieu = {
      name: f.name,
      category: f.category,
      brand: f.brand,
      subTitle: f.subTitle,
      unit: f.unit,
      featured: f.featured,
      images: f.images,
      noiBat: f.noiBat.filter((o) => o.nhan.trim() && o.giaTri.trim()),
      description: f.description,
      highlights: sach(f.highlights),
      specs: Object.fromEntries(
        f.specs.filter((r) => r.nhan.trim() && r.giaTri.trim()).map((r) => [r.nhan.trim(), r.giaTri.trim()])
      ),
      huongDan: sach(f.huongDan),
      baoHanh: { thoiGian: f.thoiGianBaoHanh, doiTra: f.doiTra }
    };

    setDangLuu(true);
    try {
      if (sp) await api.updateProduct(sp.id, duLieu);
      else await api.createProduct(duLieu);
      onBao(sp ? 'Đã lưu thay đổi' : 'Đã thêm sản phẩm');
      onXong();
    } catch (err) {
      onBao(err.message, 'error');
    } finally {
      setDangLuu(false);
    }
  };

  const noiBatDaNhap = f.noiBat.filter((o) => o.nhan.trim() && o.giaTri.trim());

  return (
    <form onSubmit={luu} noValidate>
      <div className="qt-tieude">
        <div>
          <button type="button" className="qt-quaylai" onClick={onHuy}><ArrowLeft size={15} /> Quay lại danh sách sản phẩm</button>
          <h1>{sp ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
          <p>Các phần xếp đúng thứ tự khách thấy ở trang chi tiết. Ô có dấu <b className="qt-sao">*</b> là bắt buộc.</p>
        </div>
        {sp && (
          <a className="qt-nut" href={`/#product=${sp.id}`} target="_blank" rel="noreferrer">Xem trên web ↗</a>
        )}
      </div>

      {/* 1. Thông tin cơ bản */}
      <Khoi so={1} tieuDe="Thông tin cơ bản" moTa="Tên, danh mục và dòng mô tả ngắn hiện trên thẻ sản phẩm">
        <div className="qt-hang">
          <Truong nhan="Tên sản phẩm" batBuoc rong loi={loi.name && !f.name.trim() && 'Cần nhập tên sản phẩm'}>
            <input
              className="qt-input"
              value={f.name}
              onChange={(e) => doi('name', e.target.value)}
              placeholder="VD: Camera IP Hikvision DS-2CD1123G0E-I 2MP"
              maxLength={200}
            />
          </Truong>

          <Truong nhan="Danh mục" batBuoc loi={loi.category && !f.category && 'Chọn danh mục'} goiY="Chọn là tự hiện khung thông số của loại này">
            <select className="qt-input" value={f.category} onChange={(e) => chonDanhMuc(e.target.value)}>
              <option value="">— Chọn danh mục —</option>
              {DANH_MUC.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Truong>

          <Truong nhan="Thương hiệu" batBuoc loi={loi.brand && !f.brand.trim() && 'Cần nhập thương hiệu'} goiY="Gõ tên mới hoặc chọn hãng đã có">
            <input
              className="qt-input"
              list="qt-ds-hang"
              value={f.brand}
              onChange={(e) => doi('brand', e.target.value)}
              placeholder="VD: Hikvision"
              maxLength={80}
            />
            <datalist id="qt-ds-hang">{cacHang.map((h) => <option key={h} value={h} />)}</datalist>
          </Truong>

          <Truong nhan="Mô tả ngắn" rong goiY="Một dòng hiện dưới tên trên thẻ sản phẩm">
            <input
              className="qt-input"
              value={f.subTitle}
              onChange={(e) => doi('subTitle', e.target.value)}
              placeholder="VD: Camera IP Dome ngoài trời 2MP, hồng ngoại 30m, chuẩn IP67"
              maxLength={200}
            />
          </Truong>

          <Truong nhan="Đơn vị tính">
            <select className="qt-input" value={f.unit} onChange={(e) => doi('unit', e.target.value)}>
              {[...new Set([...DON_VI, f.unit])].map((d) => <option key={d}>{d}</option>)}
            </select>
          </Truong>

          <label className="qt-cong-tac">
            <input type="checkbox" checked={f.featured} onChange={(e) => doi('featured', e.target.checked)} />
            <span>
              <strong>Sản phẩm nổi bật</strong>
              <small>Đánh dấu để ưu tiên giới thiệu</small>
            </span>
          </label>
        </div>
      </Khoi>

      {/* 2. Hình ảnh */}
      <Khoi so={2} tieuDe="Hình ảnh" moTa="Ảnh đầu tiên là ảnh đại diện. Cứ chọn ảnh chụp từ điện thoại, hệ thống tự nén lại">
        <div className={`qt-anh${loi.images && !f.images.length ? ' loi' : ''}`}>
          <div className="qt-anh-luoi">
            {f.images.map((url, i) => (
              <div key={`${url}-${i}`} className="qt-anh-o">
                <img src={url} alt={`Ảnh ${i + 1}`} />
                {i === 0 && <span className="qt-anh-dai-dien">Ảnh đại diện</span>}
                <div className="qt-anh-nut">
                  <button type="button" onClick={() => doiChoAnh(i, i - 1)} disabled={i === 0} aria-label="Đưa lên trước">
                    <ArrowLeft size={14} />
                  </button>
                  <button type="button" onClick={() => doiChoAnh(i, i + 1)} disabled={i === f.images.length - 1} aria-label="Đưa ra sau">
                    <ArrowRight size={14} />
                  </button>
                  <button type="button" className="xoa" onClick={() => doi('images', f.images.filter((_, j) => j !== i))} aria-label="Xóa ảnh">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <label className="qt-anh-them">
              <Upload size={22} />
              <span>{dangTaiAnh ? `Đang tải ${dangTaiAnh}…` : 'Tải ảnh lên'}</span>
              <small>JPG, PNG, WEBP · chọn nhiều ảnh · tự nén</small>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                hidden
                onChange={taiAnh}
                disabled={Boolean(dangTaiAnh)}
              />
            </label>
          </div>

          {loi.images && !f.images.length && <small className="qt-loi-chu">Cần ít nhất 1 ảnh</small>}

          <div className="qt-anh-link">
            <Link size={15} />
            <input
              className="qt-input"
              value={duongDanAnh}
              onChange={(e) => setDuongDanAnh(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); themAnhTuDuongDan(); } }}
              placeholder="Hoặc dán đường dẫn ảnh có sẵn: /images/ten-anh.jpg"
            />
            <button type="button" className="qt-nut" onClick={themAnhTuDuongDan}>Thêm</button>
          </div>
        </div>
      </Khoi>

      {/* 3. 4 ô nổi bật */}
      <Khoi
        so={3}
        tieuDe="4 ô nổi bật"
        moTa="Dải thông tin ngay dưới tên sản phẩm. Để trống thì trang chi tiết ẩn phần này"
        nut={f.category && (
          <button type="button" className="qt-nut-mau" onClick={() => doi('noiBat', khungNoiBat(f.category))}>
            <Wand2 size={14} /> Dùng khung mẫu
          </button>
        )}
      >
        {f.noiBat.map((o, i) => {
          const viDu = (MAU_NOI_BAT[f.category] || []).find((m) => m[1] === o.nhan);
          const doiO = (khoa, giaTri) => doi('noiBat', f.noiBat.map((x, j) => (j === i ? { ...x, [khoa]: giaTri } : x)));
          return (
            <div key={i} className="qt-nb">
              <div className="qt-nb-icon">
                <span className="qt-nb-xem"><BieuTuong loai={o.bieuTuong} /></span>
                <select className="qt-input" value={o.bieuTuong} onChange={(e) => doiO('bieuTuong', e.target.value)} aria-label="Biểu tượng">
                  {Object.entries(BIEU_TUONG).map(([k, b]) => <option key={k} value={k}>{b.ten}</option>)}
                </select>
              </div>
              <input className="qt-input" value={o.nhan} onChange={(e) => doiO('nhan', e.target.value)} placeholder="Nhãn, VD: Hồng ngoại" aria-label="Nhãn" />
              <input className="qt-input" value={o.giaTri} onChange={(e) => doiO('giaTri', e.target.value)} placeholder={`Giá trị, VD: ${viDu?.[2] || '30m'}`} aria-label="Giá trị" />
              <input className="qt-input" value={o.ghiChu} onChange={(e) => doiO('ghiChu', e.target.value)} placeholder={viDu?.[3] ? `Ghi chú, VD: ${viDu[3]}` : 'Ghi chú (không bắt buộc)'} aria-label="Ghi chú" />
              <button type="button" className="qt-xoa-o" onClick={() => doi('noiBat', f.noiBat.filter((_, j) => j !== i))} aria-label="Xóa ô">
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}

        {f.noiBat.length < 4 && (
          <button type="button" className="qt-nut-them" onClick={() => doi('noiBat', [...f.noiBat, { bieuTuong: 'shield', nhan: '', giaTri: '', ghiChu: '' }])}>
            <Plus size={15} /> Thêm ô
          </button>
        )}

        {noiBatDaNhap.length > 0 && (
          <div className="qt-xem-truoc">
            <p>Xem trước trên trang chi tiết</p>
            <DaiNoiBat ds={noiBatDaNhap} />
          </div>
        )}
      </Khoi>

      {/* 4. Giới thiệu */}
      <Khoi so={4} tieuDe="Giới thiệu tổng quan" moTa="Đoạn văn mở đầu phần Giới thiệu ở trang chi tiết">
        <textarea
          className="qt-input"
          rows={6}
          value={f.description}
          onChange={(e) => doi('description', e.target.value)}
          placeholder="Sản phẩm dùng cho công trình nào, thiết kế, chất liệu, ưu điểm khi lắp đặt thực tế…"
          maxLength={5000}
        />
        <small className="qt-dem">
          {f.description.length} ký tự{f.description.length < 150 ? ' · nên viết từ 150 ký tự để khách đọc đủ ý' : ''}
        </small>
      </Khoi>

      {/* 5. Đặc điểm nổi bật */}
      <Khoi so={5} tieuDe="Đặc điểm nổi bật" moTa="Mỗi dòng một ý ngắn, nên có 3–5 dòng. Để trống thì lấy 4 thông số đầu tiên">
        <DanhSachDong
          ds={f.highlights}
          onDoi={(v) => doi('highlights', v)}
          placeholder="VD: Hồng ngoại 30m, quan sát rõ ban đêm"
          nhanThem="Thêm đặc điểm"
        />
      </Khoi>

      {/* 6. Thông số kỹ thuật */}
      <Khoi
        so={6}
        tieuDe="Thông số kỹ thuật"
        moTa={f.category
          ? `Khung thông số của ${f.category}. Dòng nào để trống giá trị sẽ không hiện ra ngoài`
          : 'Chọn danh mục ở phần 1 để hiện khung thông số'}
        nut={mauThongSo.length > 0 && (
          <button type="button" className="qt-nut-mau" onClick={themDongThieu}>
            <Wand2 size={14} /> Thêm dòng còn thiếu theo mẫu
          </button>
        )}
      >
        <datalist id="qt-nhan-ts">
          {Object.keys(viDuThongSo).map((n) => <option key={n} value={n} />)}
        </datalist>

        {f.specs.map((r, i) => {
          const doiDong = (khoa, giaTri) => doi('specs', f.specs.map((x, j) => (j === i ? { ...x, [khoa]: giaTri } : x)));
          return (
            <div key={i} className="qt-ts">
              <input
                className="qt-input"
                list="qt-nhan-ts"
                value={r.nhan}
                onChange={(e) => doiDong('nhan', e.target.value)}
                placeholder="Tên thông số"
                aria-label="Tên thông số"
              />
              <input
                className="qt-input"
                value={r.giaTri}
                onChange={(e) => doiDong('giaTri', e.target.value)}
                placeholder={viDuThongSo[r.nhan] ? `VD: ${viDuThongSo[r.nhan]}` : 'Giá trị'}
                aria-label={`Giá trị ${r.nhan}`}
              />
              <button type="button" className="qt-xoa-o" onClick={() => doi('specs', f.specs.filter((_, j) => j !== i))} aria-label="Xóa dòng">
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}

        <button type="button" className="qt-nut-them" onClick={() => doi('specs', [...f.specs, { nhan: '', giaTri: '' }])}>
          <Plus size={15} /> Thêm dòng thông số
        </button>
      </Khoi>

      {/* 7. Hướng dẫn */}
      <Khoi
        so={7}
        tieuDe="Hướng dẫn lắp đặt & sử dụng"
        moTa="Các bước hiện theo thứ tự. Để trống thì trang chi tiết dùng hướng dẫn chung của danh mục"
        nut={MAU_HUONG_DAN[f.category] && (
          <button type="button" className="qt-nut-mau" onClick={() => doi('huongDan', [...MAU_HUONG_DAN[f.category]])}>
            <Wand2 size={14} /> Dùng hướng dẫn mẫu
          </button>
        )}
      >
        <DanhSachDong
          ds={f.huongDan}
          onDoi={(v) => doi('huongDan', v)}
          placeholder="Mô tả bước làm"
          nhanThem="Thêm bước"
          soThuTu
        />
      </Khoi>

      {/* 8. Bảo hành */}
      <Khoi so={8} tieuDe="Bảo hành & đổi trả" moTa="Hiện ở phần Chính sách bảo hành">
        <div className="qt-hang">
          <Truong nhan="Thời gian bảo hành" goiY='Trang chi tiết hiện "Bảo hành 24 tháng"'>
            <input className="qt-input" value={f.thoiGianBaoHanh} onChange={(e) => doi('thoiGianBaoHanh', e.target.value)} placeholder="24 tháng" maxLength={60} />
          </Truong>
          <Truong nhan="Chính sách đổi trả">
            <input className="qt-input" value={f.doiTra} onChange={(e) => doi('doiTra', e.target.value)} placeholder="1 đổi 1 trong 7 ngày" maxLength={120} />
          </Truong>
        </div>
      </Khoi>

      <ThanhLuu
        dangLuu={dangLuu}
        onHuy={onHuy}
        nhan={sp ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
        ghiChu={f.name || 'Sản phẩm mới'}
      />
    </form>
  );
}
