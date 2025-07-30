import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RoleSelection from './pages/RoleSelection/RoleSelection';
import LoginForm from './pages/Login/LoginForm';
import SignUpForm from './pages/SignUp/SignUpForm';
import Dashboard from './pages/Dashboard';
import AppointmentSchedule from './pages/Admin/AppointmentSchedule';
import PatientManagement from './pages/Admin/PatientManagement';
import RoomManagement from './pages/Admin/RoomManagement';
import PatientCheckup from './pages/Doctor/PatientCheckup';
import PatientList from './pages/Nurse/PatientList';


// Main App Component
export default function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<RoleSelection />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/appointmentSchedule" element={<AppointmentSchedule/>}></Route>
                <Route path="/admin/patientManagement" element={<PatientManagement/>}></Route>
                <Route path="/admin/roomManagement" element={<RoomManagement/>}></Route>
                <Route path="/nurse/patientList" element={<PatientList />} />
                <Route path="/doctor/patientCheckup/:id" element={<PatientCheckup />} />

            </Routes>
        </Router>
    );
}
