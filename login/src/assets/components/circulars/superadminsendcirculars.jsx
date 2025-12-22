import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
const SendCirculars = () => {
  const [form, setForm] = useState({
    title: "",
    type: "",
    message: "",
    roles: [],
    department: "All",
    file: null,
  });

  const rolesList = ["Student", "Faculty", "HOD", "Dean", "Leadership"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRoleChange = (role) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    // ✅ MUST use FormData
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("type", form.type);
    formData.append("message", form.message);
    formData.append("department", form.department);

    // roles is array → stringify
    form.roles.forEach((role) => {
      formData.append("roles[]", role);
    });

    // ✅ IMPORTANT: append file
    if (form.file) {
      formData.append("file", form.file);
    }

    await axios.post(
      "http://localhost:5001/api/superadmin/circulars/send",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ DO NOT set Content-Type manually
          // axios will set multipart boundary automatically
        },
      }
    );

    alert("✅ Circular sent successfully");

    setForm({
      title: "",
      type: "",
      message: "",
      roles: [],
      department: "All",
      file: null,
    });

  } catch (error) {
    console.error(error);
    alert("❌ Failed to send circular");
  }
};

  return (
    <div className="container-fluid min-vh-100 p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold">📢 Send Circulars</h2>
        <p className="text-muted">Create and publish official university circulars</p>
      </div>

      {/* Card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Title & Type */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Circular Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  placeholder="Semester Exam Schedule – Jan 2026"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Circular Type</label>
                <select
                  className="form-select"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option>Academic</option>
                  <option>Administrative</option>
                  <option>Examination</option>
                  <option>Faculty / HR</option>
                  <option>General</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="mb-3">
              <label className="form-label">Circular Content</label>
              <textarea
                className="form-control"
                rows="5"
                name="message"
                placeholder="Write the circular details here..."
                value={form.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* File Upload */}
            <div className="mb-3">
              <label className="form-label">Attach Document (Optional)</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
              />
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
                      id={role}
                      checked={form.roles.includes(role)}
                      onChange={() => handleRoleChange(role)}
                    />
                    <label className="form-check-label" htmlFor={role}>
                      {role}
                    </label>
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

            {/* Footer */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="reset" className="btn btn-outline-danger">
                Reset
              </button>
              <button type="submit" className="btn btn-primary">
                Send Circular
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendCirculars;
