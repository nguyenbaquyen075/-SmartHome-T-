import React, { useEffect } from 'react';
import { X, MapPin, CalendarDays, Clock, Building2, CheckCircle2 } from 'lucide-react';

const dinhDangNgay = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export default function ProjectDetail({ project, onClose }) {
  // Bấm Esc để đóng, và khóa cuộn nền cho khỏi trôi phía sau
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const cuOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = cuOverflow;
    };
  }, [onClose]);

  if (!project) return null;

  const thongTin = [
    { icon: CalendarDays, nhan: 'Ngày khởi công', giaTri: dinhDangNgay(project.startDate) },
    project.durationDays
      ? { icon: Clock, nhan: 'Thời gian thi công', giaTri: `${project.durationDays} ngày` }
      : null,
    project.customerType
      ? { icon: Building2, nhan: 'Loại công trình', giaTri: project.customerType }
      : null,
    { icon: MapPin, nhan: 'Địa chỉ', giaTri: project.address }
  ].filter(Boolean);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ct-chitiet" onClick={(e) => e.stopPropagation()}>
        <button className="ct-dong" onClick={onClose} aria-label="Đóng">
          <X size={28} strokeWidth={2.6} />
        </button>

        <div className="ct-anh">
          <img src={project.image} alt={project.title} />
          <span className="ct-trangthai">
            <CheckCircle2 size={13} />
            {project.status}
          </span>
        </div>

        <div className="ct-than">
          <h2>{project.title}</h2>

          <dl className="ct-tt">
            {thongTin.map((t) => (
              <div key={t.nhan}>
                <dt><t.icon size={15} /> {t.nhan}</dt>
                <dd>{t.giaTri}</dd>
              </div>
            ))}
          </dl>

          {project.description && (
            <div className="ct-mota">
              <h3>Nội dung thi công</h3>
              <p>{project.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
