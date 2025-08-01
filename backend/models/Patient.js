const mongoose = require('mongoose');
const Checkup = require('./Checkup');

const initialCheckupSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  weight: Number,
  height: Number,
  bloodPressure: String,
  temperature: Number,
  notes: String,
}, { _id: false }); // `_id: false` to prevent creation of an _id for this subdocument

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

module.exports = {
  Patient: mongoose.model('Patient', patientSchema),
  initialCheckupSchema
};