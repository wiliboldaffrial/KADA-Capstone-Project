import React, { useState } from 'react';
import RoleSelection from './pages/RoleSelection/RoleSelection';
import LoginForm from './pages/Login/LoginForm';
import SignUpForm from './pages/SignUp/SignUpForm';

// Main App Component
export default function App() {
    const [view, setView] = useState('roleSelection'); // 'roleSelection', 'loginForm', or 'signUpForm'
    const [selectedRole, setSelectedRole] = useState(null);

    const handleSelectRole = (role) => {
        setSelectedRole(role);
        setView('loginForm');
    };
    
    const handleBackToRoleSelection = () => {
        setView('roleSelection');
        setSelectedRole(null);
    }

    const handleGoToSignUp = () => {
        setView('signUpForm');
    }

    const renderView = () => {
        switch(view) {
            case 'loginForm':
                return <LoginForm role={selectedRole} onBack={handleBackToRoleSelection} />;
            case 'signUpForm':
                return <SignUpForm onBack={handleBackToRoleSelection} />;
            case 'roleSelection':
            default:
                return <RoleSelection onSelectRole={handleSelectRole} onGoToSignUp={handleGoToSignUp} />;
        }
    }

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg w-full max-w-md">
                {renderView()}
            </div>
        </div>
    );
}
