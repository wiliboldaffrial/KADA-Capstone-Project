const express = require('express');
const router = express.Router();

const {Patient} = require('../models/Patient');
const {Checkup} = require('../models/Checkup');

// Get all patients
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new checkup (used by nurse)
router.post('/:id/checkup', async (req, res) => {
  try {
    const { id } = req.params;
    const newCheckup = req.body;

    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    patient.checkups.push(newCheckup);
    await patient.save();

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single patient by id
router.get('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get patient's latest checkup
router.get('/:id/latest-checkup', async (req, res) => {
    try {
        const latestCheckup = await Checkup.findOne({ patientId: req.params.id })
            .sort({ date: -1 })
            .populate('patientId');
            
        if (!latestCheckup) {
            return res.status(404).json({ message: 'No checkups found for this patient' });
        }
        
        res.json(latestCheckup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get patient's latest checkup
router.get('/:id/latest-checkup', async (req, res) => {
    try {
        const latestCheckup = await Checkup.findOne({ patientId: req.params.id })
            .sort({ date: -1 })
            .populate('patientId');
            
        if (!latestCheckup) {
            return res.status(404).json({ message: 'No checkups found for this patient' });
        }
        
        res.json(latestCheckup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new patient
router.post('/', async (req, res) => {
    try {
        const patient = new Patient(req.body);
        const newPatient = await patient.save();
        res.status(201).json(newPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a patient
router.put('/:id', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a patient
router.delete('/:id', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json({ message: 'Patient deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;