// Điểm khởi động máy chủ. Cấu trúc MVC nằm trong src/ (xem src/app.js).
// Mở kho dữ liệu xong mới nhận khách, để không ai vào nhầm lúc trống trơn.
const { taoApp } = require('./src/app');
const { khoiDong } = require('./src/khoiDong');
const { PORT, RENDER_EXTERNAL_URL } = require('./src/config');

khoiDong().then(() => {
  taoApp().listen(PORT, '0.0.0.0', () => {
    console.log(`CameraTD Backend Server is running on http://localhost:${PORT}`);
    // Render gói Free cho web ngủ sau 15 phút không ai truy cập. Tự gọi vào địa chỉ công khai của chính mình
    // mỗi 10 phút (đi qua cổng của Render nên tính là có truy cập) để web không ngủ.
    // Chỉ chạy trên Render (có RENDER_EXTERNAL_URL); chạy ở máy mình thì bỏ qua.
    // ponytail: chỉ giữ cho web đang thức không ngủ lại; web đã ngủ thì cần UptimeRobot đánh thức
    if (RENDER_EXTERNAL_URL) {
      setInterval(() => {
        fetch(`${RENDER_EXTERNAL_URL}/api/categories`).catch(() => {});
      }, 10 * 60 * 1000).unref();
    }
  });
}).catch((err) => {
  console.error('Không mở được kho dữ liệu:', err.message);
  process.exit(1);
});
