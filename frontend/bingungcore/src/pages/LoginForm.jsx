import React, { useState } from 'react';
import AppHeader from '../components/AppHeader';

// Component for the second step: Email and Password Login
const LoginForm = ({ role, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you'd handle authentication here
        console.log({ role, email, password });
        // Show a success message or redirect
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="relative text-center">
                <AppHeader />
            </div>
            <div>
                <p className="text-center text-xl text-gray-700 mt-8" style={{ fontFamily: 'Kollektif, sans-serif' }}>
                    {role}
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
                    <button
                        type="submit"
                        className="w-full text-white py-3 px-4 rounded-full font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045ae2]"
                        style={{ fontFamily: 'Kollektif, sans-serif', backgroundColor: '#045ae2' }}
                    >
                        Login
                    </button>
                </form>
                <p className="text-center mt-4">
                    <button onClick={onBack} className="font-semibold underline" style={{fontFamily: 'Kollektif, sans-serif', color: '#045ae2'}}>
                        Back
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
