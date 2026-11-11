
const express = require("express");
const router = express.Router();

const {
  getAllClubs,
  getClubById,
  registerClub,
} = require("../controllers/clubController");

// Lấy danh sách câu lạc bộ
router.get("/", getAllClubs);
// Đăng ký tham gia câu lạc bộ
router.post("/:id/register", registerClub);
// Lấy thông tin một câu lạc bộ
router.get("/:id", getClubById);

module.exports = router;
