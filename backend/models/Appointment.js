const mongoose = require('mongoose');
const { initialCheckupSchema } = require('./Patient');

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
    },
    checkups: {
        type: [initialCheckupSchema],
        default: [],
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Appointment', appointmentSchema);