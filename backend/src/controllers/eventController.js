
const Event = require("../models/Event");
const Club = require("../models/Club");

// Lấy danh sách sự kiện
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("club", "name")
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      message: "Get events successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy thông tin một sự kiện
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("club", "name");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Tạo sự kiện mới
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      club,
      location,
      startDate,
      endDate,
      capacity,
    } = req.body;

    if (
      !title ||
      !club ||
      !location ||
      !startDate ||
      !endDate ||
      capacity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const existingClub = await Club.findById(club);

    if (!existingClub) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    if (
      new Date(endDate) <= new Date(startDate) ||
      !Number.isFinite(new Date(startDate).getTime()) ||
      !Number.isFinite(new Date(endDate).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid event dates",
      });
    }

    const event = await Event.create({
      title,
      description,
      club,
      location,
      startDate,
      endDate,
      capacity,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật sự kiện
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa sự kiện
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
