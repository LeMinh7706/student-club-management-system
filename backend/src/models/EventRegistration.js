
const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
        checkInToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["registered", "cancelled", "attended"],
      default: "registered",
    },
    checkInTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Mỗi sinh viên chỉ được đăng ký một lần cho mỗi sự kiện
eventRegistrationSchema.index(
  { studentEmail: 1, event: 1 },
  { unique: true }
);

const EventRegistration = mongoose.model(
  "EventRegistration",
  eventRegistrationSchema
);

module.exports = EventRegistration;
