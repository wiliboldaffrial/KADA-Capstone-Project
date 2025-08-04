const mongoose = require('mongoose');
const initialCheckupSchema = require('./initialCheckup');

const checkupSchema = new mongoose.Schema({
    patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'Patient'},
    initialCheckup: initialCheckupSchema,

    date: Date,
    details: String,
    doctorNotes: String,
    aiResponse: {
        diagnosis: String,
        likely_cause: String,
        diseases: [String],
        recommended_actions: String,
        factCheck: {
            confidence: Number,
            explanation: String
        }
    }
});

module.exports = mongoose.model('Checkup', checkupSchema);