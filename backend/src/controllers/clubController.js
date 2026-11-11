
const mongoose = require("mongoose");
const Club = require("../models/Club");
const Membership = require("../models/Membership");

// GET /api/clubs
const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find();

    res.status(200).json({
      success: true,
      message: "Get clubs successfully",
      data: clubs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get clubs",
      error: error.message,
    });
  }
};

// GET /api/clubs/:id
const getClubById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID",
      });
    }

    const club = await Club.findById(id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    res.status(200).json({
      success: true,
      data: club,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get club",
      error: error.message,
    });
  }
};


// POST /api/clubs/:id/register
const registerClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, studentEmail } = req.body;

    // Kiểm tra ID câu lạc bộ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID",
      });
    }

    // Kiểm tra thông tin sinh viên
    if (!studentName || !studentEmail) {
      return res.status(400).json({
        success: false,
        message: "Student name and email are required",
      });
    }

    // Kiểm tra câu lạc bộ có tồn tại không
    const club = await Club.findById(id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    // Kiểm tra sinh viên đã gửi yêu cầu chưa
    const existingRequest = await Membership.findOne({
      studentEmail: studentEmail.trim().toLowerCase(),
      club: id,
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You have already registered for this club",
      });
    }

    // Tạo yêu cầu tham gia
    const membership = await Membership.create({
      studentName,
      studentEmail,
      club: id,
    });

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully",
      data: membership,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register for club",
      error: error.message,
    });
  }
};

module.exports = {
  getAllClubs,
  getClubById,
  registerClub,
};