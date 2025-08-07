const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    content: String,
    urgency: { type: Boolean, default: false},
    author: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);