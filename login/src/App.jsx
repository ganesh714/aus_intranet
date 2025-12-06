import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from "./assets/components/LoginForm/LoginForm";
import ResetPassword from "./assets/components/ResetPassword/ResetPassword";
import Add from "./assets/components/Add/Add";
import 'bootstrap/dist/css/bootstrap.min.css';

import HodPage from "./assets/components/HodPage/Hod";
import DeanPage from "./assets/components/DeanPage/Dean";
import FacultyPage from "./assets/components/FacultyPage/Faculty";
import OfficersPage from "./assets/components/OfficersPage/Officers";
import Adminpage from "./assets/components/Admin/Admin";

import Adeanpage from "./assets/components/Asso.Deanpage/AssoDean";


import Homepage from "./assets/components/Home-page/Homepage";
import ItFaculty from './assets/components/ItFacultyPage/ItFaculty';
import CseFaculty from './assets/components/CSE-Faculty-page/CSE-Faculty';
import AimlFaculty from './assets/components/AIML-Faculty-Page/AIML-Faculty';
import CeFaculty from './assets/components/CE-Faculty-Page/CE-Faculty';
import MechFaculty from './assets/components/MTECH-Faculty-Page/MTECH-Faculty';
// import MtechFaculty from './assets/components/MTECH-Faculty-Page/MTECH-Faculty';
import EeeFaculty from './assets/components/EEE-Faculty-Page/EEE-Faculty';
// import ItFaculty from './ItFacultyPage/ItFacultyPage';

import AgeFaculty from './assets/components/Ag.E-Faculty-Page/Ag.E-Faculty';
import HmbsFaculty from './assets/components/HMBS-Faculty-Page/HMBS-Faculty';
import MpeFaculty from './assets/components/MPE-Faculty-Page/MPE-Faculty';
import EceFaculty from './assets/components/ECE-Faculty-Page/ECE-Faculty';






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

      <Route
        path='/'
        element={<Homepage />}
      />

      <Route
        path='/LoginForm'
        element={<LoginForm setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} setUsersubRole={setUsersubRole} />}
      />

      {isLoggedIn && userRole === 'HOD' && (
        <Route
          path='/hod-page'
          element={<HodPage />}
        />
      )}

      {isLoggedIn && userRole === 'Asso.Dean' && (
        <Route
          path='/Asso.dean-page'
          element={<Adeanpage />}
        />
      )}

      {isLoggedIn && userRole === 'Dean' && (
        <Route
          path='/dean-page'
          element={<DeanPage />}
        />
      )}

      {isLoggedIn && userRole === 'Faculty' && usersubRole === 'IT' && (
        <Route
          path='/it-faculty-page'
          element={<ItFaculty />}
        />
      )}


      {isLoggedIn && userRole === 'Faculty' && usersubRole === 'CSE' && (
        <Route
          path='/cse-faculty-page'
          element={<CseFaculty />}
        />
      )}

      {isLoggedIn && userRole === 'Faculty' && usersubRole === 'AIML' && (
        <Route
          path='/aiml-faculty-page'
          element={<AimlFaculty />}
        />
      )}

      {isLoggedIn && userRole === 'Faculty' && usersubRole === 'CE' && (
        <Route
          path='/ce-faculty-page'
          element={<CeFaculty />}
        />
      )}
      {isLoggedIn && userRole === 'Faculty' && usersubRole === 'MECH' && (
        <Route
          path='/mech-faculty-page'
          element={<MechFaculty />}
        />
      )}

      {isLoggedIn && userRole === 'Faculty' && usersubRole === 'EEE' && (
        <Route
          path='/eee-faculty-page'
          element={<EeeFaculty />}
        />
      )}

      {isLoggedIn && userRole === 'Faculty' && usersubRole === 'ECE' && (
        <Route
          path='/ece-faculty-page'
          element={<EceFaculty />}
        />
      )}


      {isLoggedIn && userRole === 'Faculty' && usersubRole === 'Ag.E' && (
        <Route
          path='/age-faculty-page'
          element={<AgeFaculty />}
        />
      )}


      {isLoggedIn && userRole === 'Faculty' && usersubRole === 'MPE' && (
        <Route
          path='/mpe-faculty-page'
          element={<MpeFaculty />}
        />
      )}


      {isLoggedIn && userRole === 'Faculty' && usersubRole === 'HMBS' && (
        <Route
          path='/hmbs-faculty-page'
          element={<HmbsFaculty />}
        />
      )}



      {isLoggedIn && userRole === 'Officers' && (
        <Route
          path='/officers-page'
          element={<OfficersPage />}
        />
      )}

      {isLoggedIn && userRole === 'Admin' && (
        <Route
          path='/admin-page'
          element={<Adminpage />}
        />
      )}

      {isLoggedIn && (
        <Route
          path='/add-file'
          element={<Add />}
        />
      )}

      <Route
        path='/reset-password'
        element={<ResetPassword />}
      />

      <Route
        path="*"
        element={
          <Navigate
            to={
              isLoggedIn
                ? userRole.toLowerCase() === "faculty"
                  ? `/${usersubRole.toLowerCase()}-faculty-page`
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
