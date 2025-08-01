const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// GET all rooms
router.get('/', async (req, res) => {
  try {
    // MODIFIED: Sort by the numeric 'roomNumber' field
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT to update a room's status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.status = status;
    await room.save();
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;