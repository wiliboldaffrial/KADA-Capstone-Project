import React from 'react';
import AppHeader from '../../components/AppHeader';

// Component for the first step: Role Selection
const RoleSelection = ({ onSelectRole, onGoToSignUp }) => {
    const roles = ['Admin/Receptionist', 'Nurse', 'Doctor'];

    return (
        <div className="w-full max-w-sm mx-auto">
            <AppHeader subtitle="Login as" />
            <div className="mt-8 space-y-4">
                {roles.map((role) => (
                    <button
                        key={role}
                        onClick={() => onSelectRole(role)}
                        className="w-full text-white py-3 px-4 rounded-full font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045ae2]"
                        style={{ fontFamily: 'Kollektif, sans-serif', backgroundColor: '#045ae2' }}
                    >
                        {role}
                    </button>
                ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-8" style={{ fontFamily: 'Kollektif, sans-serif' }}>
                Don't have an account yet?{' '}
                <button onClick={onGoToSignUp} className="font-semibold hover:underline" style={{color: '#045ae2'}}>
                    Sign up
                </button>
            </p>
        </div>
    );
};

export default RoleSelection;
