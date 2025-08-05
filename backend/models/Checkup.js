const mongoose = require('mongoose');

const checkupSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, default: 'General' },
    
    // New fields for enhanced checkups
    symptoms: String,
    vitalSigns: {
        temperature: String,
        bloodPressure: String,
        heartRate: String,
        weight: String,
        height: String
    },
    
    details: String,
    doctorNotes: String,
    
    // Enhanced AI response structure
    aiResponse: {
        possibleDiagnoses: [String],
        recommendedActions: String,
        riskFactors: [String],
        followUpRecommendations: String,
        confidence: Number,
        confidenceExplanation: String,
        additionalConsiderations: String,
        analyzedAt: Date,
        aiModel: String,
        analysisVersion: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Checkup', checkupSchema);