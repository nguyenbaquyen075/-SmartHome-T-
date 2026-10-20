// Tình trạng hệ thống: health check, dung lượng đang dùng (hiện trong Cài đặt)
const fs = require('fs');
const path = require('path');
const kho = require('../lib/kho');
const khoRiengTu = require('../lib/khoRiengTu');
const khachHang = require('../models/khachHang');
const { NEON_GIOI_HAN_MB, THU_MUC_DU_LIEU, THU_MUC_TEP } = require('../config');

const sucKhoe = (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
};

const dungLuong = async (req, res) => {
  try {
    const gioiHan = NEON_GIOI_HAN_MB * 1048576;
    const anhKhach = khachHang.tatCaAnh();
    const rieng = anhKhach.filter((a) => a.kho === 'rieng');
    const kq = {
      cheDo: kho.dangDungDB() ? 'db' : 'file',
      gioiHan: kho.dangDungDB() ? gioiHan : null,
      khoRieng: { bat: khoRiengTu.dangBat(), soAnh: rieng.length, byte: rieng.reduce((a, x) => a + (x.kichThuoc || 0), 0) },
      tongAnhKhach: anhKhach.length
    };
    if (kho.dangDungDB()) {
      const d = await kho.dungLuong();
      kq.tong = d.tong;
      kq.nhom = d.nhom;
    } else {
      const dem = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).reduce((a, f) => a + fs.statSync(path.join(dir, f)).size, 0) : 0);
      kq.tong = dem(THU_MUC_DU_LIEU) + dem(THU_MUC_TEP);
      kq.nhom = [];
    }
    res.json(kq);
  } catch (err) {
    console.error('Loi do dung luong:', err.message);
    res.status(500).json({ error: 'Không đo được dung lượng' });
  }
};

module.exports = { sucKhoe, dungLuong };
