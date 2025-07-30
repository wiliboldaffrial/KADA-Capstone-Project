const mongoose = require('mongoose');

const checkupSchema = new mongoose.Schema({
    patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'Patient'},
    date: Date,
    details: String,
    aiResponse: String,
});

module.exports = mongoose.model('Checkup', checkupSchema);