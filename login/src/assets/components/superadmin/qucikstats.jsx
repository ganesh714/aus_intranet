import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserGraduate, FaChalkboardTeacher, FaUsers, FaBuilding } from "react-icons/fa";
import "./superadmin.css"
const QuickStats = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
  const token = localStorage.getItem("token");

  axios.get("http://localhost:5001/api/superadmin/quick-stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(res => setStats(res.data))
  .catch(err => console.error(err));
}, []);

  const statCards = [
    { title: "Total Students", value: stats.totalStudents, icon: <FaUserGraduate /> },
    { title: "Total Faculty", value: stats.totalFaculty, icon: <FaChalkboardTeacher /> },
    { title: "Total HODs", value: stats.totalHODs, icon: <FaUsers /> },
    { title: "Total Deans", value: stats.totalDeans, icon: <FaUsers /> },
    { title: "Pending Faculty Approvals", value: stats.pendingFacultyApprovals, icon: <FaUsers /> },
    { title: "Active Departments", value: stats.activeDepartments, icon: <FaBuilding /> },
  ];

  return (
    <div className="quick-stats">
      {statCards.map((card, idx) => (
        <div key={idx} className="stat-card">
          <div className="icon">{card.icon}</div>
          <div className="info">
            <h3>{card.value ?? 0}</h3>
            <p>{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
