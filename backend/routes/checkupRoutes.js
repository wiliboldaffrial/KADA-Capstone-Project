const express = require('express');
const router = express.Router();
const Checkup = require('../models/Checkup');
const { Patient } = require('../models/Patient');

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
        console.error('Error fetching checkups:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new checkup - UPDATED to handle new fields
router.post('/', async (req, res) => {
    try {
        console.log('Creating new checkup with data:', req.body);

        // Validate patient exists
        const patientExists = await Patient.findById(req.body.patientId);
        if (!patientExists) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Create checkup object with all possible fields
        const checkupData = {
            patientId: req.body.patientId,
            date: req.body.date || new Date(),
            type: req.body.type || 'General',
            details: req.body.details || '',
            symptoms: req.body.symptoms || '',
            vitalSigns: req.body.vitalSigns || {},
            doctorNotes: req.body.doctorNotes || '',
            aiResponse: req.body.aiResponse || null
        };

        console.log('Processed checkup data:', checkupData);

        const checkup = new Checkup(checkupData);
        const newCheckup = await checkup.save();
        
        console.log('Checkup saved successfully:', newCheckup._id);

        // Populate patient data before sending response
        await newCheckup.populate('patientId');
        res.status(201).json(newCheckup);
    } catch (error) {
        console.error('Error creating checkup:', error);
        
        // Provide more detailed error information
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors,
                details: error.message 
            });
        }
        
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            return res.status(500).json({ 
                message: 'Database error', 
                details: error.message 
            });
        }
        
        res.status(400).json({ 
            message: 'Failed to create checkup',
            error: error.message,
            details: error
        });
    }
});

// Update a checkup - Enhanced to handle all fields
router.put('/:id', async (req, res) => {
    try {
        console.log('Updating checkup:', req.params.id, 'with data:', req.body);

        const updateData = {};
        
        // Only update fields that are provided
        if (req.body.aiResponse !== undefined) updateData.aiResponse = req.body.aiResponse;
        if (req.body.doctorNotes !== undefined) updateData.doctorNotes = req.body.doctorNotes;
        if (req.body.details !== undefined) updateData.details = req.body.details;
        if (req.body.symptoms !== undefined) updateData.symptoms = req.body.symptoms;
        if (req.body.vitalSigns !== undefined) updateData.vitalSigns = req.body.vitalSigns;
        if (req.body.type !== undefined) updateData.type = req.body.type;
        if (req.body.date !== undefined) updateData.date = req.body.date;

        const checkup = await Checkup.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (!checkup) {
            return res.status(404).json({ message: 'Checkup not found' });
        }
        
        console.log('Checkup updated successfully');
        res.json(checkup);
    } catch (error) {
        console.error('Error updating checkup:', error);
        res.status(400).json({ 
            message: 'Failed to update checkup',
            error: error.message 
        });
    }
});

// Delete a checkup
router.delete('/:id', async (req, res) => {
    try {
        const checkup = await Checkup.findByIdAndDelete(req.params.id);
        if (!checkup) {
            return res.status(404).json({ message: 'Checkup not found' });
        }
        res.json({ message: 'Checkup deleted successfully' });
    } catch (error) {
        console.error('Error deleting checkup:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;