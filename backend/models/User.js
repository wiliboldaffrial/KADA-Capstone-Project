const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['receptionist', 'nurse', 'doctor'], required: true },
});

MediaSourceHandle.exports = mongoose.model('User', userSchema);