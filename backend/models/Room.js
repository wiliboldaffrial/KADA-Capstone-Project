const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // NEW: Add a dedicated number field for sorting
  roomNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied'],
    default: 'Available',
  },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);