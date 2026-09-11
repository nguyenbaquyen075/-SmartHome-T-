import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Check, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { formatPrice, api } from '../utils/api';
import AdminProjects from './AdminProjects';
import AdminSettings from './AdminSettings';

export default function AdminDashboard({ onClose, onProductChange }) {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bao, setBao] = useState(null);

  const hienBao = (message, type = 'success') => {
    setBao({ message, type });
    setTimeout(() => setBao(null), 3000);
  };

  const dangXuat = async () => {
    await api.logout();
    onClose();
  };

  // New Product Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: 'Sony',
    category: 'Mirrorless',
    price: '',
    originalPrice: '',
    inStock: 10,
    tag: 'Mới',
    featured: false,
    image: '/images/panasonic_camera.jpg',
    description: '',
    sensor: 'Full-Frame Exmor R CMOS 33MP',
    video: '4K 60p 10-bit',
    ibis: 'Chống rung 5 trục 5.5 stops',
    mount: 'Sony E-mount'
  });

  // Editing state for quick inline edit
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsRes, statsRes, projRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/stats').then((r) => r.json()),
        fetch('/api/projects').then((r) => r.json())
      ]);
      setProducts(prodsRes);
      setStats(statsRes);
      setProjects(projRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    try {
      const payload = {
        name: newProduct.name,
        brand: newProduct.brand,
        category: newProduct.category,
        price: Number(newProduct.price),
        originalPrice: Number(newProduct.originalPrice) || Number(newProduct.price),
        inStock: Number(newProduct.inStock) || 1,
        tag: newProduct.tag,
        featured: newProduct.featured,
        image: newProduct.image,
        description: newProduct.description,
        specs: {
          sensor: newProduct.sensor,
          video: newProduct.video,
          ibis: newProduct.ibis,
          mount: newProduct.mount
        }
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAddingProduct(false);
        setNewProduct({
          name: '',
          brand: 'Sony',
          category: 'Mirrorless',
          price: '',
          originalPrice: '',
          inStock: 10,
          tag: 'Mới',
          featured: false,
          image: '/images/panasonic_camera.jpg',
          description: '',
          sensor: 'Full-Frame Exmor R CMOS 33MP',
          video: '4K 60p 10-bit',
          ibis: 'Chống rung 5 trục 5.5 stops',
          mount: 'Sony E-mount'
        });
        loadData();
        if (onProductChange) onProductChange();
      }
    } catch (err) {
      alert('Không thể tạo sản phẩm: ' + err.message);
    }
  };

  const handleUpdateProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: Number(editPrice),
          inStock: Number(editStock)
        })
      });
      if (res.ok) {
        setEditingId(null);
        loadData();
        if (onProductChange) onProductChange();
      }
    } catch (err) {
      alert('Lỗi cập nhật sản phẩm: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này khỏi danh mục không?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
        if (onProductChange) onProductChange();
      }
    } catch (err) {
      alert('Lỗi xóa sản phẩm: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content adm-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px'
        }}
      >
        {/* Top bar */}
        <div className="adm-topbar">
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-amber">Admin Portal</span>
              <h2 className="adm-tieude">Quản trị website</h2>
            </div>
            <p className="adm-phude">Quản lý sản phẩm, công trình và giao diện trang chủ</p>
          </div>
          <div className="adm-topbar-nut">
            <button onClick={loadData} className="btn-secondary" style={{ padding: '8px 12px' }} title="Làm mới">
              <RefreshCw size={15} />
            </button>
            <button onClick={dangXuat} className="adm-dangxuat">Đăng xuất</button>
            <button onClick={onClose} className="btn-icon" style={{ width: '36px', height: '36px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
            gap: '14px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '10px', color: '#f59e0b' }}>
                <Package size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tổng Thiết Bị</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{stats.totalProducts} ({stats.totalStock} tồn)</div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: '10px', color: '#f43f5e' }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sắp Hết Hàng</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f43f5e' }}>
                  {stats.lowStockCount} sản phẩm
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '16px'
        }}>
          <div className="adm-tabs">
            {[
              { key: 'products', nhan: `Sản phẩm (${products.length})` },
              { key: 'projects', nhan: `Nhật ký thi công (${projects.length})` },
              { key: 'settings', nhan: 'Banner & thanh chạy' }
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={activeTab === t.key ? 'on' : ''}
              >
                {t.nhan}
              </button>
            ))}
          </div>

          {activeTab === 'products' && (
            <button
              onClick={() => setIsAddingProduct(!isAddingProduct)}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              <span>{isAddingProduct ? 'Đóng form' : 'Thêm máy ảnh mới'}</span>
            </button>
          )}
        </div>

        {/* Tab Content Container */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Add Product Form */}
          {activeTab === 'products' && isAddingProduct && (
            <form onSubmit={handleCreateProduct} style={{
              background: 'rgba(20, 28, 43, 0.95)',
              border: '1px solid #f59e0b',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: '#fbbf24' }}>
                Nhập thông số máy ảnh mới
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tên sản phẩm *</label>
                  <input
                    type="text"
                    placeholder="VD: Sony Alpha A9 III"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="input-control"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Thương hiệu</label>
                  <select
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="input-control"
                  >
                    <option value="Sony">Sony</option>
                    <option value="Canon">Canon</option>
                    <option value="Fujifilm">Fujifilm</option>
                    <option value="Nikon">Nikon</option>
                    <option value="DJI">DJI</option>
                    <option value="Blackmagic">Blackmagic</option>
                    <option value="Godox">Godox</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Danh mục</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="input-control"
                  >
                    <option value="Mirrorless">Mirrorless</option>
                    <option value="Cinema">Cinema</option>
                    <option value="Medium Format">Medium Format</option>
                    <option value="Action/Vlog">Action/Vlog</option>
                    <option value="Ống Kính">Ống Kính</option>
                    <option value="Phụ Kiện">Phụ Kiện</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    placeholder="VD: 55000000"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="input-control"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Số lượng tồn kho</label>
                  <input
                    type="number"
                    value={newProduct.inStock}
                    onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.value })}
                    className="input-control"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cảm biến (Sensor)</label>
                  <input
                    type="text"
                    value={newProduct.sensor}
                    onChange={(e) => setNewProduct({ ...newProduct, sensor: e.target.value })}
                    className="input-control"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Quay Video</label>
                  <input
                    type="text"
                    value={newProduct.video}
                    onChange={(e) => setNewProduct({ ...newProduct, video: e.target.value })}
                    className="input-control"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ảnh sản phẩm (URL)</label>
                  <input
                    type="text"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="input-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsAddingProduct(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          )}

          {/* Products List Table */}
          {activeTab === 'products' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <th style={{ padding: '10px' }}>Sản phẩm</th>
                    <th style={{ padding: '10px' }}>Thương hiệu</th>
                    <th style={{ padding: '10px' }}>Loại</th>
                    <th style={{ padding: '10px' }}>Giá bán</th>
                    <th style={{ padding: '10px' }}>Kho</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => {
                    const isEditing = editingId === prod.id;
                    return (
                      <tr 
                        key={prod.id}
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' }}
                      >
                        <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img 
                            src={prod.image} 
                            alt="" 
                            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} 
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#f8fafc' }}>{prod.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prod.id}</div>
                          </div>
                        </td>
                        <td style={{ padding: '10px' }}>{prod.brand}</td>
                        <td style={{ padding: '10px' }}>{prod.category}</td>
                        <td style={{ padding: '10px', color: '#f59e0b', fontWeight: 700 }}>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="input-control"
                              style={{ width: '130px', padding: '4px 8px' }}
                            />
                          ) : (
                            formatPrice(prod.price)
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="input-control"
                              style={{ width: '70px', padding: '4px 8px' }}
                            />
                          ) : (
                            <span style={{ color: prod.inStock <= 5 ? '#f43f5e' : '#10b981', fontWeight: 600 }}>
                              {prod.inStock} máy
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          {isEditing ? (
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => handleUpdateProduct(prod.id)}
                                className="btn-primary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              >
                                <Save size={14} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => {
                                  setEditingId(prod.id);
                                  setEditPrice(prod.price);
                                  setEditStock(prod.inStock);
                                }}
                                className="btn-secondary"
                                style={{ padding: '6px 8px' }}
                                title="Sửa giá & tồn kho"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                style={{
                                  background: 'rgba(244, 63, 94, 0.1)',
                                  border: '1px solid rgba(244, 63, 94, 0.2)',
                                  color: '#f43f5e',
                                  borderRadius: '6px',
                                  padding: '6px 8px',
                                  cursor: 'pointer'
                                }}
                                title="Xóa thiết bị"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'projects' && (
            <AdminProjects projects={projects} onReload={loadData} onBao={hienBao} />
          )}

          {activeTab === 'settings' && <AdminSettings onBao={hienBao} />}

        </div>

        {/* Thong bao ngan sau moi thao tac */}
        {bao && (
          <div className={`adm-bao ${bao.type}`}>{bao.message}</div>
        )}
      </div>
    </div>
  );
}
