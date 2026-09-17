// Du lieu dung chung cho trang chi tiet san pham va form quan tri
import React from 'react';
import { Moon, Droplets, ShieldCheck, Zap, Gauge, Sun, Clock, Ruler, Wifi, Wrench } from 'lucide-react';

export const DANH_MUC = ['Camera an ninh', 'Thiết bị điện', 'Đèn chiếu sáng', 'Thiết bị nước', 'Vật tư phụ', 'Phụ kiện'];
export const DON_VI = ['chiếc', 'cái', 'bộ', 'mét', 'cuộn', 'bóng', 'hộp'];

// Nhan tieng Viet cho khoa thong so cu (camelCase).
// Thong so nhap tu quan tri luu thang nhan tieng Viet lam khoa nen khong can bang nay.
export const NHAN_THONG_SO = {
  doPhanGiai: 'Độ phân giải', ongKinh: 'Ống kính', hongNgoai: 'Hồng ngoại',
  chongNuoc: 'Chống nước', ketNoi: 'Kết nối', tinhNang: 'Tính năng',
  luuTru: 'Lưu trữ', xuatXu: 'Xuất xứ', congSuat: 'Công suất',
  chatLieu: 'Chất liệu', nguon: 'Nguồn điện', quayQuet: 'Quay quét',
  amThanh: 'Âm thanh', soCuc: 'Số cực', dongDinhMuc: 'Dòng định mức',
  dongCatNganMach: 'Dòng cắt ngắn mạch', dienAp: 'Điện áp',
  quangThong: 'Quang thông', nhietDoMau: 'Nhiệt độ màu', duoiDen: 'Đuôi đèn',
  tuoiTho: 'Tuổi thọ', tietDien: 'Tiết diện', loiDong: 'Lõi đồng',
  lopVo: 'Lớp vỏ', dienApSuDung: 'Điện áp sử dụng', quyCach: 'Quy cách',
  loaiLapDat: 'Loại lắp đặt', apLucNuoc: 'Áp lực nước', baoHanh: 'Bảo hành',
  dayCao: 'Đẩy cao', luuLuongNuoc: 'Lưu lượng nước', duongKinhOng: 'Đường kính ống',
  kichCo: 'Kích cỡ', doDay: 'Độ dày', chieuDaiCay: 'Chiều dài cây',
  tieuChuan: 'Tiêu chuẩn', kichThuoc: 'Kích thước', phuKien: 'Phụ kiện',
  dauVao: 'Đầu vào', dauRa: 'Đầu ra', chanCam: 'Chân cắm',
  soKenh: 'Số kênh', chuanNen: 'Chuẩn nén', xuatHinh: 'Xuất hình', oCung: 'Ổ cứng'
};

export const doiNhan = (khoa) =>
  NHAN_THONG_SO[khoa] || khoa.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

// Khung thong so theo danh muc: [nhan, vi du]. Vi du chi dung lam goi y trong o nhap,
// khong dien san vao gia tri de khoi dang so lieu sai len web.
export const MAU_THONG_SO = {
  'Camera an ninh': [
    ['Độ phân giải', '2MP Full HD (1920 × 1080)'], ['Ống kính', '2.8mm, góc nhìn 103°'],
    ['Hồng ngoại', 'Smart IR 30m'], ['Chống nước', 'IP67'], ['Kết nối', 'RJ45 10/100M, hỗ trợ PoE'],
    ['Lưu trữ', 'Thẻ nhớ microSD tối đa 256GB'], ['Nguồn điện', '12V DC / PoE'],
    ['Tính năng', 'Phát hiện chuyển động, chống ngược sáng WDR']
  ],
  'Thiết bị điện': [
    ['Số cực', '1P'], ['Dòng định mức', '16A'], ['Dòng cắt ngắn mạch', '6kA'], ['Điện áp', '230/400V AC'],
    ['Tiết diện', '2 × 1.5mm²'], ['Lõi đồng', 'Nhiều sợi đồng mềm'], ['Lớp vỏ', 'PVC cách điện'], ['Xuất xứ', 'Việt Nam']
  ],
  'Đèn chiếu sáng': [
    ['Công suất', '9W'], ['Quang thông', '900lm'], ['Nhiệt độ màu', '6500K ánh sáng trắng'],
    ['Đuôi đèn', 'E27'], ['Tuổi thọ', '15.000 giờ'], ['Xuất xứ', 'Việt Nam']
  ],
  'Thiết bị nước': [
    ['Chất liệu', 'Inox 304'], ['Công suất', '125W'], ['Đẩy cao', '30m'], ['Lưu lượng nước', '30 lít/phút'],
    ['Đường kính ống', '25mm'], ['Loại lắp đặt', 'Gắn tường'], ['Áp lực nước', '0.5 - 5 bar'], ['Xuất xứ', 'Việt Nam']
  ],
  'Vật tư phụ': [
    ['Kích cỡ', 'D21 - D110'], ['Độ dày', '1.6 - 5.3mm'], ['Chiều dài cây', '4m'],
    ['Tiêu chuẩn', 'ISO 4422'], ['Chất liệu', 'Nhựa PVC']
  ],
  'Phụ kiện': [
    ['Kích thước', '11 × 11 × 5cm'], ['Chất liệu', 'Nhựa ABS'], ['Đầu vào', '100 - 240V AC'],
    ['Đầu ra', '12V - 2A'], ['Chân cắm', 'Jack DC 5.5mm'], ['Phụ kiện kèm theo', 'Vít, tắc kê']
  ]
};

// Bieu tuong cho 4 o noi bat. "hd" la khung chu HD (khong co trong lucide)
export const BIEU_TUONG = {
  hd: { ten: 'Chữ HD (hình ảnh)' },
  moon: { ten: 'Ban đêm', Icon: Moon },
  droplets: { ten: 'Nước', Icon: Droplets },
  shield: { ten: 'Tiêu chuẩn / bảo vệ', Icon: ShieldCheck },
  zap: { ten: 'Điện', Icon: Zap },
  gauge: { ten: 'Áp lực / đo lường', Icon: Gauge },
  sun: { ten: 'Ánh sáng', Icon: Sun },
  clock: { ten: 'Thời gian', Icon: Clock },
  ruler: { ten: 'Kích thước', Icon: Ruler },
  wifi: { ten: 'Kết nối', Icon: Wifi },
  wrench: { ten: 'Bảo hành', Icon: Wrench }
};

export function BieuTuong({ loai, size = 18 }) {
  if (loai === 'hd') return <span className="bt-hd">HD</span>;
  const { Icon } = BIEU_TUONG[loai]?.Icon ? BIEU_TUONG[loai] : BIEU_TUONG.shield;
  return <Icon size={size} color="#0066cc" style={{ flexShrink: 0 }} />;
}

// Dai 4 o noi bat duoi ten san pham - dung chung cho trang chi tiet va phan xem truoc trong quan tri
export function DaiNoiBat({ ds }) {
  if (!ds?.length) return null;
  return (
    <div className="pd-noibat">
      {ds.map((o, i) => (
        <div key={i} className="pd-noibat-o">
          <BieuTuong loai={o.bieuTuong} />
          <div>
            <span>{o.nhan}</span><br />
            <strong>{o.giaTri}</strong>{o.ghiChu && <small> {o.ghiChu}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Khung 4 o noi bat theo danh muc: [bieu tuong, nhan, vi du gia tri, vi du ghi chu]
export const MAU_NOI_BAT = {
  'Camera an ninh': [
    ['hd', 'Độ phân giải', '2MP', '(1920 x 1080)'], ['moon', 'Hồng ngoại', '30m', 'quan sát ban đêm'],
    ['droplets', 'Chuẩn chống nước', 'IP67', 'ngoài trời'], ['wrench', 'Bảo hành chính hãng', '24 tháng', '']
  ],
  'Thiết bị điện': [
    ['zap', 'Dòng định mức', '16A', ''], ['gauge', 'Khả năng cắt', '6kA', ''],
    ['shield', 'Tiêu chuẩn', 'IEC 60898-1', ''], ['wrench', 'Bảo hành chính hãng', '12 tháng', '']
  ],
  'Đèn chiếu sáng': [
    ['zap', 'Công suất', '9W', 'tiết kiệm điện'], ['sun', 'Quang thông', '900lm', ''],
    ['clock', 'Tuổi thọ', '15.000 giờ', ''], ['wrench', 'Bảo hành chính hãng', '24 tháng', '']
  ],
  'Thiết bị nước': [
    ['zap', 'Công suất', '125W', ''], ['gauge', 'Đẩy cao', '30m', ''],
    ['droplets', 'Lưu lượng', '30 lít/phút', ''], ['wrench', 'Bảo hành chính hãng', '12 tháng', '']
  ],
  'Vật tư phụ': [
    ['ruler', 'Kích cỡ', 'D21 - D110', ''], ['shield', 'Tiêu chuẩn', 'ISO 4422', ''],
    ['clock', 'Tuổi thọ', '50 năm', ''], ['wrench', 'Bảo hành', '12 tháng', '']
  ],
  'Phụ kiện': [
    ['ruler', 'Kích thước', '11 × 11cm', ''], ['droplets', 'Chống nước', 'IP66', ''],
    ['zap', 'Đầu ra', '12V - 2A', ''], ['wrench', 'Bảo hành', '12 tháng', '']
  ]
};

// Huong dan mau: dien san vao form khi chon danh muc, va dung cho san pham chua nhap huong dan
export const MAU_HUONG_DAN = {
  'Camera an ninh': [
    'Cố định camera lên tường và cắm nguồn điện 12V hoặc dây mạng PoE.',
    'Tải ứng dụng trên điện thoại qua App Store hoặc Google Play.',
    'Quét mã QR code in trên tem thân máy để kết nối.',
    'Đặt mật khẩu và bắt đầu xem video trực tiếp từ xa 24/7.'
  ],
  'Thiết bị điện': [
    'Ngắt cầu dao tổng trước khi lắp đặt.',
    'Lắp thiết bị lên thanh ray hoặc đế, siết chặt đầu cốt dây.',
    'Kiểm tra đúng tiết diện dây và đúng cực đấu nối.',
    'Đóng điện, chạy thử tải và kiểm tra nhiệt độ mối nối sau 30 phút.'
  ],
  'Đèn chiếu sáng': [
    'Tắt công tắc, ngắt điện trước khi thay bóng.',
    'Lắp bóng vào đuôi đèn phù hợp, vặn chặt vừa tay.',
    'Bật công tắc kiểm tra ánh sáng.',
    'Vệ sinh bề mặt bóng định kỳ bằng khăn khô.'
  ],
  'Thiết bị nước': [
    'Khóa van nước tổng trước khi lắp đặt.',
    'Quấn băng tan vào ren và lắp thiết bị vào đường ống.',
    'Mở van từ từ, kiểm tra rò rỉ tại các mối nối.',
    'Vệ sinh lưới lọc định kỳ để thiết bị chạy ổn định.'
  ],
  'Vật tư phụ': [
    'Đo và cắt ống đúng kích thước bằng dao hoặc cưa chuyên dụng.',
    'Làm sạch đầu ống và bôi keo dán đều.',
    'Lắp phụ kiện nối, giữ cố định khoảng 30 giây.',
    'Chờ keo khô hoàn toàn trước khi cho nước chạy qua.'
  ],
  'Phụ kiện': [
    'Kiểm tra thông số phù hợp với thiết bị cần dùng.',
    'Lắp đặt, cố định chắc chắn tại vị trí khô ráo.',
    'Đấu nối đúng cực, đúng cổng.',
    'Cấp nguồn và kiểm tra thiết bị hoạt động bình thường.'
  ]
};

export const BAO_HANH_MAC_DINH = { thoiGian: '24 tháng', doiTra: '1 đổi 1 trong 7 ngày' };

// Liet ke phan con thieu de quan tri biet can bo sung gi
export const thieuThongTin = (sp) => [
  !(sp.images?.length || sp.image) && 'ảnh',
  !sp.subTitle && 'mô tả ngắn',
  !sp.noiBat?.length && '4 ô nổi bật',
  !sp.description && 'giới thiệu',
  !sp.highlights?.length && 'đặc điểm',
  !Object.keys(sp.specs || {}).length && 'thông số',
  !sp.huongDan?.length && 'hướng dẫn'
].filter(Boolean);
