const express = require('express');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./db');
require('dotenv').config();
require('./config/passport'); // Add this line

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Connect to MongoDB
connectDB();

// Define routes
const authRoutes = require('./routes/authentication');
const patientRoutes = require('./routes/patientRoutes');
const checkupRoutes = require('./routes/checkupRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/patients', passport.authenticate('jwt', { session: false }), patientRoutes);
app.use('/api/checkups', passport.authenticate('jwt', { session: false }), checkupRoutes);
app.use('/api/announcements', passport.authenticate('jwt', { session: false }), announcementRoutes);
app.use('/api/appointments', passport.authenticate('jwt', { session: false }), appointmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));