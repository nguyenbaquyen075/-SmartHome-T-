// Nhật ký thi công
const congTrinh = require('../models/congTrinh');
const { LOI_LUU } = require('../utils/loi');

const danhSach = (req, res) => res.json(congTrinh.sapXep(congTrinh.doc()));

const them = async (req, res) => {
  const ds = congTrinh.doc();
  const moi = congTrinh.taoMoi(req.body);
  ds.push(moi);
  if (!(await congTrinh.ghi(ds))) return res.status(500).json(LOI_LUU);
  res.status(201).json(moi);
};

const sua = async (req, res) => {
  const ds = congTrinh.doc();
  const i = ds.findIndex((p) => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Không tìm thấy công trình' });
  ds[i] = { ...ds[i], ...req.body, id: ds[i].id };
  if (!(await congTrinh.ghi(ds))) return res.status(500).json(LOI_LUU);
  res.json(ds[i]);
};

const xoa = async (req, res) => {
  const ds = congTrinh.doc();
  const con = ds.filter((p) => p.id !== req.params.id);
  if (con.length === ds.length) return res.status(404).json({ error: 'Không tìm thấy công trình' });
  if (!(await congTrinh.ghi(con))) return res.status(500).json(LOI_LUU);
  res.json({ success: true });
};

module.exports = { danhSach, them, sua, xoa };
