import React from "react";
import { FaLink } from "react-icons/fa";

const AnnouncementList = React.forwardRef(({ announcements }, ref) => {
  return (
    <div ref={ref} className="announcement-full">
      <h4 className="mb-3">📢 All Announcements</h4>

      {announcements.map((a) => (
        <div key={a._id} className={`announcement-item ${a.priority}`}>
          <strong>{a.title}</strong>
          <p>{a.message}</p>

          {a.links?.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="announcement-link"
            >
              <FaLink /> {link.label}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
});

export default AnnouncementList;
