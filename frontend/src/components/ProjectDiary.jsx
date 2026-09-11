import React, { useState, useEffect, useRef } from 'react';
import { HardHat, MapPin, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

const formatDate = (iso) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export default function ProjectDiary() {
  const [projects, setProjects] = useState([]);
  const trackRef = useRef(null);

  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .catch(() => setProjects([]));   // loi API thi an muc nay, khong pha trang
  }, []);

  // Cuon dung 1 the: lay do rong that cua the dau tien nen khong phu thuoc breakpoint
  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.diary-card');
    const step = card ? card.offsetWidth + 14 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (projects.length === 0) return null;

  return (
    <section style={{ marginTop: '28px', marginBottom: '8px' }}>
      {/* Tieu de muc */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ color: '#0066cc', display: 'flex' }}>
            <HardHat size={20} />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
            NHẬT KÝ THI CÔNG
          </h2>
        </div>

        {/* Nut lui/toi - an tren dien thoai vi da vuot tay duoc */}
        <div className="desktop-only" style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => scrollByCard(-1)}
            aria-label="Xem công trình trước"
            className="diary-nav-btn"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            aria-label="Xem công trình tiếp theo"
            className="diary-nav-btn"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Bang luot ngang */}
      <div className="diary-track" ref={trackRef}>
        {projects.map((p) => (
          <article key={p.id} className="diary-card">
            <div className="diary-thumb">
              <img src={p.image} alt={p.title} loading="lazy" decoding="async" />
              <span className="diary-status">
                <CheckCircle2 size={12} />
                {p.status}
              </span>
            </div>

            <div className="diary-body">
              <div className="diary-date">
                <CalendarDays size={13} />
                <span>{formatDate(p.startDate)}</span>
                {p.durationDays ? <span className="diary-dur">· {p.durationDays} ngày</span> : null}
              </div>

              <h3 className="diary-title">{p.title}</h3>

              <div className="diary-addr">
                <MapPin size={13} />
                <span>{p.address}</span>
              </div>

              {p.customerType ? <div className="diary-type">{p.customerType}</div> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
