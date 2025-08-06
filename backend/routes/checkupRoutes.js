const express = require("express");
const router = express.Router();
const Checkup = require("../models/Checkup");
const Patient = require("../models/Patient"); // ✅ FIXED: Removed destructuring

// Get all checkups
router.get("/", async (req, res) => {
  try {
    const checkups = await Checkup.find().populate("patientId");
    res.json(checkups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single checkup by id
router.get("/:id", async (req, res) => {
  try {
    const checkup = await Checkup.findById(req.params.id).populate("patientId");
    if (!checkup) {
      return res.status(404).json({ message: "Checkup not found" });
    }
    res.json(checkup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get checkups by patient ID
router.get("/patient/:patientId", async (req, res) => {
  try {
    const checkups = await Checkup.find({ patientId: req.params.patientId })
      .sort({ date: -1 }) // Sort by date descending (most recent first)
      .populate("patientId"); // Populate patient details if needed
    res.json(checkups);
  } catch (error) {
    console.error("Error fetching checkups:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new checkup - FIXED with better validation and error handling
router.post("/", async (req, res) => {
  try {
    console.log("Creating new checkup with data:", req.body);

    // Enhanced validation
    const { patientId, date, type, details, symptoms, vitalSigns, doctorNotes, aiResponse } = req.body;

    // Check if patientId is provided and valid
    if (!patientId) {
      return res.status(400).json({
        message: "Patient ID is required",
        field: "patientId"
      });
    }

    // Validate MongoDB ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        message: "Invalid patient ID format",
        field: "patientId"
      });
    }

    // Validate patient exists with better error handling
    let patientExists;
    try {
      patientExists = await Patient.findById(patientId); // ✅ NOW WORKS - Patient is properly imported
    } catch (patientError) {
      console.error("Error checking patient existence:", patientError);
      return res.status(500).json({
        message: "Error validating patient",
        details: patientError.message
      });
    }

    if (!patientExists) {
      return res.status(404).json({
        message: "Patient not found with the provided ID",
        patientId: patientId
      });
    }

    // Validate required fields
    if (!details || !details.trim()) {
      return res.status(400).json({
        message: "Checkup details are required",
        field: "details"
      });
    }

    // Create checkup object with proper date handling
    const checkupData = {
      patientId: patientId,
      date: date ? new Date(date) : new Date(),
      type: type || "General",
      details: details.trim(),
      symptoms: symptoms ? symptoms.trim() : "",
      vitalSigns: vitalSigns || {
        temperature: "",
        bloodPressure: "",
        heartRate: "",
        weight: "",
        height: ""
      },
      doctorNotes: doctorNotes ? doctorNotes.trim() : "",
      aiResponse: aiResponse || null,
    };

    // Validate date if provided
    if (date && isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        message: "Invalid date format",
        field: "date"
      });
    }

    console.log("Processed checkup data:", checkupData);

    // Create and save checkup
    const checkup = new Checkup(checkupData);
    let newCheckup;

    try {
      newCheckup = await checkup.save();
      console.log("Checkup saved successfully:", newCheckup._id);
    } catch (saveError) {
      console.error("Error saving checkup:", saveError);
      throw saveError; // Re-throw to be caught by outer catch
    }

    // Populate patient data before sending response
    try {
      await newCheckup.populate("patientId");
    } catch (populateError) {
      console.warn("Warning: Could not populate patient data:", populateError);
      // Continue anyway, just log the warning
    }

    res.status(201).json(newCheckup);

  } catch (error) {
    console.error("Error creating checkup:", error);

    // Enhanced error handling with specific error types
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return res.status(400).json({
        message: "Validation failed",
        errors: errors,
        type: "ValidationError"
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid data type for field: " + error.path,
        field: error.path,
        value: error.value,
        type: "CastError"
      });
    }

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return res.status(500).json({
        message: "Database error",
        details: error.message,
        type: "DatabaseError"
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate key error",
        details: error.message,
        type: "DuplicateError"
      });
    }

    // Generic error response
    res.status(500).json({
      message: "Failed to create checkup",
      error: error.message,
      type: error.name || "UnknownError"
    });
  }
});

// Update a checkup - Enhanced to handle all fields
router.put("/:id", async (req, res) => {
  try {
    console.log("Updating checkup:", req.params.id, "with data:", req.body);

    // Validate checkup ID format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid checkup ID format"
      });
    }

    const updateData = {};

    // Only update fields that are provided and validate them
    if (req.body.aiResponse !== undefined) updateData.aiResponse = req.body.aiResponse;
    if (req.body.doctorNotes !== undefined) updateData.doctorNotes = req.body.doctorNotes;
    if (req.body.details !== undefined) {
      if (!req.body.details.trim()) {
        return res.status(400).json({
          message: "Details cannot be empty"
        });
      }
      updateData.details = req.body.details.trim();
    }
    if (req.body.symptoms !== undefined) updateData.symptoms = req.body.symptoms;
    if (req.body.vitalSigns !== undefined) updateData.vitalSigns = req.body.vitalSigns;
    if (req.body.type !== undefined) updateData.type = req.body.type;
    if (req.body.date !== undefined) {
      const newDate = new Date(req.body.date);
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({
          message: "Invalid date format"
        });
      }
      updateData.date = newDate;
    }

    const checkup = await Checkup.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!checkup) {
      return res.status(404).json({ message: "Checkup not found" });
    }

    console.log("Checkup updated successfully");
    res.json(checkup);
  } catch (error) {
    console.error("Error updating checkup:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        message: "Validation failed",
        errors: errors
      });
    }

    res.status(400).json({
      message: "Failed to update checkup",
      error: error.message,
    });
  }
});

// Delete a checkup
router.delete("/:id", async (req, res) => {
  try {
    // Validate checkup ID format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid checkup ID format"
      });
    }

    const checkup = await Checkup.findByIdAndDelete(req.params.id);
    if (!checkup) {
      return res.status(404).json({ message: "Checkup not found" });
    }
    res.json({ message: "Checkup deleted successfully" });
  } catch (error) {
    console.error("Error deleting checkup:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;