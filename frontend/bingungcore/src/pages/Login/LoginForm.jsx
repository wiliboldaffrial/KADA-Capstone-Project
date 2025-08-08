import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginAppHeader from "../../components/LoginAppHeader";
import { useUser } from "../../UserContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refetchUserData } = useUser();

  // Input validation states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleReturnToRoleSelection = () => {
    navigate("/");
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Clear errors when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
    if (error) setError("");
  };

  // Validate inputs before submission
  const validateInputs = () => {
    let isValid = true;

    // Reset individual field errors
    setEmailError("");
    setPasswordError("");
    setError("");

    // Check if email is empty
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    // Check if password is empty
    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs first
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          selectedRole: localStorage.getItem('role')
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('isAuthenticated', 'true');

        await refetchUserData(); // Refetch user data to update context, avoid load sidebar with old data by Qem
        navigate('/dashboard');
      } else {
        // Handle specific error messages from backend
        if (data.message === 'Invalid credentials' || data.message === 'User not found') {
          setError('Invalid email or password. Please try again.');
        } else if (data.message === 'Account not verified') {
          setError('Please verify your email address before logging in.');
        } else if (data.message === 'Account suspended') {
          setError('Your account has been suspended. Please contact support.');
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
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
              {/* General error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              {/* Email input */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Email"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    emailError
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-400 focus:ring-[#045ae2] focus:border-[#045ae2]'
                  }`}
                  style={{ fontFamily: "Kollektif, sans-serif" }}
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{emailError}</p>
                )}
              </div>

              {/* Password input */}
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Password"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    passwordError
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-400 focus:ring-[#045ae2] focus:border-[#045ae2]'
                  }`}
                  style={{ fontFamily: "Kollektif, sans-serif" }}
                />
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1 ml-1">{passwordError}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 px-4 rounded-full font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045ae2] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ fontFamily: "Kollektif, sans-serif", backgroundColor: "#045ae2" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="text-center mt-4">
              <button
                onClick={handleReturnToRoleSelection}
                className="font-semibold underline hover:no-underline transition-all"
                style={{ fontFamily: "Kollektif, sans-serif", color: "#045ae2" }}
              >
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