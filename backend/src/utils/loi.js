// Kho hỏng (mất mạng, DB đầy...) thì báo thật cho quản trị, không báo "đã lưu" giả
const LOI_LUU = { error: 'Không lưu được dữ liệu, kiểm tra mạng rồi thử lại' };

module.exports = { LOI_LUU };
