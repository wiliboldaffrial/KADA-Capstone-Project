import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/LoginAppHeader";

// UserContext to manage user state by Qem
const roleMapping = { 
  Admin: 'admin/receptionist',
  Nurse: 'nurse',
  Doctor: 'doctor',
};

const SignUpForm = () => {
  const navigate = useNavigate();

  // Form input states
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation error states
  const [roleError, setRoleError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Touched input tracking
  const [roleTouched, setRoleTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReturnToRoleSelection = () => {
    navigate("/");
  };

  const validateForm = () => {
    let isValid = true;
    setRoleError("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!role) {
      setRoleError("Please choose a role.");
      isValid = false;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Name is required.");
      isValid = false;
    } else if (trimmedName.length < 2) {
      setNameError("Name must be at least 2 characters.");
      isValid = false;
    } else if (trimmedName.length > 50) {
      setNameError("Name cannot exceed 50 characters.");
      isValid = false;
    } else if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
      setNameError("Name can only contain letters, spaces, hyphens, and apostrophes.");
      isValid = false;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (trimmedPassword.length < 8 || trimmedPassword.length > 64) {
      setPasswordError("Password must be 8-64 characters.");
      isValid = false;
    } else if (/\s/.test(trimmedPassword)) {
      setPasswordError("Password cannot contain spaces.");
      isValid = false;
    } else {
      const missing = [];
      if (!/[A-Z]/.test(trimmedPassword)) missing.push("uppercase letter");
      if (!/[a-z]/.test(trimmedPassword)) missing.push("lowercase letter");
      if (!/[0-9]/.test(trimmedPassword)) missing.push("number");
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` ]/.test(trimmedPassword)) missing.push("special character");

      if (missing.length) {
        setPasswordError(`Password must contain at least one ${missing.join(", ")}.`);
        isValid = false;
      }
    }

    const trimmedConfirm = confirmPassword.trim();
    if (!trimmedConfirm) {
      setConfirmPasswordError("Confirm password is required.");
      isValid = false;
    } else if (trimmedConfirm !== trimmedPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    return isValid;
  };

  useEffect(() => {
    validateForm();
  }, [role, name, email, password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: roleMapping[role], // Map role to backend format by Qem
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSubmissionMessage("Registration successful! Redirecting to login...");
          setIsSuccess(true);
          localStorage.setItem("role", role.toLowerCase());
          // Wait 2 seconds before redirecting
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setSubmissionMessage(data.message || "Registration failed");
          setIsSuccess(false);
        }
      } catch (error) {
        setSubmissionMessage("Network error. Please try again later.");
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    } else {
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
