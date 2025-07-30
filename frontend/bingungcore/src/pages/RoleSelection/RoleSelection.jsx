import React from 'react';
import {useNavigate} from 'react-router-dom';
import AppHeader from '../../components/AppHeader';

// Component for the first step: Role Selection
const RoleSelection = () => {
    const navigate = useNavigate(); 

    const roles = ['Admin/Receptionist', 'Nurse', 'Doctor'];

    const handleSelectRole = (role) => {
        localStorage.setItem('role', role.toLowerCase());
        console.log(localStorage.getItem('role'));
        navigate('/login');
    }

    const handleGoToSignUp = () => {
        navigate('/signup');
    }

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg w-full max-w-md">
        
                <div className="w-full max-w-sm mx-auto">
                    <AppHeader subtitle="Login as" />
                    <div className="mt-8 space-y-4">
                        {roles.map((role) => (
                            <button
                                key={role}
                                onClick={() => handleSelectRole(role)}
                                className="w-full text-white py-3 px-4 rounded-full font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045ae2]"
                                style={{ fontFamily: 'Kollektif, sans-serif', backgroundColor: '#045ae2' }}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-8" style={{ fontFamily: 'Kollektif, sans-serif' }}>
                        Don't have an account yet?{' '}
                        <button onClick={handleGoToSignUp} className="font-semibold hover:underline" style={{color: '#045ae2'}}>
                            Sign up
                        </button>
                    </p>
                    </div>
            </div>
        </div>
    );
};

export default RoleSelection;
