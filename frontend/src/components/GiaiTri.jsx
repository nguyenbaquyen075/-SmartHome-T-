import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Clapperboard, Play, Camera, X, ChevronLeft, ChevronRight, VolumeX } from 'lucide-react';
import { api, anhNho, videoNgan, xemDay, ngayVN } from '../utils/api';

// Hậu trường thi công kiểu story TikTok: anh đăng từ tab Giải trí trong quản trị
export default function GiaiTri() {
  const [ds, setDs] = useState([]);
  const [dangXem, setDangXem] = useState(null);   // vị trí bài đang mở, null = đóng
  const trackRef = useRef(null);

  useEffect(() => {
    api.getGiaiTri()
      .then(setDs)
      .catch(() => setDs([]));   // loi thi an muc nay, khong pha trang
  }, []);

  // Video xem trước tự chạy không tiếng khi lướt tới, ra khỏi màn thì dừng.
  // Đang mở xem toàn màn hình thì dừng hết cho đỡ nặng máy.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || dangXem !== null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const videos = track.querySelectorAll('video');
    const quan = new IntersectionObserver((muc) => muc.forEach((m) => (
      m.isIntersecting ? m.target.play().catch(() => {}) : m.target.pause()
    )), { threshold: 0.6 });
    videos.forEach((v) => quan.observe(v));
    return () => {
      quan.disconnect();
      videos.forEach((v) => v.pause());
    };
  }, [ds, dangXem]);

  // Cuộn đúng 1 thẻ: lấy độ rộng thật của thẻ nên không phụ thuộc breakpoint
  const cuonMotThe = (huong) => {
    const track = trackRef.current;
    const the = track?.querySelector('.gt-story');
    if (the) track.scrollBy({ left: huong * (the.offsetWidth + 12), behavior: 'smooth' });
  };

  if (ds.length === 0) return null;

  return (
    <section style={{ marginTop: '28px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ color: '#0066cc', display: 'flex' }}>
            <Clapperboard size={20} />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0066cc' }}>
            HẬU TRƯỜNG THI CÔNG
          </h2>
        </div>

        <div className="desktop-only" style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => cuonMotThe(-1)} aria-label="Xem bài trước" className="diary-nav-btn">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => cuonMotThe(1)} aria-label="Xem bài tiếp theo" className="diary-nav-btn">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="gt-track" ref={trackRef}>
        {ds.map((m, i) => (
          <button
            key={m.id}
            className="gt-story"
            onClick={() => setDangXem(i)}
            aria-label={m.chuThich || 'Xem hậu trường thi công'}
          >
            {m.loai === 'video'
              ? <video
                  src={videoNgan(m)}
                  poster={anhNho(m, 360, 16 / 9) || undefined}
                  muted
                  loop
                  playsInline
                  preload={anhNho(m) ? 'none' : 'metadata'}   // khong co anh bia thi tai khung hinh dau
                />
              : <img src={anhNho(m, 360, 16 / 9)} alt="" loading="lazy" decoding="async" />}

            <span className="gt-story-loai">
              {m.loai === 'video' ? <Play size={12} fill="#fff" /> : <Camera size={12} />}
            </span>

            <span className="gt-story-chu">
              {m.chuThich}
              <span className="gt-story-ngay">{ngayVN(m.ngay, true)}</span>
            </span>
          </button>
        ))}
      </div>

      {dangXem !== null && (
        <XemKieuTikTok ds={ds} batDau={dangXem} onClose={() => setDangXem(null)} />
      )}
    </section>
  );
}

function XemKieuTikTok({ ds, batDau, onClose }) {
  const khungRef = useRef(null);
  const [dangO, setDangO] = useState(batDau);

  // Mở ra đúng bài vừa bấm
  useLayoutEffect(() => {
    khungRef.current.scrollTop = batDau * khungRef.current.clientHeight;
  }, [batDau]);

  // Esc để đóng, mũi tên lên/xuống để sang bài, khóa cuộn nền phía sau
  useEffect(() => {
    const khung = khungRef.current;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        khung.scrollBy({ top: (e.key === 'ArrowDown' ? 1 : -1) * khung.clientHeight, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', onKey);
    const cuOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = cuOverflow;
    };
  }, [onClose]);

  // Bài nào chiếm phần lớn màn hình thì phát video của bài đó, bài khác dừng
  useEffect(() => {
    const quan = new IntersectionObserver((muc) => muc.forEach((m) => {
      const video = m.target.querySelector('video');
      if (m.isIntersecting) {
        setDangO(Number(m.target.dataset.i));
        video?.play().catch(() => {
          // Trình duyệt chặn tự phát có tiếng -> phát không tiếng, chạm vào để bật tiếng
          video.muted = true;
          m.target.dataset.tat = '1';
          video.play().catch(() => {});
        });
      } else {
        video?.pause();
      }
    }), { root: khungRef.current, threshold: 0.6 });
    khungRef.current.querySelectorAll('.gt-xem-bai').forEach((b) => quan.observe(b));
    return () => quan.disconnect();
  }, []);

  // Chạm video: đang tắt tiếng thì bật tiếng, còn không thì dừng / chạy tiếp
  const chamVideo = (e) => {
    const v = e.currentTarget;
    if (v.muted) {
      v.muted = false;
      delete v.parentElement.dataset.tat;
    } else if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  };

  return (
    <div className="gt-xem">
      <button className="ct-dong" onClick={onClose} aria-label="Đóng">
        <X size={28} strokeWidth={2.6} />
      </button>

      <span className="gt-xem-dem">
        {dangO + 1}/{ds.length}
        {ds.length > 1 && dangO === 0 ? ' · vuốt lên xem tiếp' : ''}
      </span>

      <div className="gt-xem-ds" ref={khungRef}>
        {ds.map((m, i) => (
          <section key={m.id} className="gt-xem-bai" data-i={i}>
            {m.loai === 'video' ? (
              <>
                <video
                  src={xemDay(m)}
                  poster={anhNho(m, 720, 16 / 9) || undefined}
                  loop
                  playsInline
                  preload="none"
                  onClick={chamVideo}
                  onPause={(e) => { e.currentTarget.parentElement.dataset.dung = '1'; }}
                  onPlay={(e) => { delete e.currentTarget.parentElement.dataset.dung; }}
                />
                <span className="gt-xem-play"><Play size={60} fill="#fff" /></span>
                <span className="gt-xem-tiengtat"><VolumeX size={16} /> Chạm để bật tiếng</span>
              </>
            ) : (
              <img
                src={xemDay(m)}
                alt={m.chuThich || 'Hậu trường thi công'}
                loading={Math.abs(i - batDau) > 1 ? 'lazy' : 'eager'}
              />
            )}

            <div className="gt-xem-chu">
              {m.chuThich && <p>{m.chuThich}</p>}
              <span>{ngayVN(m.ngay)}</span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
