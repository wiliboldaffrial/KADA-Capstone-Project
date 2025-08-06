const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Checkup = require("../models/Checkup");
const Patient = require("../models/Patient");

router.get("/", async (req, res) => {
  try {
    // Populate both patient and doctor references
    const appointments = await Appointment.find()
      // .populate("patientId", "name") // Fetches the Patient's ID and name\
      .sort({ dateTime: 1 });
    
    // Transform the data to include the names directly for frontend compatibility
    const transformedAppointments = appointments.map(appointment => ({
      ...appointment.toObject(),
      patientName: appointment.patient ? appointment.patient.name : 'Unknown Patient',
      doctorName: appointment.doctor ? appointment.doctor.name : 'Unknown Doctor'
    }));
    
    res.json(transformedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/appointments — Create a new appointment
router.post("/", async (req, res) => {
  try {
    const { patient, doctor, dateTime, notes } = req.body;

    if (!patient || !doctor || !dateTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newAppointment = new Appointment({ patient, doctor, dateTime, notes });
    await newAppointment.save();
    
    // Populate the created appointment before sending response
    const populatedAppointment = await Appointment.findById(newAppointment._id)
      .populate("patient", "name nik")
      .populate("doctor", "name");
    
    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error("Failed to create appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/checkups", async (req, res) => {
  const { id } = req.params;
  const checkupData = req.body;

  try {
    // 1. Find the appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      console.error("Appointment not found");
      return res.status(404).json({ message: "Appointment not found" });
    }

    // 2. Save checkup to appointment
    appointment.checkups.push(checkupData);
    await appointment.save();
    console.log("Checkup saved to Appointment");

    // 3. Save checkup to Patient
    const patient = await Patient.findOne({ name: appointment.patient });
    if (patient) {
      patient.checkups.push(checkupData);
      await patient.save();
      console.log("Checkup saved to Patient");
    } else {
      console.warn("Patient not found for appointment");
    }

    // 4. Save to Checkup collection with initialCheckup field
    // const checkupEntry = new Checkup({
    //   patientId: appointment.patientId,
    //   initialCheckup: checkupData,
    //   aiResponse: checkupData.aiResponse || {}, // Optional
    // });

    // await checkupEntry.save();
    // console.log("Checkup saved to Checkup collection");

    // 4. Return the newly saved checkupData
    res.status(201).json(checkupData);
  } catch (error) {
    console.error("Error saving checkup:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset initial checkup for an appointment
router.post("/:id/checkups/reset", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    appointment.checkups = [];
    await appointment.save();
    res.json({ message: "Initial checkup reset" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT to update an appointment
router.put("/:id", async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("patient", "name nik")
      .populate("doctor", "name");
    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an appointment
router.delete("/:id", async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!deletedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;