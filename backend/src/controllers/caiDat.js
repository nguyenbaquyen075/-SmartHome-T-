// Cài đặt trang khách (thanh chạy, banner, số Gọi/Zalo): ai cũng đọc được, quản trị mới sửa
const caiDat = require('../models/caiDat');
const { LOI_LUU } = require('../utils/loi');

const xem = (req, res) => res.json(caiDat.doc());

const luu = async (req, res) => {
  const moi = caiDat.gop(req.body);
  if (!(await caiDat.ghi(moi))) return res.status(500).json(LOI_LUU);
  res.json(moi);
};

module.exports = { xem, luu };
