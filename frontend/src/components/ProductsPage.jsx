import React, { useState, useEffect } from 'react';
import { Home, ChevronRight, SlidersHorizontal, X, Search, PackageSearch, ArrowLeft } from 'lucide-react';
import ProductCard from './ProductCard';
import { api } from '../utils/api';
import { useDanhMuc } from '../utils/danhMuc';


const SORTS = [
  { value: '', label: 'Mặc định' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' }
];

// Loại thiết bị do quản trị chọn khi thêm sản phẩm; mốc thời gian lấy từ id dạng sp-<mili giây>
const loaiCua = (p) => p.loai || '';
const moc = (p) => Number(String(p.id).replace(/\D/g, '')) || 0;

// Một nhóm bộ lọc gập/mở được (details gốc của trình duyệt)
const Nhom = ({ tieuDe, dem, children }) => (
  <details className="pp-filter-group" open>
    <summary>{tieuDe}{dem > 0 && <em>{dem}</em>}</summary>
    {children}
  </details>
);

export default function ProductsPage({
  initialCategory = 'Tất cả',
  onViewDetails,
  onGoHome,
  onBack
}) {
  const dsDanhMuc = useDanhMuc();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Tất cả']);
  const [brands, setBrands] = useState(['Tất cả']);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState('Tất cả');
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');
  const [loai, setLoai] = useState([]);            // chọn được nhiều loại
  const [noiBat, setNoiBat] = useState(false);
  const [coBaoHanh, setCoBaoHanh] = useState(false);
  const [donVi, setDonVi] = useState('Tất cả');
  const [filterOpen, setFilterOpen] = useState(false);   // chi dung tren dien thoai

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setLoai([]);
      setDonVi('Tất cả');
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category !== 'Tất cả') params.category = category;
        if (brand !== 'Tất cả') params.brand = brand;
        if (noiBat) params.featured = 'true';
        setProducts(await api.getProducts(params));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [category, brand, sort, search, noiBat]);

  // Loại, đơn vị, bảo hành, sắp xếp lọc ngay trên danh sách đã tải
  // Loại của danh mục đang xem (hoặc mọi danh mục) + loại đã gán cho sản phẩm
  const dsLoai = [...new Set([
    ...dsDanhMuc.filter((d) => category === 'Tất cả' || d.ten === category).flatMap((d) => d.loai || []),
    ...products.map(loaiCua).filter(Boolean)
  ])];
  const demLoai = (l) => products.filter((p) => loaiCua(p) === l).length;
  const dsDonVi = [...new Set(products.map((p) => p.unit).filter(Boolean))];
  let shown = products;
  if (loai.length) shown = shown.filter((p) => loai.includes(loaiCua(p)));
  if (donVi !== 'Tất cả') shown = shown.filter((p) => p.unit === donVi);
  if (coBaoHanh) shown = shown.filter((p) => p.baoHanh?.thoiGian || p.baoHanh?.doiTra);
  if (sort === 'newest') shown = [...shown].sort((a, b) => moc(b) - moc(a));
  if (sort === 'oldest') shown = [...shown].sort((a, b) => moc(a) - moc(b));

  // Các bộ lọc đang bật, hiện thành thẻ có nút xóa từng cái
  const chips = [
    category !== 'Tất cả' && { k: 'cat', label: category, bo: () => setCategory('Tất cả') },
    brand !== 'Tất cả' && { k: 'brand', label: brand, bo: () => setBrand('Tất cả') },
    ...loai.map((l) => ({ k: 'l' + l, label: l, bo: () => setLoai(loai.filter((x) => x !== l)) })),
    noiBat && { k: 'nb', label: 'Nổi bật', bo: () => setNoiBat(false) },
    coBaoHanh && { k: 'bh', label: 'Có bảo hành', bo: () => setCoBaoHanh(false) },
    donVi !== 'Tất cả' && { k: 'dv', label: `Đơn vị: ${donVi}`, bo: () => setDonVi('Tất cả') },
    search.trim() && { k: 's', label: `“${search.trim()}”`, bo: () => setSearch('') }
  ].filter(Boolean);
  const activeCount = chips.length;

  const clearAll = () => {
    setCategory('Tất cả');
    setBrand('Tất cả');
    setSearch('');
    setSort('');
    setLoai([]);
    setNoiBat(false);
    setCoBaoHanh(false);
    setDonVi('Tất cả');
  };

  // Khoi bo loc dung chung cho ca sidebar may tinh lan bang truot dien thoai
  const filterPanel = (
    <>
      <Nhom tieuDe="Danh mục" dem={category !== 'Tất cả' ? 1 : 0}>
        {categories.map((c) => (
          <label key={c} className={`pp-radio ${category === c ? 'on' : ''}`}>
            <input type="radio" name="pp-cat" checked={category === c} onChange={() => setCategory(c)} />
            <span>{c}</span>
          </label>
        ))}
      </Nhom>

      {dsLoai.length > 0 && (
        <Nhom tieuDe="Loại sản phẩm" dem={loai.length}>
          {dsLoai.map((l) => (
            <label key={l} className={`pp-radio ${loai.includes(l) ? 'on' : ''}`}>
              <input
                type="checkbox"
                checked={loai.includes(l)}
                onChange={() => setLoai(loai.includes(l) ? loai.filter((x) => x !== l) : [...loai, l])}
              />
              <span>{l}</span>
              <small>{demLoai(l)}</small>
            </label>
          ))}
        </Nhom>
      )}

      <Nhom tieuDe="Thương hiệu" dem={brand !== 'Tất cả' ? 1 : 0}>
        {brands.map((b) => (
          <label key={b} className={`pp-radio ${brand === b ? 'on' : ''}`}>
            <input type="radio" name="pp-brand" checked={brand === b} onChange={() => setBrand(b)} />
            <span>{b}</span>
          </label>
        ))}
      </Nhom>

      <Nhom tieuDe="Đặc điểm" dem={(noiBat ? 1 : 0) + (coBaoHanh ? 1 : 0)}>
        <label className={`pp-radio ${noiBat ? 'on' : ''}`}>
          <input type="checkbox" checked={noiBat} onChange={(e) => setNoiBat(e.target.checked)} />
          <span>Sản phẩm nổi bật</span>
        </label>
        <label className={`pp-radio ${coBaoHanh ? 'on' : ''}`}>
          <input type="checkbox" checked={coBaoHanh} onChange={(e) => setCoBaoHanh(e.target.checked)} />
          <span>Có thông tin bảo hành</span>
        </label>
      </Nhom>

      {dsDonVi.length > 1 && (
        <Nhom tieuDe="Đơn vị tính" dem={donVi !== 'Tất cả' ? 1 : 0}>
          {['Tất cả', ...dsDonVi].map((u) => (
            <label key={u} className={`pp-radio ${donVi === u ? 'on' : ''}`}>
              <input type="radio" name="pp-unit" checked={donVi === u} onChange={() => setDonVi(u)} />
              <span>{u}</span>
            </label>
          ))}
        </Nhom>
      )}
    </>
  );

  return (
    <div className="container pp-wrap">
      {/* Duong dan */}
      <nav className="pp-crumb nut-dong-hang">
        <div className="nut-dong-crumb">
          <button onClick={onGoHome}><Home size={14} /> Trang chủ</button>
          <ChevronRight size={13} />
          <span>Sản phẩm</span>
          {category !== 'Tất cả' && (
            <>
              <ChevronRight size={13} />
              <span className="pp-crumb-cur">{category}</span>
            </>
          )}
        </div>

        <button className="nut-tro-ve" onClick={onBack || onGoHome}>
          <ArrowLeft size={15} />
          <span>Quay lại</span>
        </button>
      </nav>

      {/* Tieu de */}
      <header className="pp-head">
        <div>
          <h1>{category === 'Tất cả' ? 'TẤT CẢ SẢN PHẨM' : category.toUpperCase()}</h1>
          <p>
            {loading ? 'Đang tải…' : <><strong>{shown.length}</strong> sản phẩm</>}
            {activeCount > 0 && !loading ? ` · ${activeCount} bộ lọc đang bật` : ''}
          </p>
        </div>

        <div className="pp-tools">
          <div className="pp-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm trong danh sách…"
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Xóa tìm kiếm"><X size={14} /></button>
            )}
          </div>

          <select value={sort} onChange={(e) => setSort(e.target.value)} className="pp-sort">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <button className="pp-filter-btn mobile-flex" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal size={15} />
            Bộ lọc{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
      </header>

      {/* Thanh chọn nhanh danh mục, thấy ngay cả trên điện thoại */}
      <div className="pp-cats">
        {categories.map((c) => (
          <button key={c} className={category === c ? 'on' : ''} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <div className="pp-body">
        {/* Bo loc ben trai - may tinh */}
        <aside className="pp-side desktop-only">
          <div className="pp-side-head">
            <span>BỘ LỌC</span>
            {activeCount > 0 && <button onClick={clearAll}>Xóa hết</button>}
          </div>
          {filterPanel}
        </aside>

        {/* Ket qua */}
        <section className="pp-results">
          {chips.length > 0 && (
            <div className="pp-chips">
              {chips.map((c) => (
                <button key={c.k} onClick={c.bo}>{c.label} <X size={12} /></button>
              ))}
              <button className="pp-chips-clear" onClick={clearAll}>Xóa hết</button>
            </div>
          )}
          {loading ? (
            <div className="pp-empty"><p>Đang tải sản phẩm…</p></div>
          ) : shown.length === 0 ? (
            <div className="pp-empty">
              <PackageSearch size={40} />
              <p className="pp-empty-title">Không tìm thấy sản phẩm phù hợp</p>
              <p>Thử bỏ bớt bộ lọc hoặc đổi từ khóa tìm kiếm</p>
              {activeCount > 0 && (
                <button className="btn-primary" onClick={clearAll}>Xóa tất cả bộ lọc</button>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {shown.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Bang loc truot len - dien thoai */}
      {filterOpen && (
        <div className="pp-sheet-overlay" onClick={() => setFilterOpen(false)}>
          <div className="pp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pp-sheet-head">
              <strong>Bộ lọc</strong>
              <button onClick={() => setFilterOpen(false)} aria-label="Đóng bộ lọc"><X size={20} /></button>
            </div>
            <div className="pp-sheet-body">{filterPanel}</div>
            <div className="pp-sheet-foot">
              <button className="pp-clear" onClick={clearAll}>Xóa hết</button>
              <button className="btn-primary" onClick={() => setFilterOpen(false)}>
                Xem {shown.length} sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
