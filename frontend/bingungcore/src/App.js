import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RoleSelection from './pages/RoleSelection';
import LoginForm from './pages/LoginForm';
import SignUpForm from './pages/SignUpForm';
import Dashboard from './pages/Dashboard';
import AppointmentSchedule from './pages/Admin/AppointmentSchedule';
import PatientManagement from './pages/Admin/PatientManagement';
import RoomManagement from './pages/Admin/RoomManagement';
import PatientList from './pages/PatientList.jsx'


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
                <Route path="/patientlist" element={<PatientList />} />
            </Routes>
        </Router>
    );
}
