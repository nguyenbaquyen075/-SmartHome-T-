// Hàng đợi ghi tuần tự: các yêu cầu bấm liên tục phải ghi lần lượt,
// không thì yêu cầu sau đọc bản cũ rồi đè mất thay đổi của yêu cầu trước.
const taoHangDoi = () => {
  let hang = Promise.resolve();
  return (viec) => (hang = hang.then(viec, viec));
};

module.exports = { taoHangDoi };
