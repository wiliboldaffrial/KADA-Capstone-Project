import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginAppHeader from "../../components/LoginAppHeader";

const LoginForm = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReturnToRoleSelection = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg w-full max-w-md">
        <div className="w-full max-w-sm mx-auto">
          <div className="relative text-center">
            <LoginAppHeader subtitle={`Welcome, ${role}!`} />
          </div>
          <div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email" 
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2] border-gray-400" 
                  style={{ fontFamily: "Kollektif, sans-serif" }} 
                  required
                />
              </div>
              <div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Password" 
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2] border-gray-400" 
                  style={{ fontFamily: "Kollektif, sans-serif" }} 
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 px-4 rounded-full font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045ae2] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "Kollektif, sans-serif", backgroundColor: "#045ae2" }}
              >
                {isLoading ? "Logging in..." : "Login"}
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