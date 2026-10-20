// API không khớp route nào -> 404 JSON, không rơi vào trang web (nếu không, gọi API sai
// sẽ nhận về index.html kèm status 200)
const khongTimThayApi = (req, res) => {
  res.status(404).json({ error: 'Không tìm thấy API: ' + req.originalUrl });
};

// Lỗi không lường trước (Express 5 tự chuyển lỗi của hàm async tới đây): trả JSON thay vì trang lỗi HTML,
// không lộ chi tiết lỗi ra ngoài; chi tiết ghi vào log máy chủ.
const xuLyLoi = (err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Dữ liệu gửi lên quá lớn' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Dữ liệu gửi lên không đúng định dạng' });
  if (res.headersSent) return next(err);
  // Lỗi có sẵn mã (VD: không tìm thấy file trang web = 404) thì giữ mã đó
  const ma = err.status || err.statusCode || 500;
  if (ma >= 500) console.error(`[LOI] ${req.method} ${req.originalUrl}:`, err);
  res.status(ma).json({ error: ma === 404 ? 'Không tìm thấy' : ma < 500 ? 'Yêu cầu không hợp lệ' : 'Máy chủ gặp lỗi, thử lại sau' });
};

module.exports = { khongTimThayApi, xuLyLoi };
