import React from "react";
import { FaLink } from "react-icons/fa";
import "./announcments.css";

const AnnouncementPreview = ({ announcements = [], onViewMore }) => {
  if (announcements.length === 0) return null;

  return (
    <div className="flash-container">
      {/* Left label */}
      <div className="flash-label">Flash News</div>

      {/* Scrolling content */}
      <div className="flash-marquee">
        <div className="flash-track">
          {announcements.slice(0, 5).map((a, index) => (
            <span key={a._id || index} className={`flash-item ${a.priority}`}>
              <strong>{a.title}</strong> — {a.message}
              {a.links?.length > 0 && (
                <a
                  href={a.links[0].url}
                  target="_blank"
                  rel="noreferrer"
                  className="flash-link"
                >
                  <FaLink />
                </a>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* View more */}
      {announcements.length > 5 && (
        <div className="flash-view-more" onClick={onViewMore}>
          View more ↓
        </div>
      )}
    </div>
  );
};

export default AnnouncementPreview;
