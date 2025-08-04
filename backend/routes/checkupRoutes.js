const express = require('express');
const router = express.Router();
const Checkup = require('../models/Checkup');
const Patient = require('../models/Patient');

// Get all checkups
router.get('/', async (req, res) => {
    try {
        const checkups = await Checkup.find().populate('patientId');
        res.json(checkups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single checkup by id
router.get('/:id', async (req, res) => {
    try {
        const checkup = await Checkup.findById(req.params.id).populate('patientId');
        if (!checkup) {
            return res.status(404).json({ message: 'Checkup not found' });
        }
        res.json(checkup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get checkups by patient ID
router.get('/patient/:patientId', async (req, res) => {
    try {
        const checkups = await Checkup.find({ patientId: req.params.patientId })
            .sort({ date: -1 }) // Sort by date descending (most recent first)
            .populate('patientId'); // Populate patient details if needed
        res.json(checkups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new checkup
router.post('/', async (req, res) => {
    try {
        // Validate patient exists
        const patientExists = await Patient.findById(req.body.patientId);
        if (!patientExists) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const checkup = new Checkup({
            patientId: req.body.patientId,
            date: req.body.date || new Date(),
            details: req.body.details,
            doctorNotes: req.body.doctorNotes,
            type: req.body.type,
            aiResponse: req.body.aiResponse
        });

        const newCheckup = await checkup.save();
        
        // Populate patient data before sending response
        await newCheckup.populate('patientId');
        res.status(201).json(newCheckup);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a checkup
router.put('/:id', async (req, res) => {
    try {
        const { aiResponse, doctorNotes } = req.body;
        const checkup = await Checkup.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    aiResponse,
                    doctorNotes
                } 
            },
            { new: true }
        );
        
        if (!checkup) {
            return res.status(404).json({ message: 'Checkup not found' });
        }
        
        res.json(checkup);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a checkup
router.delete('/:id', async (req, res) => {
    try {
        const checkup = await Checkup.findByIdAndDelete(req.params.id);
        if (!checkup) {
            return res.status(404).json({ message: 'Checkup not found' });
        }
        res.json({ message: 'Checkup deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;