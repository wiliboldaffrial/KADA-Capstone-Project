// backend/routes/patients.js
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Add Patient
router.post('/add', async (req, res) => {
    const { name, age, gender, doctorId, medicalHistory } = req.body;
    try {
        const patient = new Patient({ name, age, gender, doctorId, medicalHistory });
        await patient.save();
        res.json(patient);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get Patient List for Doctor
router.get('/list/:doctorId', async (req, res) => {
    try {
        const patients = await Patient.find({ doctorId: req.params.doctorId });
        res.json(patients);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;