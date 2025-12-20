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
        element={<LoginForm setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} setUsersubRole={setUsersubRole} />} 
      />

      {isLoggedIn && userRole === 'HOD' && (
        <Route path='/hod-page' element={<HodPage />} />
      )}

      {isLoggedIn && userRole === 'Asso.Dean' && (
        <Route path='/Asso.dean-page' element={<Adeanpage />} />
      )}

      {isLoggedIn && userRole === 'Dean' && (
        <Route path='/dean-page' element={<DeanPage />} />
      )}

      {isLoggedIn && userRole === 'Officers' && (
        <Route path='/officers-page' element={<OfficersPage />} />
      )}

      {isLoggedIn && userRole === 'Admin' && (
        <Route path='/admin-page' element={<Adminpage />} />
      )}

      {isLoggedIn && userRole === 'Faculty' && (
        <>
            <Route path='/faculty-page' element={<FacultyDashboard />} />
            {/* <Route path='/it-faculty-page' element={<FacultyDashboard />} />
            <Route path='/cse-faculty-page' element={<FacultyDashboard />} />
            <Route path='/aiml-faculty-page' element={<FacultyDashboard />} />
            <Route path='/ce-faculty-page' element={<FacultyDashboard />} />
            <Route path='/mech-faculty-page' element={<FacultyDashboard />} />
            <Route path='/eee-faculty-page' element={<FacultyDashboard />} />
            <Route path='/ece-faculty-page' element={<FacultyDashboard />} />
            <Route path='/age-faculty-page' element={<FacultyDashboard />} />
            <Route path='/mpe-faculty-page' element={<FacultyDashboard />} />
            <Route path='/hmbs-faculty-page' element={<FacultyDashboard />} /> */}
        </>
      )}

      {isLoggedIn && userRole === 'Student' && (
        <Route path='/student-page' element={<StudentDashboard />} />
      )}

      {isLoggedIn && (
        <Route path='/add-file' element={<Add />} />
      )}

      <Route path='/reset-password' element={<ResetPassword />} />

      <Route
        path="*"
        element={
          <Navigate
            to={
              isLoggedIn
                ? userRole.toLowerCase() === "faculty"
                  ? `/${usersubRole.toLowerCase()}-faculty-page`
                : userRole === "Student"
                  ? `/student-page`
                  : `/${userRole.toLowerCase()}-page`
                : "/"
            }
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;