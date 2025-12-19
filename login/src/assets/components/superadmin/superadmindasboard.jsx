import React, { useEffect, useState } from "react";
import SuperAdminNavbar from "./superadminnavigation";

const SuperAdminDashboard = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedId = localStorage.getItem("userId");

    if (storedRole !== "SuperAdmin") {
      // Redirect non-superadmins
      window.location.href = "/login";
    }

    // Optionally fetch SuperAdmin name from API
    setUserName(storedId || "SuperAdmin");
  }, []);

  return (
    <div>
      <SuperAdminNavbar userName={userName} />
      <div className="container mt-4">
        <h1>Welcome to SuperAdmin Dashboard</h1>
        <p>Here you can manage users, settings, and view reports.</p>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
