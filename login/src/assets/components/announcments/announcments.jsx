import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const SendAnnouncement = () => {
  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "normal",
    roles: [],
    department: "All",
    links: [{ label: "", url: "" }]
  });

  const rolesList = [
    "Student",
    "Faculty",
    "HOD",
    "Dean",
    "Leadership"
  ];

  // Handle simple input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle role checkbox
  const toggleRole = (role) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role]
    }));
  };

  // Handle links
  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...form.links];
    updatedLinks[index][field] = value;
    setForm({ ...form, links: updatedLinks });
  };

  const addLink = () => {
    setForm({ ...form, links: [...form.links, { label: "", url: "" }] });
  };

  const removeLink = (index) => {
    setForm({
      ...form,
      links: form.links.filter((_, i) => i !== index)
    });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.message || form.roles.length === 0) {
      alert("Title, Message and at least one role are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5001/api/announcements/send",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("✅ Announcement published");

      setForm({
        title: "",
        message: "",
        priority: "normal",
        roles: [],
        department: "All",
        links: [{ label: "", url: "" }]
      });
    } catch (error) {
      console.error(error);
      alert("❌ Failed to publish announcement");
    }
  };

  return (
    <div className="container-fluid p-4">
      <h3 className="fw-bold mb-3">📣 Send Announcement</h3>
      <p className="text-muted mb-4">
        Publish official announcements with optional links
      </p>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Message */}
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea
                className="form-control"
                rows="4"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            {/* Priority */}
            <div className="mb-3">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Roles */}
            <div className="mb-3">
              <label className="form-label">Target Roles</label>
              <div className="d-flex flex-wrap gap-3">
                {rolesList.map((role) => (
                  <div className="form-check" key={role}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={form.roles.includes(role)}
                      onChange={() => toggleRole(role)}
                    />
                    <label className="form-check-label">{role}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Department */}
            <div className="mb-3">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                name="department"
                value={form.department}
                onChange={handleChange}
              >
                <option>All</option>
                <option>CSE</option>
                <option>ECE</option>
                <option>EEE</option>
                <option>MECH</option>
                <option>CIVIL</option>
              </select>
            </div>

            {/* Links */}
            <div className="mb-3">
              <label className="form-label">Links (Optional)</label>

              {form.links.map((link, index) => (
                <div className="row g-2 mb-2" key={index}>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Label (e.g. Register Here)"
                      value={link.label}
                      onChange={(e) =>
                        handleLinkChange(index, "label", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://example.com"
                      value={link.url}
                      onChange={(e) =>
                        handleLinkChange(index, "url", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-2">
                    {index > 0 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={() => removeLink(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={addLink}
              >
                ➕ Add Link
              </button>
            </div>

            {/* Submit */}
            <div className="text-end mt-4">
              <button className="btn btn-primary px-4">
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendAnnouncement;
