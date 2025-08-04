import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./UserContext"; // Import UserProvider to manage user state by Qem
import RequireRole from "./components/RequireRole"; // Import RequireRole to protect routes based on user roles by Qem

// Pages
import RoleSelection from "./pages/RoleSelection/RoleSelection";
import LoginForm from "./pages/Login/LoginForm";
import SignUpForm from "./pages/SignUp/SignUpForm";
import Dashboard from "./pages/Dashboard";
import Announcement from "./pages/Announcement";

// Admin
import AppointmentSchedule from "./pages/Admin/AppointmentSchedule";
import PatientManagement from "./pages/Admin/PatientManagement";
import RoomManagement from "./pages/Admin/RoomManagement";

// Doctor
import PatientCheckup from "./pages/Doctor/PatientCheckup";
import PatientListDoctor from "./pages/Doctor/PatientList";

// Nurse
import PatientList from "./pages/Nurse/PatientList";

import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <> {/* Wrapping the entire app in UserProvider to manage user state by Qem */}
      <UserProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RoleSelection />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/announcement" element={<Announcement />} />

            {/* Admin-only Routes */}
            <Route
              path="/admin/appointmentSchedule"
              element={
                <RequireRole allowedRoles={["admin/receptionist"]}>
                  <AppointmentSchedule />
                </RequireRole>
              }
            />
            <Route
              path="/admin/patientManagement"
              element={
                <RequireRole allowedRoles={["admin/receptionist"]}>
                  <PatientManagement />
                </RequireRole>
              }
            />
            <Route
              path="/admin/roomManagement"
              element={
                <RequireRole allowedRoles={["admin/receptionist"]}>
                  <RoomManagement />
                </RequireRole>
              }
            />

            {/* Nurse-only Routes */}
            <Route
              path="/nurse/patientList"
              element={
                <RequireRole allowedRoles={["nurse"]}>
                  <PatientList />
                </RequireRole>
              }
            />

            {/* Doctor-only Routes */}
            <Route
              path="/doctor/patientList"
              element={
                <RequireRole allowedRoles={["doctor"]}>
                  <PatientListDoctor />
                </RequireRole>
              }
            />
            <Route
              path="/doctor/patient/:_id"
              element={
                <RequireRole allowedRoles={["doctor"]}>
                  <PatientCheckup />
                </RequireRole>
              }
            />
          </Routes>
        </Router>
      </UserProvider>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
          },
        }}
      />
    </>
  );
}
