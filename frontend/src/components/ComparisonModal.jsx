import React from 'react';
import { X, Trash2, SlidersHorizontal, Check } from 'lucide-react';

export default function ComparisonModal({
  compareList,
  onClose,
  onRemoveFromCompare,
  onClearCompare
}) {
  if (compareList.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '500px', padding: '30px', textAlign: 'center' }}
        >
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <SlidersHorizontal size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Chưa chọn máy ảnh so sánh</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
            Nhấp vào biểu tượng thanh trượt so sánh trên các sản phẩm máy ảnh để đặt cạnh nhau so sánh chi tiết cấu hình.
          </p>
          <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
            Quay Lại Chọn Máy Ảnh
          </button>
        </div>
      </div>
    );
  }

  const specRows = [
    { key: 'sensor', label: 'Cảm biến hình ảnh', isCustom: (p) => p.specs?.sensor || 'N/A' },
    { key: 'processor', label: 'Bộ vi xử lý', isCustom: (p) => p.specs?.processor || 'N/A' },
    { key: 'video', label: 'Quay phim Video', isCustom: (p) => p.specs?.video || 'N/A' },
    { key: 'ibis', label: 'Chống rung (IBIS)', isCustom: (p) => p.specs?.ibis || 'N/A' },
    { key: 'iso', label: 'Độ nhạy ISO', isCustom: (p) => p.specs?.iso || 'N/A' },
    { key: 'autofocus', label: 'Lấy nét tự động (AF)', isCustom: (p) => p.specs?.autofocus || 'N/A' },
    { key: 'mount', label: 'Ngàm ống kính', isCustom: (p) => p.specs?.mount || 'N/A' },
    { key: 'storage', label: 'Khe cắm thẻ nhớ', isCustom: (p) => p.specs?.storage || 'N/A' },
    { key: 'weight', label: 'Khối lượng thân máy', isCustom: (p) => p.specs?.weight || 'N/A' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1100px',
          padding: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SlidersHorizontal size={22} color="#f59e0b" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              So Sánh Thông Số Kỹ Thuật ({compareList.length}/3 máy)
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onClearCompare}
              style={{
                background: 'none',
                border: 'none',
                color: '#f43f5e',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={15} />
              Xóa tất cả
            </button>
            <button
              onClick={onClose}
              className="btn-icon"
              style={{ width: '32px', height: '32px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            minWidth: '600px'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ padding: '12px', width: '20%', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Thông số
                </th>
                {compareList.map((product) => (
                  <th key={product.id} style={{ padding: '12px', width: `${80 / compareList.length}%` }}>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <button
                        onClick={() => onRemoveFromCompare(product.id)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          background: 'rgba(244, 63, 94, 0.2)',
                          border: 'none',
                          color: '#f43f5e',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Bỏ máy này"
                      >
                        <X size={14} />
                      </button>
                      <div style={{
                        width: '100%',
                        height: '130px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: '#090d15'
                      }}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>
                      {product.brand}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                      {product.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specRows.map((row, idx) => (
                <tr 
                  key={row.key}
                  style={{
                    background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                    {row.label}
                  </td>
                  {compareList.map((product) => (
                    <td key={product.id} style={{
                      padding: '12px',
                      fontSize: '0.9rem',
                      color: row.key === 'price' ? '#f59e0b' : '#f1f5f9',
                      fontWeight: row.key === 'price' ? 800 : 500
                    }}>
                      {row.isCustom ? row.isCustom(product) : product[row.key] || 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
