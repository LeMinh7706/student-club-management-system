
const express = require("express");
const router = express.Router();

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

// Lấy danh sách sự kiện
router.get("/", getAllEvents);

// Tạo sự kiện mới
router.post("/", createEvent);

// Lấy thông tin một sự kiện
router.get("/:id", getEventById);

// Cập nhật sự kiện
router.put("/:id", updateEvent);

// Xóa sự kiện
router.delete("/:id", deleteEvent);

module.exports = router;
