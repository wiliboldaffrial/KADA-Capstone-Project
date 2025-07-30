import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";

// Component for the second step: Email and Password Login
const LoginForm = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleReturnToRoleSelection = () => {
    navigate("/");
  };

  // Bypass all validation and API, just redirect to dashboard
  const handleSubmit = (e) => {
    e.preventDefault();

    try{
      // Simulate successful login
      //otherwise make an API call to verify credentials
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials")
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg w-full max-w-md">
        <div className="w-full max-w-sm mx-auto">
          <div className="relative text-center">
            <AppHeader subtitle={`Welcome, ${role}!`} />
          </div>
          <div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <input type="email" placeholder="Email" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2] border-gray-400" style={{ fontFamily: "Kollektif, sans-serif" }} />
              </div>
              <div>
                <input type="password" placeholder="Password" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2] border-gray-400" style={{ fontFamily: "Kollektif, sans-serif" }} />
              </div>
              <button
                type="submit"
                className="w-full text-white py-3 px-4 rounded-full font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045ae2] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "Kollektif, sans-serif", backgroundColor: "#045ae2" }}
              >
                Login
              </button>
            </form>
            <p className="text-center mt-4">
              <button onClick={handleReturnToRoleSelection} className="font-semibold underline" style={{ fontFamily: "Kollektif, sans-serif", color: "#045ae2" }}>
                Back
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
