import { Outlet } from "react-router-dom";
import SuperAdminNavbar from "./superadminnavigation";
import "./superadminnavbar.css";
const SuperAdminLayout = () => {
  return (
    <>
      <SuperAdminNavbar userName="Super Admin" />
      <Outlet />
    </>
  );
};

export default SuperAdminLayout;
