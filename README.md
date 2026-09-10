# ĐIỆN NƯỚC CAMERA

Website thương mại điện tử bán camera an ninh, thiết bị điện dân dụng, thiết bị nước và đèn chiếu sáng.

---

## 📁 Cấu trúc dự án

Dự án chia làm 2 phần độc lập:

```
cameraTD/
├── frontend/            👉 GIAO DIỆN (React + Vite)
│   ├── public/images/       Ảnh sản phẩm, banner
│   ├── src/
│   │   ├── components/      Các khối giao diện (Navbar, ProductCard, Footer...)
│   │   ├── utils/api.js     Nơi duy nhất gọi API xuống backend
│   │   ├── App.jsx          Khung trang chính
│   │   └── index.css        CSS chung + responsive cho điện thoại
│   └── package.json         Thư viện riêng của frontend
│
├── backend/             👉 API & DỮ LIỆU (Node.js + Express)
│   ├── index.js             Toàn bộ API + phục vụ bản build của frontend
│   ├── data/
│   │   ├── products.json    Danh sách sản phẩm
│   │   └── orders.json      Đơn hàng khách đặt
│   └── package.json         Thư viện riêng của backend
│
├── start.js             Chạy cả 2 phần cùng lúc (dùng khi code)
├── render.yaml          Cấu hình deploy lên Render
└── package.json         Script chung
```

**Quy tắc phân chia:**

| | Frontend | Backend |
|---|---|---|
| Chịu trách nhiệm | Hiển thị, giao diện, tương tác | Dữ liệu, lưu trữ, xử lý đơn |
| Ngôn ngữ | React (JSX) | Node.js (CommonJS) |
| Cổng khi dev | `5174` | `5001` |
| Sửa giao diện, màu sắc, layout | ✅ sửa ở đây | ❌ |
| Thêm/sửa sản phẩm, đơn hàng | ❌ | ✅ sửa ở đây |

Frontend **không bao giờ** gọi thẳng đến database. Mọi dữ liệu đi qua [frontend/src/utils/api.js](frontend/src/utils/api.js) → gọi `/api/...` → [backend/index.js](backend/index.js).

---

## 🚀 Cách chạy khi code

Cài thư viện lần đầu:

```bash
npm run install:all
```

Chạy cả frontend + backend cùng lúc:

```bash
npm run dev
```

Mở trình duyệt: **http://localhost:5174**

### Chạy riêng từng phần

Khi chỉ muốn sửa giao diện, hoặc chỉ muốn test API:

```bash
npm run dev:frontend    # chỉ giao diện  → cổng 5174
npm run dev:backend     # chỉ API        → cổng 5001
```

---

## 🌐 Deploy lên Render

Đã cấu hình sẵn trong [render.yaml](render.yaml). Chỉ cần:

1. Vào [render.com](https://render.com) → đăng nhập bằng GitHub
2. **New +** → **Web Service** → chọn repo này
3. Render tự đọc `render.yaml`. Nếu phải điền tay:
   - Build Command: `npm run build`
   - Start Command: `node backend/index.js` (hoặc `npm start`)
4. **Create Web Service** → đợi ~3-5 phút

> ⚠️ Nếu service đã tạo từ trước bằng nút *New → Web Service*, Render **không đọc** `render.yaml`.
> Muốn đổi lệnh chạy phải vào **Settings → Build & Deploy → Start Command** sửa tay.

Chạy chung **1 service duy nhất**: Express vừa trả API, vừa phục vụ bản build của React. Nhờ vậy không cần cấu hình CORS hay biến môi trường nào cả.

### ⚠️ Lưu ý gói Free

- **Đơn hàng sẽ mất khi deploy lại.** Đơn được lưu vào `backend/data/orders.json`, mà ổ đĩa Render là tạm thời — mỗi lần deploy hoặc restart, file quay về trạng thái trong Git. Muốn giữ đơn thật thì phải chuyển sang database (Render có Postgres miễn phí).
- **Service ngủ sau 15 phút** không có ai truy cập. Lần mở tiếp theo mất ~50 giây khởi động lại.

---

## 🔌 Danh sách API

| Method | Đường dẫn | Công dụng |
|---|---|---|
| GET | `/api/health` | Kiểm tra server sống |
| GET | `/api/products` | Danh sách sản phẩm (lọc theo `category`, `brand`, `search`...) |
| GET | `/api/products/:id` | Chi tiết 1 sản phẩm |
| POST | `/api/products` | Thêm sản phẩm |
| PUT | `/api/products/:id` | Sửa sản phẩm |
| DELETE | `/api/products/:id` | Xóa sản phẩm |
| GET | `/api/categories` | Danh sách danh mục |
| GET | `/api/brands` | Danh sách thương hiệu |
| GET | `/api/orders` | Danh sách đơn hàng |
| POST | `/api/orders` | Tạo đơn hàng mới |
| PUT | `/api/orders/:id` | Cập nhật trạng thái đơn |
| GET | `/api/stats` | Số liệu tổng quan cho trang quản trị |

---

## 🖼️ Lưu ý về ảnh

Ảnh đặt trong `frontend/public/images/`, gọi trong code bằng đường dẫn `/images/tên-file.jpg`.

Trước khi thêm ảnh mới, **nén lại** để trang không bị chậm (macOS có sẵn `sips`, không cần cài gì):

```bash
sips -Z 900 -s formatOptions 75 anh-moi.jpg
```

- `-Z 900` — thu chiều lớn nhất về 900px (ảnh sản phẩm hiển thị tối đa ~600px, không cần to hơn)
- `-s formatOptions 75` — nén chất lượng 75, mắt thường không thấy khác

Ảnh chụp thì luôn dùng `.jpg`, đừng dùng `.png` — cùng một tấm banner, PNG nặng gấp 4 lần JPG.
