import React, { useEffect, useState } from "react";
import SuperAdminNavbar from "./superadminnavigation";
import QuickStats from "./qucikstats";
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
      <div className="container mt-4">
      <QuickStats />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
