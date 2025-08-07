const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room'); // Adjust the path if your models are elsewhere
const connectDB = require('./db'); // We'll use your existing DB connection logic

dotenv.config();

// Generates an array of 20 room objects
const roomsToInit = Array.from({ length: 20 }, (_, i) => ({
  name: `Room ${i + 1}`,
  roomNumber: i + 1, // Add the numeric value
  // The 'status' will default to 'Available' based on your schema
}));

const initDatabase = async () => {
  try {
    await connectDB();
    console.log('Database connected for initialization...');

    // Clear existing rooms
    await Room.deleteMany({});
    console.log('Existing rooms cleared.');

    // Insert the new rooms
    await Room.insertMany(roomsToInit);
    console.log('Database has been seeded with 20 rooms! 🌱');

  } catch (error) {
    console.error('Error while seeding the database:', error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

initDatabase();