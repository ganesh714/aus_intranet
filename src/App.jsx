import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Announcements from './pages/Announcements';
import Uploads from './pages/Uploads';
import Achievements from './pages/Achievements';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* Placeholders for other routes */}
          <Route path="announcements" element={<Announcements />} />
          <Route path="uploads" element={<Uploads />} />
          <Route path="achievements" element={<Achievements />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
