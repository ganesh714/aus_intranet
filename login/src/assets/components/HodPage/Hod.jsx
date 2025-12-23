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

export default Hod;
