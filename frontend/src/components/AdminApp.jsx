import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu, X, Plus, LayoutDashboard, Megaphone, Image, Package, HardHat, Clapperboard, LogOut, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { api, adminToken } from '../utils/api';
import AdminLogin from './AdminLogin';
import AdminTongQuan from './AdminTongQuan';
import AdminSanPham from './AdminSanPham';
import AdminProjects from './AdminProjects';
import AdminGiaiTri from './AdminGiaiTri';
import AdminSettings from './AdminSettings';
import AdminCaiDat from './AdminCaiDat';
import '../admin.css';

// Menu ☰: các mục của trang chủ xếp đúng thứ tự từ trên xuống như khách thấy.
// "them" = có nút + mở thẳng trang thêm mới.
const MENU = [
  {
    nhom: 'Chung',
    muc: [
      { duong: 'tong-quan', nhan: 'Tổng quan', moTa: 'Số liệu và việc cần bổ sung', Icon: LayoutDashboard },
      { duong: 'cai-dat', nhan: 'Cài đặt & bảo mật', moTa: 'Tài khoản, mật khẩu, nơi cất dữ liệu', Icon: ShieldCheck }
    ]
  },
  {
    nhom: 'Trang chủ · từ trên xuống',
    muc: [
      { duong: 'thanh-chay', nhan: 'Thanh chữ chạy', moTa: 'Dòng thông báo chạy trên banner', Icon: Megaphone },
      { duong: 'banner', nhan: 'Ảnh banner', moTa: 'Ảnh lớn ở đầu trang chủ', Icon: Image },
      { duong: 'san-pham', nhan: 'Sản phẩm', moTa: 'Ảnh, thông số, mô tả chi tiết', Icon: Package, them: true },
      { duong: 'cong-trinh', nhan: 'Nhật ký thi công', moTa: 'Công trình đã làm', Icon: HardHat, them: true },
      { duong: 'giai-tri', nhan: 'Hậu trường thi công', moTa: 'Ảnh, video giải trí', Icon: Clapperboard }
    ]
  }
];
const TAT_CA_MUC = MENU.flatMap((n) => n.muc);

// Trang con nam sau dau #, vd "#/san-pham/moi" -> ['san-pham', 'moi'].
// Dung hash nen khong can thu vien router, bam Back hay tai lai trang van giu dung cho.
const docDuong = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
const diToi = (...phan) => { window.location.hash = '/' + phan.join('/'); };

export default function AdminApp() {
  const [daVao, setDaVao] = useState(null);   // null = đang kiểm tra phiên đăng nhập
  const [duong, setDuong] = useState(docDuong);
  const [moMenu, setMoMenu] = useState(false);
  const [bao, setBao] = useState(null);

  useEffect(() => {
    document.title = 'Quản trị · Điện Nước Camera';
    api.checkLogin().then(setDaVao);
    const doiTrang = () => {
      setDuong(docDuong());
      setMoMenu(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', doiTrang);
    return () => window.removeEventListener('hashchange', doiTrang);
  }, []);

  // Menu đang mở: Esc để đóng, khóa cuộn trang phía sau
  useEffect(() => {
    if (!moMenu) return;
    const onKey = (e) => e.key === 'Escape' && setMoMenu(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [moMenu]);

  const hienBao = useCallback((message, type = 'success') => {
    // Phiên hết hạn (api đã xóa token) -> đưa về trang đăng nhập
    if (type === 'error' && !adminToken.get()) setDaVao(false);
    setBao({ message, type });
    setTimeout(() => setBao(null), 3000);
  }, []);

  const dangXuat = async () => {
    setMoMenu(false);
    await api.logout();
    setDaVao(false);
  };

  if (daVao === null) return <div className="qt-cho">Đang tải…</div>;
  if (!daVao) return <AdminLogin onSuccess={() => setDaVao(true)} />;

  const [dau, ...con] = duong;
  // Trang thêm/sửa tự có nút về danh sách; các trang còn lại quay về Tổng quan
  const laForm = Boolean(con[0]) && con[0] !== 'loc';
  const hienTai = TAT_CA_MUC.find((m) => m.duong === dau) || TAT_CA_MUC[0];
  const trang = hienTai.duong;
  const chung = { onBao: hienBao, diToi };
  const dongMenu = () => setMoMenu(false);

  const logo = (
    <a className="qt-logo" href="#/tong-quan" onClick={dongMenu}>
      <img src="/images/logoTD.png" alt="" onError={(e) => { e.currentTarget.hidden = true; }} />
      <span><b>Quản trị</b></span>
    </a>
  );

  return (
    <div className="qt">
      <header className="qt-dau">
        <div className="qt-dau-trong">
          <button
            className="qt-ba-soc"
            onClick={() => setMoMenu(true)}
            aria-label="Mở menu quản trị"
            aria-expanded={moMenu}
          >
            <Menu size={22} />
          </button>
          {logo}
          <span className="qt-dau-trang">
            <hienTai.Icon size={16} /> {hienTai.nhan}
          </span>
        </div>
      </header>

      {moMenu && (
        <>
          <div className="qt-nen-menu" onClick={dongMenu} />
          <nav className="qt-menu" aria-label="Menu quản trị">
            <div className="qt-menu-dau">
              {logo}
              <button className="qt-menu-dong" onClick={dongMenu} aria-label="Đóng menu"><X size={20} /></button>
            </div>

            <div className="qt-menu-than">
              {MENU.map((n) => (
                <div key={n.nhom}>
                  <p className="qt-menu-nhom">{n.nhom}</p>
                  {n.muc.map(({ duong: d, nhan, moTa, Icon, them }) => (
                    <div key={d} className={`qt-menu-muc${trang === d ? ' on' : ''}`}>
                      <a href={`#/${d}`} onClick={dongMenu} aria-current={trang === d ? 'page' : undefined}>
                        <span className="qt-menu-icon"><Icon size={18} /></span>
                        <span className="qt-menu-chu">
                          <strong>{nhan}</strong>
                          <small>{moTa}</small>
                        </span>
                      </a>
                      {them && (
                        <a
                          className="qt-menu-them"
                          href={`#/${d}/moi`}
                          onClick={dongMenu}
                          title={`Thêm ${nhan.toLowerCase()}`}
                          aria-label={`Thêm ${nhan.toLowerCase()}`}
                        >
                          <Plus size={17} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="qt-menu-chan">
              <a href="/"><ArrowLeft size={17} /> Về trang web</a>
              <button onClick={dangXuat} className="dang-xuat"><LogOut size={17} /> Đăng xuất</button>
            </div>
          </nav>
        </>
      )}

      <main className="qt-than">
        {trang !== 'tong-quan' && !laForm && (
          <a className="qt-quaylai" href="#/tong-quan"><ArrowLeft size={15} /> Quay lại Tổng quan</a>
        )}
        {trang === 'tong-quan' && <AdminTongQuan {...chung} />}
        {trang === 'san-pham' && <AdminSanPham {...chung} con={con} />}
        {trang === 'cong-trinh' && <AdminProjects {...chung} con={con} />}
        {trang === 'giai-tri' && <AdminGiaiTri onBao={hienBao} />}
        {trang === 'cai-dat' && <AdminCaiDat onBao={hienBao} />}
        {(trang === 'thanh-chay' || trang === 'banner') && (
          <>
            <div className="qt-tieude">
              <div>
                <h1>{hienTai.nhan}</h1>
                <p>{hienTai.moTa}</p>
              </div>
            </div>
            <div className="qt-khung">
              <AdminSettings key={trang} onBao={hienBao} phan={trang === 'banner' ? 'banner' : 'ticker'} />
            </div>
          </>
        )}
      </main>

      {bao && <div className={`adm-bao ${bao.type}`} role="status">{bao.message}</div>}
    </div>
  );
}
