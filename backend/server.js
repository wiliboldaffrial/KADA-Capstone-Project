const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./db");
require("dotenv").config();
require("./config/passport");

const app = express();
const corsOptions={
    origin: "https://your-future-netlify-url.netlify.app"
};

// Middleware
app.use(cors(cors(corsOptions)));
app.use(express.json());
app.use(passport.initialize());

// Connect to MongoDB
connectDB();

// Define routes
const authRoutes = require("./routes/authentication");
const patientRoutes = require("./routes/patientRoutes");
const checkupRoutes = require("./routes/checkupRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/", (req, res) => {
    res.send("Backend is running!")
})
app.use("/api/auth", authRoutes);
app.use("/api/patients", passport.authenticate("jwt", { session: false }), patientRoutes);
app.use("/api/checkups", passport.authenticate("jwt", { session: false }), checkupRoutes);
app.use("/api/announcements", passport.authenticate("jwt", { session: false }), announcementRoutes);
app.use("/api/appointments", passport.authenticate("jwt", { session: false }), appointmentRoutes);
app.use("/api/users", passport.authenticate("jwt", { session: false }), userRoutes);
app.use("/api/rooms", passport.authenticate("jwt", { session: false }), roomRoutes);
app.use("/api/ai", passport.authenticate("jwt", { session: false }), aiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
