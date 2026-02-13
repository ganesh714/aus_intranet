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
<<<<<<< HEAD
import Developers from "./assets/components/Developers/Developers";
=======
import SubRoleManager from "./assets/components/Admin/SubRoleManager"; // [NEW]
import Developers from "./assets/components/Developers/Developers"; // [NEW]
>>>>>>> origin/intranet-v3

const getNavigatePath = (role, subRole) => {
  if (!role) return "/";
  const lowerRole = role.toLowerCase();

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
      <Route path='/' element={<Homepage />} />

      <Route
        path='/LoginForm'
        element={
          <LoginForm
            setIsLoggedIn={setIsLoggedIn}
            setUserRole={setUserRole}
            setUsersubRole={setUsersubRole}
          />
        }
      />

<<<<<<< HEAD
      {isLoggedIn && userRole === 'HOD' && <Route path='/hod-page' element={<HodPage />} />}
      {isLoggedIn && (userRole === 'Asso.Dean' || userRole === 'Assoc Dean' || userRole === 'Associate Dean') &&
        <Route path='/asso.dean-page' element={<Adeanpage />} />
      }
      {isLoggedIn && userRole === 'Dean' && <Route path='/dean-page' element={<DeanPage />} />}
      {isLoggedIn && userRole === 'Officers' && <Route path='/officers-page' element={<OfficersPage />} />}
      {isLoggedIn && userRole === 'Admin' && <Route path='/admin-page' element={<Adminpage />} />}
      {isLoggedIn && userRole === 'Faculty' && <Route path='/faculty-page' element={<FacultyDashboard />} />}
      {isLoggedIn && userRole === 'Student' && <Route path='/student-page' element={<StudentDashboard />} />}
      {isLoggedIn && <Route path='/add-file' element={<Add />} />}
=======
      {isLoggedIn && userRole === 'HOD' && (
        <Route path='/hod-page' element={<HodPage />} />
      )}

      {/* Normalized path for Asso.Dean and aliases */}
      {isLoggedIn && userRole === 'Asso.Dean' && (
        <Route path='/asso.dean-page' element={<Adeanpage />} />
      )}

      {isLoggedIn && userRole === 'Dean' && (
        <Route path='/dean-page' element={<DeanPage />} />
      )}

      {isLoggedIn && userRole === 'Officers' && (
        <Route path='/officers-page' element={<OfficersPage />} />
      )}

      {isLoggedIn && userRole === 'Admin' && (
        <>
          <Route path='/admin-page' element={<Adminpage />} />
          <Route path='/manage-subroles' element={<SubRoleManager />} />
        </>
      )}

      {isLoggedIn && userRole === 'Faculty' && (
        <Route path='/faculty-page' element={<FacultyDashboard />} />
      )}

      {isLoggedIn && userRole === 'Student' && (
        <Route path='/student-page' element={<StudentDashboard />} />
      )}

      {isLoggedIn && (
        <Route path='/add-file' element={<Add />} />
      )}
>>>>>>> origin/intranet-v3

      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='/developers' element={<Developers />} />

      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? getNavigatePath(userRole, usersubRole) : "/"} replace />}
      />
    </Routes>
  );
};

export default App;
