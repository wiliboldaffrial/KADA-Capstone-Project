const mongoose = require('mongoose');

const initialCheckupSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  weight: Number,
  // height: Number,
  bloodPressure: String,
  temperature: Number,
  notes: String,
}, { _id: false }); 

module.exports = initialCheckupSchema;