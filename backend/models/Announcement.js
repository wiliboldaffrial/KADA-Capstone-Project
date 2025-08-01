const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    content: String,
    urgency: { type: Boolean, default: false},
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);