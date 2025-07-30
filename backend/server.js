// server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Define routes here
const patientRoutes = require('./routes/patientRoutes');
const checkupRoutes = require('./routes/checkupRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

app.use('/api/patients', patientRoutes);
app.use('/api/checkups', checkupRoutes);
app.use('/api/announcements', announcementRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));