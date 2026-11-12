
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const crypto = require("crypto");
const QRCode = require("qrcode");

// Đăng ký tham gia sự kiện
const registerEvent = async (req, res) => {
  try {
    const { studentName, studentEmail } = req.body;
    const { eventId } = req.params;

    if (!studentName || !studentEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide student name and email",
      });
    }

    const email = studentEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student email",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.status === "cancelled" || event.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This event is not accepting registrations",
      });
    }

    const existingRegistration = await EventRegistration.findOne({
      studentEmail: email,
      event: eventId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "You have already registered for this event",
      });
    }

    const registeredCount = await EventRegistration.countDocuments({
      event: eventId,
      status: { $in: ["registered", "attended"] },
    });

    if (registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "This event is full",
      });
    }

    const registration = await EventRegistration.create({
        studentName: studentName.trim(),
        studentEmail: email,
        event: eventId,
        checkInToken: crypto.randomBytes(32).toString("hex"),
    });

    res.status(201).json({
      success: true,
      message: "Event registration successful",
      data: registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already registered for this event",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy danh sách sinh viên đăng ký một sự kiện
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const registrations = await EventRegistration.find({
      event: eventId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Get event registrations successfully",
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Hủy đăng ký sự kiện
const cancelEventRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await EventRegistration.findById(
      registrationId
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    if (registration.status !== "registered") {
      return res.status(400).json({
        success: false,
        message: "This registration cannot be cancelled",
      });
    }

    registration.status = "cancelled";
    await registration.save();

    res.status(200).json({
      success: true,
      message: "Event registration cancelled successfully",
      data: registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


 // Xác nhận điểm danh bằng mã QR
const checkInByToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "QR token is required",
      });
    }

    const registration = await EventRegistration.findOne({
      checkInToken: token,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    if (registration.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled registration cannot check in",
      });
    }

    if (registration.status === "attended") {
      return res.status(400).json({
        success: false,
        message: "Student has already checked in",
      });
    }

    registration.status = "attended";
    registration.checkInTime = new Date();

    await registration.save();

    res.status(200).json({
      success: true,
      message: "Check-in successful",
      data: registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


 // Tạo QR Code cho lượt đăng ký sự kiện
const getRegistrationQRCode = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await EventRegistration.findById(
      registrationId
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    if (registration.status !== "registered") {
      return res.status(400).json({
        success: false,
        message: "QR Code is unavailable for this registration",
      });
    }

    if (!registration.checkInToken) {
      return res.status(400).json({
        success: false,
        message: "QR token not found. Please register again.",
      });
    }

    const qrImage = await QRCode.toBuffer(
      registration.checkInToken,
      {
        type: "png",
        width: 300,
        margin: 2,
      }
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=event-qr.png"
    );

    res.send(qrImage);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerEvent,
  getEventRegistrations,
  cancelEventRegistration,
  checkInByToken,
  getRegistrationQRCode,
};

