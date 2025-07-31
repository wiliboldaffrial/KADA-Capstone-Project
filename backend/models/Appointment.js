const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: String,
        required: true
    },
    doctor: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Appointment', appointmentSchema);