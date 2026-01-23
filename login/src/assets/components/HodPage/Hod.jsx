<<<<<<< HEAD
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import AnnouncementPreview from "../announcments/announcmentspreview";

const Hod = () => {
  const [announcements, setAnnouncements] = useState([]);
  const fullListRef = useRef(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const res = await axios.get(
        "http://localhost:5001/api/announcements/view",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAnnouncements(res.data.announcements || []);
    };
    fetchAnnouncements();
  }, []);

  const handleViewMore = () => {
    fullListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Flash announcements */}
      <AnnouncementPreview
        announcements={announcements}
        onViewMore={handleViewMore}
      />

      {/* Other dashboard content */}
      <h2 className="m-4">HOD Dashboard</h2>

      {/* Full list (scroll target) */}
      <div ref={fullListRef} className="m-4">
        {/* later: full announcements list */}
      </div>
    </>
  );
};
=======
import React from 'react';
import RenderHome from "../render-content/render-home";  // Fixing the import name
import Content from "../Content/Content";
import Add from "../Icon/Icon";
import { Link, useNavigate } from 'react-router-dom';
import './Hod.css';

function Hod() {
    return (
        <>
            <RenderHome />  {/* Using the correct component name */}
            <Content />
        </>
    );
}
>>>>>>> dfe66e3069dc2dac4650c1c8b66b6542e7e97295

export default Hod;
