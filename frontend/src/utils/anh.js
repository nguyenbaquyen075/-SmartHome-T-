// Nén ảnh ngay trên máy trước khi gửi lên server.
// Ảnh chụp điện thoại 4MB còn khoảng 250KB: kho chứa được nhiều hơn chục lần,
// khách mở web cũng nhanh hơn, mà nhìn trên màn hình không khác gì.
const RONG_TOI_DA = 1600;      // cạnh dài nhất, đủ nét cho cả màn hình to
const CHAT_LUONG = 0.82;       // 0-1, 0.82 là mức mắt thường không thấy khác
const NHE_KHOI_NEN = 400 * 1024;

const docFile = (file) => new Promise((xong, hong) => {
  const doc = new FileReader();
  doc.onload = () => xong(doc.result);
  doc.onerror = () => hong(new Error('Không đọc được ảnh'));
  doc.readAsDataURL(file);
});

const taoAnh = (src) => new Promise((xong, hong) => {
  const img = new Image();
  img.onload = () => xong(img);
  img.onerror = () => hong(new Error('Ảnh hỏng'));
  img.src = src;
});

// Tra ve chuoi "data:image/..." de gui thang len /api/upload
export const nenAnh = async (file) => {
  const goc = await docFile(file);

  let anh;
  try {
    anh = await taoAnh(goc);
  } catch {
    return goc;   // trình duyệt không mở được thì cứ gửi nguyên ảnh gốc
  }

  const tiLe = Math.min(1, RONG_TOI_DA / Math.max(anh.width, anh.height));
  // Ảnh đã nhỏ lại nhẹ sẵn thì đừng đụng vào cho khỏi mờ
  if (tiLe === 1 && file.size <= NHE_KHOI_NEN) return goc;

  const khung = document.createElement('canvas');
  khung.width = Math.round(anh.width * tiLe);
  khung.height = Math.round(anh.height * tiLe);
  const but = khung.getContext('2d');
  // PNG hay có nền trong suốt -> giữ nguyên PNG; ảnh chụp thì xuất JPG cho nhẹ
  const kieu = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  if (kieu === 'image/jpeg') {
    but.fillStyle = '#fff';
    but.fillRect(0, 0, khung.width, khung.height);
  }
  but.drawImage(anh, 0, 0, khung.width, khung.height);

  const nho = khung.toDataURL(kieu, CHAT_LUONG);
  // Hi hữu nén xong lại nặng hơn (ảnh gốc đã tối ưu sẵn) -> giữ ảnh gốc
  return nho.length < goc.length ? nho : goc;
};

// Nén rồi trả về dạng File để gửi nguyên file (mục Hậu trường gửi thẳng, không qua base64)
export const nenAnhFile = async (file) => {
  const nho = await nenAnh(file);
  const khoi = await (await fetch(nho)).blob();
  if (khoi.size >= file.size) return file;
  const ten = file.name.replace(/\.\w+$/, '') + (khoi.type === 'image/png' ? '.png' : '.jpg');
  return new File([khoi], ten, { type: khoi.type });
};

// Cho lời nhắn kiểu "4,2MB → 260KB"
export const coFile = (soByte) =>
  soByte >= 1024 * 1024 ? `${(soByte / 1024 / 1024).toFixed(1)}MB` : `${Math.round(soByte / 1024)}KB`;

// Chuoi data:... dai hon so byte that ~33% vi ma hoa base64
export const coDataUrl = (chuoi) => Math.round((chuoi.length - chuoi.indexOf(',') - 1) * 0.75);
