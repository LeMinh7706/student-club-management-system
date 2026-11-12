const express = require("express");
const router = express.Router();

const {
  getAllClubs,
  getClubById,
  registerClub,
  getClubMemberships,
  approveMembership,
  rejectMembership,
} = require("../controllers/clubController");

// Lấy danh sách câu lạc bộ
router.get("/", getAllClubs);

// Lấy danh sách yêu cầu tham gia CLB
router.get("/:id/memberships", getClubMemberships);

// Duyệt yêu cầu tham gia CLB
router.patch(
  "/memberships/:membershipId/approve",
  approveMembership
);

// Từ chối yêu cầu tham gia CLB
router.patch(
  "/memberships/:membershipId/reject",
  rejectMembership
);

// Đăng ký tham gia câu lạc bộ
router.post("/:id/register", registerClub);

// Lấy thông tin một câu lạc bộ
router.get("/:id", getClubById);

module.exports = router;