const mongoose = require("mongoose");
const { initialCheckupSchema } = require("./Patient");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Changed to ObjectId reference
    dateTime: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    checkups: {
      type: [initialCheckupSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);