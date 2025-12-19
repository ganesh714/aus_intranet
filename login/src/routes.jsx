// Routes.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// Import all your pages/components
import Homepage from "./assets/components/Home-page/Homepage";
import LoginForm from "./assets/components/LoginForm/LoginForm";
import ResetPassword from "./assets/components/ResetPassword/ResetPassword";
import HodPage from "./assets/components/HodPage/Hod";
import DeanPage from "./assets/components/DeanPage/Dean";
import FacultyPage from "./assets/components/FacultyPage/Faculty";
import OfficersPage from "./assets/components/OfficersPage/Officers";
import SuperAdminLogin from "./assets/components/superadmin/superadmin";
import Add from "./assets/components/Add/Add";
import SuperAdminDashboard from "./assets/components/superadmin/superadmindasboard";

// Faculty subpages
import ItFaculty from "./assets/components/ItFacultyPage/ItFaculty";
import CseFaculty from "./assets/components/CSE-Faculty-page/CSE-Faculty";
import AimlFaculty from "./assets/components/AIML-Faculty-Page/AIML-Faculty";
import CeFaculty from "./assets/components/CE-Faculty-Page/CE-Faculty";
import MechFaculty from "./assets/components/MTECH-Faculty-Page/MTECH-Faculty";
import EeeFaculty from "./assets/components/EEE-Faculty-Page/EEE-Faculty";
import EceFaculty from "./assets/components/ECE-Faculty-Page/ECE-Faculty";
import AgeFaculty from "./assets/components/Ag.E-Faculty-Page/Ag.E-Faculty";
import HmbsFaculty from "./assets/components/HMBS-Faculty-Page/HMBS-Faculty";
import MpeFaculty from "./assets/components/MPE-Faculty-Page/MPE-Faculty";

// ProtectedRoute Component
const ProtectedRoute = ({ element: Component, ...props }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    // If not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
  return <Component {...props} />;
};

const RoutesConfig = ({ setIsLoggedIn, setUserRole, setUserId }) => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <LoginForm
            setIsLoggedIn={setIsLoggedIn}
            setUserRole={setUserRole}
            setUserId={setUserId}
          />
        }
      />
      <Route
        path="/login"
        element={
          <LoginForm
            setIsLoggedIn={setIsLoggedIn}
            setUserRole={setUserRole}
            setUserId={setUserId}
          />
        }
      />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login/superadmin" element={<SuperAdminLogin />} />

      {/* Protected routes */}
      <Route
        path="/hod-page"
        element={<ProtectedRoute element={HodPage} />}
      />
      <Route
        path="/dean-page"
        element={<ProtectedRoute element={DeanPage} />}
      />
      <Route
        path="/faculty-page"
        element={<ProtectedRoute element={FacultyPage} />}
      />
      <Route
        path="/officers-page"
        element={<ProtectedRoute element={OfficersPage} />}
      />
      <Route
        path="/add-file"
        element={<ProtectedRoute element={Add} />}
      />
      <Route
        path="/superadmin/dashboard"
        element={<ProtectedRoute element={SuperAdminDashboard} />}
      />

      {/* Faculty subpages */}
      <Route
        path="/it-faculty-page"
        element={<ProtectedRoute element={ItFaculty} />}
      />
      <Route
        path="/cse-faculty-page"
        element={<ProtectedRoute element={CseFaculty} />}
      />
      <Route
        path="/aiml-faculty-page"
        element={<ProtectedRoute element={AimlFaculty} />}
      />
      <Route
        path="/ce-faculty-page"
        element={<ProtectedRoute element={CeFaculty} />}
      />
      <Route
        path="/mech-faculty-page"
        element={<ProtectedRoute element={MechFaculty} />}
      />
      <Route
        path="/eee-faculty-page"
        element={<ProtectedRoute element={EeeFaculty} />}
      />
      <Route
        path="/ece-faculty-page"
        element={<ProtectedRoute element={EceFaculty} />}
      />
      <Route
        path="/age-faculty-page"
        element={<ProtectedRoute element={AgeFaculty} />}
      />
      <Route
        path="/mpe-faculty-page"
        element={<ProtectedRoute element={MpeFaculty} />}
      />
      <Route
        path="/hmbs-faculty-page"
        element={<ProtectedRoute element={HmbsFaculty} />}
      />

      {/* Fallback */}
      <Route path="*" element={<Homepage />} />
    </Routes>
  );
};

export default RoutesConfig;
