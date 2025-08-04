// src/components/RequireRole.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const RequireRole = ({ allowedRoles, children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />; // or a 403 Forbidden page
  }

  return children;
};

export default RequireRole;
