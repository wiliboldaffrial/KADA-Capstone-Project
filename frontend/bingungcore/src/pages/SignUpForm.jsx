import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import AppHeader from "../components/AppHeader";

// Component for the Sign Up page
const SignUpForm = () => {

    const navigate = useNavigate();

  // State for form inputs
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for validation errors
  const [roleError, setRoleError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // # State to track if a field has been "touched" (blurred) by the user
  const [roleTouched, setRoleTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // # State to track if the form has been submitted at least once
  const [formSubmitted, setFormSubmitted] = useState(false);

  // State for form submission status
  const [isLoading, setIsLoading] = useState(false); // # Indicates if an API call is in progress
  const [submissionMessage, setSubmissionMessage] = useState(""); // # Message after submission (success/error)
  const [isSuccess, setIsSuccess] = useState(false); // # To style submission message

    const handleReturnToRoleSelection = () => {
        navigate('/');
    }

  // Function to validate all form fields
  const validateForm = () => {
    let isValid = true;

    // Reset all errors before re-validating
    setRoleError("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    // # submissionMessage and isSuccess are reset only on handleSubmit

    // Role Validation
    if (!role) {
      setRoleError("Please choose a role.");
      isValid = false;
    }

    // Name Validation
    const nameTrimmed = name.trim();
    if (!nameTrimmed) {
      setNameError("Name is required.");
      isValid = false;
    } else if (nameTrimmed.length < 2) {
      setNameError("Name must be at least 2 characters.");
      isValid = false;
    } else if (nameTrimmed.length > 50) {
      setNameError("Name cannot exceed 50 characters.");
      isValid = false;
    } else if (!/^[a-zA-Z\s'-]+$/.test(nameTrimmed)) {
      setNameError("Name can only contain letters, spaces, hyphens, and apostrophes.");
      isValid = false;
    }

    // Email Validation
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(emailTrimmed)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    // Password Validation
    const passwordTrimmed = password.trim();
    if (!passwordTrimmed) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (passwordTrimmed.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      isValid = false;
    } else if (passwordTrimmed.length > 64) {
      setPasswordError("Password cannot exceed 64 characters.");
      isValid = false;
    } else if (/\s/.test(passwordTrimmed)) {
      // Explicitly disallow spaces
      setPasswordError("Password cannot contain spaces.");
      isValid = false;
    } else {
      // # Enforce all four complexity types: uppercase, lowercase, number, special character
      let errors = [];
      if (!/[A-Z]/.test(passwordTrimmed)) {
        errors.push("uppercase letter");
      }
      if (!/[a-z]/.test(passwordTrimmed)) {
        errors.push("lowercase letter");
      }
      if (!/[0-9]/.test(passwordTrimmed)) {
        errors.push("number");
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` ]/.test(passwordTrimmed)) {
        errors.push("special character");
      }

      if (errors.length > 0) {
        // # Join multiple missing requirements into a single, clear message
        setPasswordError(`Password must contain at least one ${errors.join(", ")}.`);
        isValid = false;
      } else {
        setPasswordError(""); // # Clear error if all complexity rules are met
      }
    }

    // Confirm Password Validation
    const confirmPasswordTrimmed = confirmPassword.trim();
    if (!confirmPasswordTrimmed) {
      setConfirmPasswordError("Confirm password is required.");
      isValid = false;
    } else if (confirmPasswordTrimmed !== passwordTrimmed) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    return isValid;
  };

  // # Use useEffect to re-validate the form whenever any relevant input state changes
  useEffect(() => {
    // # This ensures that error messages and the button's disabled state update in real-time
    validateForm();
  }, [role, name, email, password, confirmPassword]); // # Dependencies: re-run when any of these change

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true); // # Set formSubmitted to true on submission attempt
    setSubmissionMessage(""); // Clear any previous submission messages
    setIsSuccess(false); // Reset success status

    // Run all front-end validations one last time before submission
    if (validateForm()) {
      setIsLoading(true); // # Set loading state to true
      try {
        // # This is where you would make an API call to your backend
        // # Replace '/api/register' with your actual backend registration endpoint
        // # Replace 'http://localhost:5000' with your backend server URL if different
        const response = await fetch("http://localhost:5000/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: role,
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
            // # confirmPassword is not typically sent to the backend
          }),
        });

        const data = await response.json(); // # Assuming your backend returns JSON

        if (response.ok) {
          // # Check if the response status is 2xx (success)
          setSubmissionMessage("Sign up successful! Redirecting...");
          setIsSuccess(true);
          console.log("Registration successful:", data);
          // # In a real app, you'd redirect the user or show a success page
          // # Example: setTimeout(() => onBack(), 2000); // Go back to login after 2 seconds
          navigate('/dashboard');
        } else {
          // # Handle backend errors (e.g., email already exists, invalid data)
          setSubmissionMessage(`Sign up failed: ${data.message || "An unknown error occurred."}`);
          setIsSuccess(false);
          console.error("Registration failed:", data);
        }
      } catch (error) {
        // # Handle network errors or other unexpected issues
        setSubmissionMessage("Network error. Please try again later.");
        setIsSuccess(false);
        console.error("Error during registration:", error);
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
  // # This calculation now correctly reflects the real-time error states
  const isFormValid = role && name.trim() && email.trim() && password.trim() && confirmPassword.trim() && !roleError && !nameError && !emailError && !passwordError && !confirmPasswordError;

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg w-full max-w-md">
            <div className="w-full max-w-sm mx-auto">
            <div>
                <AppHeader subtitle="Sign up" />
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {/* Role Selection */}
                <div>
                    <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    onBlur={() => setRoleTouched(true)} // # Set touched state on blur
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2] bg-white ${roleError && (roleTouched || formSubmitted) ? "border-red-500" : "border-gray-400"}`}
                    style={{ fontFamily: "Kollektif, sans-serif" }}
                    >
                    <option value="" disabled hidden>
                        Choose a role
                    </option>
                    <option id="admin" value="Admin">
                        Admin/Receptionist
                    </option>
                    <option id="nurse" value="Nurse">
                        Nurse
                    </option>
                    <option id="doctor" value="Doctor">
                        Doctor
                    </option>
                    </select>
                    {roleError && (roleTouched || formSubmitted) && <p className="text-red-500 text-sm mt-1">{roleError}</p>}
                </div>

                {/* Name Input */}
                <div>
                    <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setNameTouched(true)} // # Set touched state on blur
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2] ${nameError && (nameTouched || formSubmitted) ? "border-red-500" : "border-gray-400"}`}
                    style={{ fontFamily: "Kollektif, sans-serif" }}
                    />
                    {nameError && (nameTouched || formSubmitted) && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                </div>

                {/* Email Input */}
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

                {/* Password Input */}
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

                {/* Confirm Password Input */}
                <div>
                    <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setConfirmPasswordTouched(true)} // # Set touched state on blur
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#045ae2] ${confirmPasswordError && (confirmPasswordTouched || formSubmitted) ? "border-red-500" : "border-gray-400"}`}
                    style={{ fontFamily: "Kollektif, sans-serif" }}
                    />
                    {confirmPasswordError && (confirmPasswordTouched || formSubmitted) && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
                </div>

                {/* Submission Message */}
                {submissionMessage && <p className={`text-center text-sm mt-2 ${isSuccess ? "text-green-600" : "text-red-600"}`}>{submissionMessage}</p>}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!isFormValid || isLoading} // Disable if form is not valid or loading
                    className="w-full text-white py-3 px-4 rounded-full font-semibold transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#045ae2] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "Kollektif, sans-serif", backgroundColor: "#045ae2" }}
                >
                    {isLoading ? "Signing Up..." : "Sign up"} {/* # Show loading text */}
                </button>
                </form>
            </div>
            <p className="text-center text-sm text-gray-500 mt-8" style={{ fontFamily: "Kollektif, sans-serif" }}>
                Already have an account?{" "}
                <button onClick={handleReturnToRoleSelection} className="font-semibold hover:underline" style={{ color: "#045ae2" }}>
                Login
                </button>
            </p>
            </div>
        </div>
    </div>
  );
};

export default SignUpForm;
