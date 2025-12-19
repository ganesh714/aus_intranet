// App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RoutesConfig from "./routes";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

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
}

export default App;
