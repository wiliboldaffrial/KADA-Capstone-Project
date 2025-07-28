import React, { useState } from 'react';
import AppHeader from '../components/AppHeader';

// Component for the Sign Up page
const SignUpForm = ({ onBack }) => {
    const [role, setRole] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            // In a real app, show a proper error message
            console.error("Passwords don't match");
            return;
        }
        // In a real app, you'd handle user registration here
        console.log({ role, email, password });
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div>
                <AppHeader subtitle="Sign up" />
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2] bg-white"
                            style={{ fontFamily: 'Kollektif, sans-serif' }}
                        >
                            <option value="" disabled hidden>Choose a role</option>
                            <option id="admin" value="Admin">Admin/Receptionist</option>
                            <option id="nurse" value="Nurse">Nurse</option>
                            <option id="doctor" value="Doctor">Doctor</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2]"
                            style={{ fontFamily: 'Kollektif, sans-serif' }}
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2]"
                            style={{ fontFamily: 'Kollektif, sans-serif' }}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2]"
                            style={{ fontFamily: 'Kollektif, sans-serif' }}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2]"
                            style={{ fontFamily: 'Kollektif, sans-serif' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full text-white py-3 px-4 rounded-full font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045ae2]"
                        style={{ fontFamily: 'Kollektif, sans-serif', backgroundColor: '#045ae2' }}
                    >
                        Sign up
                    </button>
                </form>
            </div>
            <p className="text-center text-sm text-gray-500 mt-8" style={{ fontFamily: 'Kollektif, sans-serif' }}>
                Already have an account?{' '}
                <button onClick={onBack} className="font-semibold hover:underline" style={{color: '#045ae2'}}>
                    Login
                </button>
            </p>
        </div>
    );
};

export default SignUpForm;
