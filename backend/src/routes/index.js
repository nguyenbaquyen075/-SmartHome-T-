// Gom mọi nhóm route vào /api. Thứ tự giữ như cũ; route nào cần đăng nhập đã gắn canQuyen trong từng file.
const { Router } = require('express');

const api = Router();
for (const nhom of ['quanTri', 'heThong', 'congTrinh', 'caiDat', 'taiLen', 'danhMuc', 'ghiChu', 'chamCong', 'saoLuu', 'khachHang', 'sanPham', 'giaiTri']) {
  api.use(require(`./${nhom}`));
}

module.exports = api;
