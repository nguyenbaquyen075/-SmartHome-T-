import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import BottomBanner from './components/BottomBanner';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import ProjectDiary from './components/ProjectDiary';
import { api } from './utils/api';

// Tach khoi bundle dau: 3 man nay chi tai khi nguoi dung thuc su mo den,
// nho vay trang chu khong phai tai ~70KB code khong dung toi.
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));
const ComparisonModal = lazy(() => import('./components/ComparisonModal'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const ProductsPage = lazy(() => import('./components/ProductsPage'));
import { Flame, ArrowRight, Check, Info, Camera, Zap, Droplets } from 'lucide-react';

// 3 nhom hien o trang chu, ten khop voi 4 o DANH MUC SAN PHAM
const HOME_GROUPS = [
  { name: 'Thiết bị mạng', icon: Camera },
  { name: 'Thiết bị điện', icon: Zap },
  { name: 'Thiết bị nước', icon: Droplets }
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Active view product state (When user clicks a product, switch to detailed page)
  const [viewingProduct, setViewingProduct] = useState(null);

  // Trang danh sach san pham: null = dang o trang chu, chuoi = danh muc dang mo
  const [productsPageCat, setProductsPageCat] = useState(null);

  const openProductsPage = (cat = 'Tất cả') => {
    setViewingProduct(null);
    setProductsPageCat(cat);
    window.scrollTo({ top: 0 });
  };

  // Comparison state (up to 3 items)
  const [compareList, setCompareList] = useState([]);

  // Modals state
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Trang chu o muc "Tất cả": 3 nhom, moi nhom 2 san pham
  const [homeGroups, setHomeGroups] = useState([]);

  // Toast Notification
  const [toast, setToast] = useState(null);
  const productsRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Fetch products
  const fetchProductsList = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory !== 'Tất cả') params.category = selectedCategory;

      const data = await api.getProducts(params);
      setProducts(data);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductsList();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  // Lay 2 san pham dau moi nhom. Goi API thay vi loc o client vi backend
  // gom nhieu danh muc con vao 1 nhom (vd Thiết bị điện gom ca Đèn chiếu sáng).
  useEffect(() => {
    if (selectedCategory !== 'Tất cả' || searchTerm.trim()) {
      setHomeGroups([]);
      return;
    }
    let huy = false;
    Promise.all(
      HOME_GROUPS.map((g) =>
        api.getProducts({ category: g.name })
          .then((list) => ({ ...g, items: list.slice(0, 2) }))
          .catch(() => ({ ...g, items: [] }))
      )
    ).then((res) => {
      if (!huy) setHomeGroups(res.filter((g) => g.items.length > 0));
    });
    return () => { huy = true; };
  }, [selectedCategory, searchTerm]);

  // Sync with URL hash for direct product view
  useEffect(() => {
    if (products.length > 0) {
      const hash = window.location.hash;
      if (hash && hash.includes('product=')) {
        const prodId = hash.split('product=')[1];
        const found = products.find((p) => p.id === prodId);
        if (found) {
          setViewingProduct(found);
        }
      }
    }
  }, [products]);

  const handleSelectProduct = (product) => {
    setViewingProduct(product);
    if (product) {
      window.location.hash = `product=${product.id}`;
    } else {
      window.location.hash = '';
    }
  };

  const scrollToProducts = () => {
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f6f9' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#0066cc',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          animation: 'slideUp 0.2s ease-out'
        }}>
          {toast.type === 'error' ? <Info size={16} /> : <Check size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={(term) => {
          setSearchTerm(term);
          if (viewingProduct) setViewingProduct(null);
        }}
        compareList={compareList}
        setIsCompareOpen={setIsCompareOpen}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setViewingProduct(null);
        }}
      />

      {/* Chi tiet san pham > Trang danh sach san pham > Trang chu */}
      {viewingProduct ? (
        <Suspense fallback={null}>
        <ProductDetailPage
          product={viewingProduct}
          allProducts={products}
          onBack={() => handleSelectProduct(null)}
          onSelectProduct={handleSelectProduct}
        />
        </Suspense>
      ) : productsPageCat !== null ? (
        <Suspense fallback={null}>
          <ProductsPage
            initialCategory={productsPageCat}
            onViewDetails={handleSelectProduct}
            onGoHome={() => setProductsPageCat(null)}
          />
        </Suspense>
      ) : (
        <>
          {/* Hero Banner (Desktop 3-column + Mobile Slider) */}
          <HeroBanner
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              scrollToProducts();
            }}
            onViewCatalog={scrollToProducts}
          />

          {/* Main Catalog Section */}
          <main ref={productsRef} className="container" style={{ flex: 1, paddingTop: '10px' }}>
            {/* Category Section (Matching user design: DANH MỤC SẢN PHẨM + 4 cards) */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={(cat) => {
                setSelectedCategory(cat);
                scrollToProducts();
              }}
              onViewAll={openProductsPage}
            />

            {/* Tiêu đề SẢN PHẨM NỔI BẬT - ẩn khi đang hiện 3 nhóm (mỗi nhóm có tiêu đề riêng) */}
            <div style={{
              display: homeGroups.length > 0 ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ color: '#0066cc' }}>
                  <Flame size={20} fill="#0066cc" />
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                  SẢN PHẨM NỔI BẬT
                </h2>
              </div>

              <button
                onClick={() => openProductsPage('Tất cả')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0066cc',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <span>Xem tất cả</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Product Grid: Clicking card opens detailed page */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                <p>Đang tải dữ liệu thiết bị...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '50px 20px',
                background: '#fff',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                  Không tìm thấy sản phẩm phù hợp
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('Tất cả');
                    setSearchTerm('');
                  }}
                  className="btn-primary"
                  style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                >
                  Xem toàn bộ danh mục
                </button>
              </div>
            ) : homeGroups.length > 0 ? (
              /* Mục "Tất cả": 3 nhóm, mỗi nhóm 2 sản phẩm + nút sang trang sản phẩm của nhóm đó */
              homeGroups.map((group, gi) => (
                <section key={group.name} className="home-group">
                  <div className="home-group-head">
                    <div className="home-group-title">
                      <group.icon size={18} />
                      <h2>{group.name.toUpperCase()}</h2>
                    </div>
                    <button onClick={() => openProductsPage(group.name)}>
                      <span>Xem thêm</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="products-grid home-group-grid">
                    {group.items.map((product, i) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={gi * 2 + i}
                        onViewDetails={handleSelectProduct}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="products-grid">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onViewDetails={handleSelectProduct}
                  />
                ))}
              </div>
            )}

            {/* Nhật ký thi công */}
            <ProjectDiary />

            {/* Bottom Banner on Desktop */}
            <div className="desktop-only">
              <BottomBanner />
            </div>
          </main>
        </>
      )}

      {/* Footer */}
      <Footer />

      {/* Mobile Fixed Bottom Navigation Bar (Hidden on desktop) */}
      <div className="mobile-only">
        <MobileBottomNav
          activeTab={
            productsPageCat !== null ? 'products'
              : !viewingProduct && selectedCategory === 'Tất cả' ? 'home'
              : ''
          }
          onGoHome={() => {
            setViewingProduct(null);
            setProductsPageCat(null);
            setSelectedCategory('Tất cả');
            setSearchTerm('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenProducts={() => openProductsPage('Tất cả')}
          onToggleAdmin={() => setIsAdmin(!isAdmin)}
        />
      </div>

      {/* Comparison Modal */}
      {isCompareOpen && (
        <Suspense fallback={null}>
        <ComparisonModal
          compareList={compareList}
          onClose={() => setIsCompareOpen(false)}
          onRemoveFromCompare={(id) => setCompareList((prev) => prev.filter((p) => p.id !== id))}
          onClearCompare={() => setCompareList([])}
        />
        </Suspense>
      )}

      {/* Admin Dashboard */}
      {isAdmin && (
        <Suspense fallback={null}>
        <AdminDashboard
          onClose={() => setIsAdmin(false)}
          onProductChange={fetchProductsList}
        />
        </Suspense>
      )}
    </div>
  );
}
