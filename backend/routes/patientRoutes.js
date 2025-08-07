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

// Get patient's initial checkups from nurse (embedded in patient document)
router.get("/:id/initial-checkups", async (req, res) => {
  try {
    console.log('Fetching initial checkups for patient:', req.params.id);

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get all initial checkups that haven't been converted to doctor checkups yet
    const initialCheckups = patient.checkups || [];

    // Check which initial checkups already have corresponding doctor checkups
    const existingDoctorCheckups = await Checkup.find({ patientId: req.params.id });
    const existingCheckupDates = existingDoctorCheckups.map(checkup =>
      new Date(checkup.date).toDateString()
    );

    // Filter out initial checkups that already have doctor checkups
    const availableInitialCheckups = initialCheckups.filter(initialCheckup =>
      !existingCheckupDates.includes(new Date(initialCheckup.date).toDateString())
    );

    console.log(`Found ${availableInitialCheckups.length} available initial checkups`);
    res.json(availableInitialCheckups);
  } catch (error) {
    console.error('Error fetching initial checkups:', error);
    res.status(500).json({ message: error.message });
  }
});

// Convert nurse's initial checkup to doctor checkup
router.post("/:id/convert-initial-checkup", async (req, res) => {
  try {
    const { initialCheckupDate } = req.body;

    if (!initialCheckupDate) {
      return res.status(400).json({ message: "Initial checkup date is required" });
    }

    console.log('Converting initial checkup for patient:', req.params.id, 'date:', initialCheckupDate);

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Find the specific initial checkup
    const initialCheckup = patient.checkups.find(checkup =>
      new Date(checkup.date).toDateString() === new Date(initialCheckupDate).toDateString()
    );

    if (!initialCheckup) {
      return res.status(404).json({ message: "Initial checkup not found" });
    }

    // Check if this checkup has already been converted
    const existingCheckup = await Checkup.findOne({
      patientId: req.params.id,
      date: {
        $gte: new Date(new Date(initialCheckupDate).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(initialCheckupDate).setHours(23, 59, 59, 999))
      }
    });

    if (existingCheckup) {
      return res.status(400).json({ message: "This initial checkup has already been converted" });
    }

    // Create new doctor checkup based on nurse's initial checkup
    const doctorCheckupData = {
      patientId: req.params.id,
      date: new Date(initialCheckup.date),
      type: "Converted from Initial Checkup",
      details: `Initial checkup by nurse:\nWeight: ${initialCheckup.weight || 'N/A'}\nTemperature: ${initialCheckup.temperature || 'N/A'}\nNotes: ${initialCheckup.notes || 'N/A'}`,
      symptoms: initialCheckup.notes || "",
      vitalSigns: {
        temperature: initialCheckup.temperature ? initialCheckup.temperature.toString() : "",
        bloodPressure: initialCheckup.bloodPressure || "",
        heartRate: "",
        weight: initialCheckup.weight ? initialCheckup.weight.toString() : "",
        height: ""
      },
      doctorNotes: "",
      nurseInitialData: {
        weight: initialCheckup.weight,
        bloodPressure: initialCheckup.bloodPressure,
        temperature: initialCheckup.temperature,
        notes: initialCheckup.notes,
        convertedAt: new Date()
      }
    };

    const newCheckup = new Checkup(doctorCheckupData);
    const savedCheckup = await newCheckup.save();
    await savedCheckup.populate("patientId");

    console.log('Initial checkup converted successfully:', savedCheckup._id);
    res.status(201).json(savedCheckup);
  } catch (error) {
    console.error('Error converting initial checkup:', error);
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