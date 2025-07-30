const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: String,
    content: String,
    date: Date,
    urgency: { type: String, enum: ['normal', 'urgent'], default: 'normal'},
});

module.exports = mongoose.model('Announcement', announcementSchema);