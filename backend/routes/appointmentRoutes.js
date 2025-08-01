const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// GET all appointments, sorted by date
router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ dateTime: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new appointment
// backend/routes/appointments.js
router.post('/:id/checkups', async (req, res) => {
  const { id } = req.params;
  const checkupData = req.body;

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!appointment.checkups) {
      appointment.checkups = [];
    }

    appointment.checkups.push(checkupData);
    await appointment.save();

    // Return the last added checkup
    res.status(201).json(appointment.checkups[appointment.checkups.length - 1]);
  } catch (error) {
    console.error("Failed to add checkup:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT to update an appointment
router.put('/:id', async (req, res) => {
    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(updatedAppointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE an appointment
router.delete('/:id', async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;