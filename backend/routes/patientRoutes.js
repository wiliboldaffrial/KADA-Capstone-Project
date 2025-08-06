const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const Checkup = require("../models/Checkup"); // Import the separate Checkup model

// Get all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new checkup (used by nurse) - EMBEDDED checkup in patient document
// router.post("/:id/checkup", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const newCheckup = req.body;

//     const patient = await Patient.findById(id);
//     if (!patient) return res.status(404).json({ error: "Patient not found" });

//     // Add to embedded checkups array
//     patient.checkups.push(newCheckup);
//     await patient.save();

//     res.status(200).json(patient);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// Get a single patient by id
router.get("/:id", async (req, res) => {
  try {
    console.log('Fetching patient with ID:', req.params.id);
    
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      console.log('Patient not found with ID:', req.params.id);
      return res.status(404).json({ message: "Patient not found" });
    }
    
    console.log('Patient found:', patient.name);
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get patient's latest checkup from separate Checkup collection
router.get("/:id/latest-checkup", async (req, res) => {
  try {
    const latestCheckup = await Checkup.findOne({ patientId: req.params.id })
      .sort({ date: -1 })
      .populate("patientId");

    if (!latestCheckup) {
      return res.status(404).json({ message: "No checkups found for this patient" });
    }

    res.json(latestCheckup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new patient
router.post("/", async (req, res) => {
  try {
    console.log('Creating new patient with data:', req.body);
    
    const patient = new Patient(req.body);
    const newPatient = await patient.save();
    
    console.log('Patient created successfully:', newPatient._id);
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Patient with this NIK already exists' 
      });
    }
    
    res.status(400).json({ message: error.message });
  }
});

// Update a patient
router.put("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a patient
router.delete("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    // Also delete all checkups for this patient from separate collection
    await Checkup.deleteMany({ patientId: req.params.id });
    
    res.json({ message: "Patient and associated checkups deleted" });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;