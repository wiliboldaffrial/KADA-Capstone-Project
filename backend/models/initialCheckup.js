const mongoose = require("mongoose");

const initialCheckupSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    temperature: String,
    bloodPressure: String,
    heartRate: String,
    weight: String,
    height: String,
    notes: String,
  },
  { _id: false }
);

module.exports = initialCheckupSchema;

//added comment supaya bisa ngepush
