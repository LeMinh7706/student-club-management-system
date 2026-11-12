
const express = require("express");
const router = express.Router();

const {
  registerEvent,
  getEventRegistrations,
  cancelEventRegistration,
  checkInByToken,
  getRegistrationQRCode,
} = require("../controllers/eventRegistrationController");

// Đăng ký tham gia sự kiện
router.post("/:eventId/register", registerEvent);

// Lấy danh sách sinh viên đăng ký sự kiện
router.get("/:eventId/registrations", getEventRegistrations);

// Hủy đăng ký sự kiện
router.patch(
  "/registrations/:registrationId/cancel",
  cancelEventRegistration
);

// Xác nhận điểm danh bằng QR Code
router.post("/check-in", checkInByToken);

// Lấy ảnh QR Code của lượt đăng ký
router.get(
  "/registrations/:registrationId/qr",
  getRegistrationQRCode
);

module.exports = router;
