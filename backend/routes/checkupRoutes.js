// routes/checkupRoutes.js
const express = require('express');
const router = express.Router();
const Checkup = require('../models/Checkup');

// Get all checkups
router.get('/', async (req, res) => {
    try {
        const checkups = await Checkup.find();
        res.json(checkups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single checkup by id
router.get('/:id', async (req, res) => {
    try {
        const checkup = await Checkup.findById(req.params.id);
        if (!checkup) {
            return res.status(404).json({ message: 'Checkup not found' });
        }
        res.json(checkup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new checkup
router.post('/', async (req, res) => {
    try {
        const checkup = new Checkup(req.body);
        const newCheckup = await checkup.save();
        res.status(201).json(newCheckup);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a checkup
router.put('/:id', async (req, res) => {
    try {
        const checkup = await Checkup.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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