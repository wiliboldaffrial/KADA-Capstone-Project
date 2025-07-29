import React, { useState, useEffect } from "react"; // # Import useEffect
import AppHeader from "../../components/AppHeader";

// Component for the second step: Email and Password Login
const LoginForm = ({ role, onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // # State to track if a field has been "touched" (blurred) by the user
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // # State to track if the form has been submitted at least once
  const [formSubmitted, setFormSubmitted] = useState(false);

  // # State for form submission status
  const [isLoading, setIsLoading] = useState(false); // # Indicates if an API call is in progress
  const [submissionMessage, setSubmissionMessage] = useState(""); // # Message after submission (success/error)
  const [isSuccess, setIsSuccess] = useState(false); // # To style submission message

  // Function to validate the form fields
  const validateForm = () => {
    let isValid = true;

    // # Reset errors before re-validating
    setEmailError("");
    setPasswordError("");

    // Email Validation
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(emailTrimmed)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    // Password Validation (for login, primarily just required)
    const passwordTrimmed = password.trim();
    if (!passwordTrimmed) {
      setPasswordError("Password is required.");
      isValid = false;
    }

    return isValid;
  };

  // # Use useEffect to re-validate the form whenever input state changes
  useEffect(() => {
    // # This ensures that error messages and the button's disabled state update in real-time
    validateForm();
  }, [email, password]); // # Dependencies: re-run when email or password change

  const handleSubmit = async (e) => {
    // # Made handleSubmit async to handle fetch requests
    e.preventDefault();
    setFormSubmitted(true); // # Set formSubmitted to true on submission attempt
    setSubmissionMessage(""); // Clear any previous submission messages
    setIsSuccess(false); // Reset success status

    // Run front-end validation one last time before submission
    if (validateForm()) {
      setIsLoading(true); // # Set loading state to true
      try {
        // # This is where you would make an API call to your backend for authentication
        // # Replace '/api/login' with your actual backend login endpoint
        // # Replace 'http://localhost:5000' with your backend server URL if different
        const response = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
          }),
        });

        const data = await response.json(); // # Assuming your backend returns JSON

        if (response.ok) {
          // # Check if the response status is 2xx (success)
          setSubmissionMessage("Login successful!"); // # User-facing success message
          setIsSuccess(true);
          console.log("Login successful:", data);
          // # In a real app, you would typically store the authentication token (e.g., JWT)
          // # received from the backend here and then redirect the user to a protected route.
          // # Example: localStorage.setItem('authToken', data.token);
          // # Example: setTimeout(() => window.location.href = '/dashboard', 2000);
        } else {
          // # Handle backend errors (e.g., invalid credentials, user not found)
          setSubmissionMessage(`Login failed: ${data.message || "Invalid email or password."}`);
          setIsSuccess(false);
          console.error("Login failed:", data);
        }
      } catch (error) {
        // # Handle network errors or other unexpected issues
        setSubmissionMessage("Network error. Please try again later.");
        setIsSuccess(false);
        console.error("Error during login:", error);
      } finally {
        setIsLoading(false); // # Always set loading state to false after request completes
      }
    } else {
      // If validation fails, errors are already set by validateForm()
      setSubmissionMessage("Please correct the errors in the form.");
      setIsSuccess(false);
    }
  };

  // Determine if the submit button should be disabled
  // # This calculation now correctly reflects the real-time error states and loading state
  const isFormValid = email.trim() && password.trim() && !emailError && !passwordError;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative text-center">
        <AppHeader />
      </div>
      <div>
        <p className="text-center text-xl text-gray-700 mt-8" style={{ fontFamily: "Kollektif, sans-serif" }}>
          {role}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)} // # Set touched state on blur
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2] ${emailError && (emailTouched || formSubmitted) ? "border-red-500" : "border-gray-400"}`}
              style={{ fontFamily: "Kollektif, sans-serif" }}
            />
            {emailError && (emailTouched || formSubmitted) && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)} // # Set touched state on blur
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2] ${passwordError && (passwordTouched || formSubmitted) ? "border-red-500" : "border-gray-400"}`}
              style={{ fontFamily: "Kollektif, sans-serif" }}
            />
            {passwordError && (passwordTouched || formSubmitted) && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          {/* Submission Message */}
          {submissionMessage && <p className={`text-center text-sm mt-2 ${isSuccess ? "text-green-600" : "text-red-600"}`}>{submissionMessage}</p>}

          <button
            type="submit"
            disabled={!isFormValid || isLoading} // Disable button if not valid or loading
            className="w-full text-white py-3 px-4 rounded-full font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045ae2] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "Kollektif, sans-serif", backgroundColor: "#045ae2" }}
          >
            {isLoading ? "Logging In..." : "Login"} {/* # Show loading text */}
          </button>
        </form>
        <p className="text-center mt-4">
          <button onClick={onBack} className="font-semibold underline" style={{ fontFamily: "Kollektif, sans-serif", color: "#045ae2" }}>
            Back
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
