const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Assuming your User model is in ../models/User.js

// GET a user's profile by ID
router.get("/:id", async (req, res) => {
  try {
    // Find the user by ID and select only the 'name' and 'role' fields
    const user = await User.findById(req.params.id).select("name role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all doctors
router.get("/role/doctors", async (req, res) => {
  try {
    // Find all users with role 'doctor' and select only 'name' and '_id' fields
    const doctors = await User.find({ role: "doctor" }).select("name _id");
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;