import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from "./assets/components/LoginForm/LoginForm";
import ResetPassword from "./assets/components/ResetPassword/ResetPassword";
import Add from "./assets/components/Add/Add";
import 'bootstrap/dist/css/bootstrap.min.css';

import HodPage from "./assets/components/HodPage/Hod";
import DeanPage from "./assets/components/DeanPage/Dean";
import OfficersPage from "./assets/components/OfficersPage/Officers";
import Adminpage from "./assets/components/Admin/Admin";
import Adeanpage from "./assets/components/Asso.Deanpage/AssoDean";
import Homepage from "./assets/components/Home-page/Homepage";

import FacultyDashboard from "./assets/components/FacultyDashboard/FacultyDashboard";
import StudentDashboard from "./assets/components/StudentDashboard/StudentDashboard";

const getNavigatePath = (role, subRole) => {
  if (!role) return "/";
  const lowerRole = role.toLowerCase();

  // Handle various spellings of Asso.Dean
  if (lowerRole.includes("asso") && lowerRole.includes("dean")) {
    return "/asso.dean-page";
  }

  if (lowerRole === "faculty") {
    return `/${subRole.toLowerCase()}-faculty-page`;
  }

  if (lowerRole === "student") {
    return `/student-page`;
  }

  return `/${lowerRole}-page`;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem('isLoggedIn') === 'true'
  );
  const [userRole, setUserRole] = useState(sessionStorage.getItem('userRole') || '');
  const [usersubRole, setUsersubRole] = useState(sessionStorage.getItem('usersubRole') || '');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Global Theme Effect
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    sessionStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = () => {
        window.history.go(1);
      };
    }
  }, [isLoggedIn]);

  return (
    <Routes>
      <Route path='/' element={<Homepage theme={theme} setTheme={setTheme} />} />
      <Route
        path='/LoginForm'
        element={<LoginForm setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} setUsersubRole={setUsersubRole} theme={theme} setTheme={setTheme} />}
      />

      {isLoggedIn && userRole === 'HOD' && (
        <Route path='/hod-page' element={<HodPage theme={theme} setTheme={setTheme} />} />
      )}

      {/* Normalized path for Asso.Dean */}
      {isLoggedIn && (userRole === 'Asso.Dean' || userRole === 'Assoc Dean') && (
        <Route path='/asso.dean-page' element={<Adeanpage theme={theme} setTheme={setTheme} />} />
      )}

      {isLoggedIn && userRole === 'Dean' && (
        <Route path='/dean-page' element={<DeanPage theme={theme} setTheme={setTheme} />} />
      )}

      {isLoggedIn && userRole === 'Officers' && (
        <Route path='/officers-page' element={<OfficersPage theme={theme} setTheme={setTheme} />} />
      )}

      {isLoggedIn && userRole === 'Admin' && (
        <Route path='/admin-page' element={<Adminpage theme={theme} setTheme={setTheme} />} />
      )}

      {isLoggedIn && userRole === 'Faculty' && (
        <Route path='/faculty-page' element={<FacultyDashboard theme={theme} setTheme={setTheme} />} />
      )}

      {isLoggedIn && userRole === 'Student' && (
        <Route path='/student-page' element={<StudentDashboard theme={theme} setTheme={setTheme} />} />
      )}

      {isLoggedIn && (
        <Route path='/add-file' element={<Add />} />
      )}

      <Route path='/reset-password' element={<ResetPassword />} />

      <Route
        path="*"
        element={
          <Navigate
            to={isLoggedIn ? getNavigatePath(userRole, usersubRole) : "/"}
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;