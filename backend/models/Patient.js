const mongoose = require('mongoose');
const Checkup = require('./Checkup');
const initialCheckupSchema = require('./initialCheckup');

const patientSchema = new mongoose.Schema({
  nik: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gender: String,
  birthdate: Date,
  bloodType: String,
  contact: String,
  address: String,
  medicalHistory: String,
  checkups: [initialCheckupSchema] // Array of checkups 
}, { timestamps: true }); // `timestamps` adds createdAt and updatedAt fields

module.exports = mongoose.model('Patient', patientSchema);