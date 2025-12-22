import { Outlet } from "react-router-dom";
import HodNavbar from "./hodnavbar";
import "./hodnavbar.css";
const HodLayout = () => {
  return (
    <>
      <HodNavbar userName="hod" />
      <Outlet />
    </>
  );
};

export default HodLayout;
