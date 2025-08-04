import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./UserContext";
import RequireRole from "./components/RequireRole";
import { SideBarProvider } from "./SideBarContext";
import Layout from "./components/Layout";
import { Toaster } from "react-hot-toast";

// Pages
import RoleSelection from "./pages/RoleSelection/RoleSelection";
import LoginForm from "./pages/Login/LoginForm";
import SignUpForm from "./pages/SignUp/SignUpForm";
import Dashboard from "./pages/Dashboard";
import Announcement from "./pages/Announcement";
import AppointmentSchedule from "./pages/Admin/AppointmentSchedule";
import PatientManagement from "./pages/Admin/PatientManagement";
import RoomManagement from "./pages/Admin/RoomManagement";
import PatientCheckup from "./pages/Doctor/PatientCheckup";
import Patients from "./pages/Doctor/Patients";
import PatientList from "./pages/Nurse/PatientList";

export default function App() {
  return (
    <>
      <UserProvider>
        <SideBarProvider>
          <Router>
            <Routes>
              {/* Public Routes - No Layout */}
              <Route path="/" element={<RoleSelection />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignUpForm />} />

              {/* Protected Routes - With Layout */}
              {/* All routes inside this parent Route will be rendered within the Layout's Outlet */}
              <Route element={<Layout />}>
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
                  path="/doctor/patients"
                  element={
                    <RequireRole allowedRoles={["doctor"]}>
                      <Patients />
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
              </Route>
            </Routes>
          </Router>
        </SideBarProvider>
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
