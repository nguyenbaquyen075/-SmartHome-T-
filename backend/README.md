# Backend: cấu trúc MVC

Express 5, CommonJS. `index.js` chỉ khởi động máy chủ, toàn bộ code nằm trong `src/`.

```
backend/
├── index.js              Khởi động: mở kho dữ liệu → dựng app → mở cổng
├── src/
│   ├── config.js         Nơi DUY NHẤT đọc biến môi trường + đường dẫn thư mục
│   ├── app.js            Dựng Express: middleware chung → /api → ảnh tải lên → trang React → xử lý lỗi
│   ├── khoiDong.js       Việc chạy 1 lần lúc khởi động (mở kho, chuyển dữ liệu cũ, bật kho file)
│   │
│   ├── routes/           URL nào → quyền gì → controller nào. Mở file là thấy hết API của nhóm đó
│   ├── controllers/      Nhận yêu cầu, gọi model, trả JSON / file. Không tự đọc ghi kho
│   ├── models/           Đọc/ghi từng loại dữ liệu + làm sạch, kiểm tra dữ liệu gửi lên
│   ├── views/            Dựng file trả về (bảng công .xlsx, sao lưu ghi chú .zip)
│   ├── middleware/       xacThuc.js (canQuyen), loi.js (404 API, lỗi chung trả JSON)
│   ├── lib/              Hạ tầng: kho dữ liệu, kho file Neon S3, bucket riêng tư, Cloudinary, zip, xlsx
│   └── utils/            Hàm dùng chung: chuanHoa.js, hangDoi.js, loi.js
└── test/                 npm test: kho dữ liệu + toàn bộ API
```

## Một yêu cầu đi qua những đâu

```
GET /api/products?category=...
  → routes/sanPham.js        r.get('/products', c.danhSach)
  → controllers/sanPham.js   danhSach: res.json(sanPham.loc(sanPham.doc(), req.query))
  → models/sanPham.js        doc() đọc kho, loc() lọc + sắp xếp
  → lib/kho.js               bộ nhớ (Postgres) hoặc data/products.json
```

Route ghi dữ liệu luôn có `canQuyen` trước controller. Thiếu token hợp lệ thì trả 401 ngay.

## Các nhóm API

| Nhóm | Route | Controller | Model |
|---|---|---|---|
| Đăng nhập, tài khoản | `/admin/*` | quanTri | taiKhoan |
| Sản phẩm | `/products`, `/brands`, `/stats` | sanPham | sanPham |
| Danh mục | `/danh-muc`, `/categories` | danhMuc | danhMuc |
| Công trình | `/projects` | congTrinh | congTrinh |
| Cài đặt trang khách | `/settings` | caiDat | caiDat |
| Tải ảnh | `/tai-len/chu-ky`, `/upload`, `/anh/:id` | taiLen | tep, giaiTri |
| Ghi chú | `/ghi-chu*`, `/ghi-chu-thu-muc*`, `/ghi-chu-sao-luu` | ghiChu | ghiChu, tep |
| Chấm công | `/cham-cong*` | chamCong | chamCong |
| Khách hàng | `/khach-hang*` | khachHang | khachHang, tep |
| Sao lưu toàn bộ | `/sao-luu/*` | saoLuu | saoLuu |
| Hệ thống | `/health`, `/he-thong/dung-luong` | heThong | khachHang |
| Hậu trường | `/giai-tri*` | giaiTri | giaiTri |

## Thêm một API mới

1. **Model** (`models/`): hàm đọc/ghi + chuẩn hoá. Tên mục kho mới khai báo trong `models/tenKho.js`; muốn có trong
   bản sao lưu thì thêm vào `MUC` của `models/saoLuu.js`.
2. **Controller** (`controllers/`): nhận `req`, gọi model, trả `res`. Kho ghi hỏng thì trả `res.status(500).json(LOI_LUU)`.
3. **Route** (`routes/`): khai báo URL, gắn `canQuyen` nếu chỉ quản trị dùng. Nhóm mới thì thêm tên vào `routes/index.js`.
4. **Test** (`test/api.test.js`): thêm ca đọc, ghi, dữ liệu sai, chưa đăng nhập. Chạy `npm test`.

## Kiểm tra

```bash
npm test     # chép backend sang thư mục tạm rồi chạy server ở đó: dữ liệu thật trong data/ không bị đụng
```

Bài thử luôn chạy ở chế độ lưu file: nó bỏ `DATABASE_URL`, `NEON_S3_*`, `CLOUDINARY_URL` khỏi môi trường.
