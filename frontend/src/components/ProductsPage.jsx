import React, { useState, useEffect } from 'react';
import { Home, ChevronRight, SlidersHorizontal, X, Search, PackageSearch } from 'lucide-react';
import ProductCard from './ProductCard';
import { api } from '../utils/api';


const SORTS = [
  { value: '', label: 'Mặc định' },
  { value: 'name-asc', label: 'Tên A → Z' }
];

export default function ProductsPage({
  initialCategory = 'Tất cả',
  onViewDetails,
  onGoHome
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Tất cả']);
  const [brands, setBrands] = useState(['Tất cả']);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState('Tất cả');
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);   // chi dung tren dien thoai

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category !== 'Tất cả') params.category = category;
        if (brand !== 'Tất cả') params.brand = brand;
        if (sort) params.sort = sort;
        setProducts(await api.getProducts(params));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [category, brand, sort, search]);

  const activeCount =
    (category !== 'Tất cả' ? 1 : 0) +
    (brand !== 'Tất cả' ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const clearAll = () => {
    setCategory('Tất cả');
    setBrand('Tất cả');
    setSearch('');
    setSort('');
  };

  // Khoi bo loc dung chung cho ca sidebar may tinh lan bang truot dien thoai
  const filterPanel = (
    <>
      <div className="pp-filter-group">
        <h4>Danh mục</h4>
        {categories.map((c) => (
          <label key={c} className={`pp-radio ${category === c ? 'on' : ''}`}>
            <input type="radio" name="pp-cat" checked={category === c} onChange={() => setCategory(c)} />
            <span>{c}</span>
          </label>
        ))}
      </div>

      <div className="pp-filter-group">
        <h4>Thương hiệu</h4>
        {brands.map((b) => (
          <label key={b} className={`pp-radio ${brand === b ? 'on' : ''}`}>
            <input type="radio" name="pp-brand" checked={brand === b} onChange={() => setBrand(b)} />
            <span>{b}</span>
          </label>
        ))}
      </div>

    </>
  );

  return (
    <div className="container pp-wrap">
      {/* Duong dan */}
      <nav className="pp-crumb">
        <button onClick={onGoHome}><Home size={14} /> Trang chủ</button>
        <ChevronRight size={13} />
        <span>Sản phẩm</span>
        {category !== 'Tất cả' && (
          <>
            <ChevronRight size={13} />
            <span className="pp-crumb-cur">{category}</span>
          </>
        )}
      </nav>

      {/* Tieu de */}
      <header className="pp-head">
        <div>
          <h1>{category === 'Tất cả' ? 'TẤT CẢ SẢN PHẨM' : category.toUpperCase()}</h1>
          <p>
            {loading ? 'Đang tải…' : <><strong>{products.length}</strong> sản phẩm</>}
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
          {loading ? (
            <div className="pp-empty"><p>Đang tải sản phẩm…</p></div>
          ) : products.length === 0 ? (
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
              {products.map((p, i) => (
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
                Xem {products.length} sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
