const mongoose = require('mongoose');
const initialCheckupSchema = require('./initialCheckup'); // Assuming this schema is defined correctly

const appointmentSchema = new mongoose.Schema(
  {
    // MODIFIED: Use ObjectId and ref to link to the Patient document
    patient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Patient", 
      required: true 
    },
    // MODIFIED: Use ObjectId and ref to link to the User document (for doctors)
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    // This embeds the nurse's initial checkup directly into the appointment
    checkups: {
      type: [initialCheckupSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);