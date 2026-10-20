// Dựng file .zip sao lưu ghi chú: mỗi thư mục 1 folder, mỗi ghi chú 1 folder gồm ghi-chu.txt
// (đọc được bằng Notepad/Word) + tệp đính kèm, kèm ghi-chu.json đầy đủ để nhập lại.
const { taoZip } = require('../lib/zipTinh');
const { tenAnToan, duyNhat } = require('../utils/chuanHoa');

// docTep(id) -> Buffer | null
const ghiChuZip = async (thuMuc, ghiChu, docTep) => {
  const muc = [];
  const daThuMuc = new Set();
  const tenThuMuc = new Map([['', 'Chưa phân loại']]);
  thuMuc.forEach((t) => tenThuMuc.set(t.id, duyNhat(daThuMuc, tenAnToan(t.ten, 'Thư mục'))));
  const daGhiChu = new Map();   // thư mục -> tên đã dùng

  for (const g of ghiChu) {
    const tm = tenThuMuc.get(g.thuMuc || '') || 'Chưa phân loại';
    if (!daGhiChu.has(tm)) daGhiChu.set(tm, new Set());
    const dir = `${tm}/${duyNhat(daGhiChu.get(tm), tenAnToan(g.tieuDe || String(g.noiDung).split('\n')[0], 'Ghi chú'))}`;
    const tepTen = new Map((g.dinhKem || []).map((t) => [t.id, t.ten]));
    const chu = String(g.noiDung || '').replace(/\[\[tep:([\w-]+)\]\]/g, (m, id) => `[Tệp đính kèm: ${tepTen.get(id) || 'đã xóa'}]`);
    muc.push({
      ten: `${dir}/ghi-chu.txt`,
      duLieu: Buffer.from(`${g.tieuDe || ''}\r\nCập nhật: ${g.suaLuc || ''}\r\n\r\n${chu.replace(/\n/g, '\r\n')}\r\n`, 'utf8')
    });
    const daTep = new Set();
    for (const t of g.dinhKem || []) {
      const buf = await docTep(t.id);
      if (!buf) continue;
      const duoi = t.ten.includes('.') ? `.${t.ten.split('.').pop()}` : '';
      const goc = duyNhat(daTep, tenAnToan(t.ten.slice(0, t.ten.length - duoi.length), 'tep'));
      muc.push({ ten: `${dir}/${goc}${duoi}`, duLieu: buf });
    }
  }
  muc.unshift({ ten: 'ghi-chu.json', duLieu: Buffer.from(JSON.stringify({ xuatLuc: new Date().toISOString(), thuMuc, ghiChu }, null, 2), 'utf8') });
  return taoZip(muc);
};

module.exports = { ghiChuZip };
