import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaCogs,
  FaChartLine,
  FaSignOutAlt,
} from "react-icons/fa";
import "./superadminnavbar.css";

const SuperAdminNavbar = ({ userName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="top-navbar">
      {/* Left */}
      <div className="navbar-left">
        <span className="navbar-brand">SuperAdmin Panel</span>

        <NavLink to="/superadmin/dashboard" className="nav-link">
          <FaTachometerAlt /> Dashboard
        </NavLink>

        <NavLink to="/superadmin/users" className="nav-link">
          <FaUsers /> Users
        </NavLink>

        <NavLink to="/superadmin/settings" className="nav-link">
          <FaCogs /> Settings
        </NavLink>

        <div className="nav-dropdown">
          <span>
            <FaChartLine /> Reports
          </span>
          <div className="dropdown-menu">
            <NavLink to="/superadmin/reports/daily">Daily</NavLink>
            <NavLink to="/superadmin/reports/monthly">Monthly</NavLink>
            <NavLink to="/superadmin/reports/yearly">Yearly</NavLink>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="navbar-right">
        <span className="user-name">{userName}</span>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </nav>
  );
};

export default SuperAdminNavbar;
