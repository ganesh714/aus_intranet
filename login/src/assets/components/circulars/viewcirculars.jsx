import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFilePdf,
  FaEye,
  FaCalendarAlt,
  FaSearch
} from "react-icons/fa";
import "./viewcirculars.css";

const ViewCirculars = () => {
  const [circulars, setCirculars] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCirculars = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5001/api/circulars/view",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setCirculars(res.data.circulars || []);
      } catch (error) {
        console.error("Failed to fetch circulars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCirculars();
  }, []);

  const filteredCirculars = circulars.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <p className="loading-text">Loading circulars...</p>;
  }

  return (
    <div className="circular-page">
      {/* Header */}
      <div className="circular-header">
        <h2>📢 View Circulars</h2>
        <p>Official notices & announcements</p>
      </div>

      {/* Search */}
      <div className="circular-search">
        <FaSearch />
        <input
          type="text"
          placeholder="Search circulars..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Circular List */}
      <div className="circular-list">
        {filteredCirculars.map((circular) => (
          <div className="circular-card" key={circular._id}>
            <div className="card-left">
              <h4>{circular.title}</h4>

              <div className="card-meta">
                <span>
                  <FaCalendarAlt />{" "}
                  {new Date(circular.createdAt).toLocaleDateString()}
                </span>

                <span className="dept">
                  {circular.departments?.includes("All")
                    ? "All Departments"
                    : circular.departments.join(", ")}
                </span>
              </div>

              <span className="status new">New</span>
            </div>

            <div className="card-actions">
            <button
  className="view-btn"
  onClick={() => {
    if (circular.attachment?.fileUrl) {
      window.open(
        `http://localhost:5001${circular.attachment.fileUrl}`,
        "_blank"
      );
    }
  }}
>
  <FaEye /> View
</button>
            </div>
          </div>
        ))}

        {filteredCirculars.length === 0 && (
          <p className="no-data">No circulars found</p>
        )}
      </div>
    </div>
  );
};

export default ViewCirculars;
