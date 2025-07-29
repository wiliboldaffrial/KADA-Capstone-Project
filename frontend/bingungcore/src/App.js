import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RoleSelection from './pages/RoleSelection';
import LoginForm from './pages/LoginForm';
import SignUpForm from './pages/SignUpForm';
import Dashboard from './pages/Dashboard';

// Main App Component
export default function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<RoleSelection />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}
