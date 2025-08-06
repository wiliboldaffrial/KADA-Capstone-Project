const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// GET all appointments with populated patient and doctor details
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient") // Populates the full patient object
      .populate("doctor")  // Populates the full doctor (User) object
      .sort({ dateTime: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new appointment (expects IDs for patient and doctor)
router.post("/", async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    
    // Re-fetch and populate the new appointment to send back to the client
    const populatedAppointment = await Appointment.findById(newAppointment._id)
      .populate("patient")
      .populate("doctor");
      
    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error("Failed to create appointment:", error);
    res.status(500).json({ message: "Server error while creating appointment" });
  }
});

// POST to add a nurse's initial checkup to a specific appointment
router.post("/:id/checkups", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Add the new checkup data to the appointment's embedded checkups array
    appointment.checkups.push(req.body);
    await appointment.save();
    
    // Return the newly added checkup (it's the last one in the array)
    res.status(201).json(appointment.checkups[appointment.checkups.length - 1]);
  } catch (error) {
    console.error("Error saving checkup:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset initial checkup for an appointment
router.post("/:id/checkups/reset", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { checkups: [] } }, // Clear the checkups array
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    
    res.json({ message: "Initial checkup reset" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT to update an appointment
router.put("/:id", async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("patient")
      .populate("doctor");
      
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