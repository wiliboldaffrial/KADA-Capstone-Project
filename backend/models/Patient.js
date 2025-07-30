const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: String,
    gender: String,
    dateOfBirth: Date,
    phone: String,
    address: String,
    checkups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Checkup'}],
})

module.exports = mongoose.model('Patient', patientSchema);