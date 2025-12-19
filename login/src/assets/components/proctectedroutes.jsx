// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // No token → redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token); // decode token

    // Check for role if allowedRoles provided
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return <Navigate to="/login" replace />;
    }

    // Token is valid and role allowed
    return children;
  } catch (err) {
    // Invalid token → remove and redirect
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
