// SuperAdminLogin.jsx
import { useState, useEffect } from "react";
import { FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./superadmin.css";
import "bootstrap-icons/font/bootstrap-icons.css";


const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [animateCard, setAnimateCard] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateCard(true), 100);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:5001/api/superadmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || "Invalid Admin ID or Password");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("superAdminToken", data.token);
      }

      // Reset
      setForm({ email: "", password: "" });

      navigate("/superadmin/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMsg("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-wrapper d-flex justify-content-center align-items-center vh-100 position-relative">

      {/* LOGIN CARD WITH TRANSITION ONLY */}
      <div
        className={`login-card-container ${animateCard ? "show" : ""}`}
      >
        <div className="card shadow-lg p-4" style={{ width: "380px", borderRadius: "16px" }}>
          <div className="text-center mb-3">
            <FaUserShield className="display-4 text-danger mb-2" />
            <h3 className="fw-bold">Super Admin Login</h3>
            <p className="text-muted">Secure access for authorized personnel only</p>
          </div>

          <form onSubmit={handleLogin}>
            {errorMsg && (
              <div className="alert alert-danger py-2 text-center">
                {errorMsg}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold">Admin ID</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter Admin ID"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

        <div className="mb-4">
  <label className="form-label fw-semibold">Password</label>

  <div className="position-relative">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      className="form-control"
      placeholder="Enter Password"
      value={form.password}
      onChange={handleChange}
      required
    />

    <span
      className="password-toggle-icon"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? (
        <i className="bi bi-eye-slash"></i>
      ) : (
        <i className="bi bi-eye"></i>
      )}
    </span>
  </div>
</div>



            <button
              type="submit"
              className="btn btn-danger w-100 fw-bold py-2"
              style={{ borderRadius: "10px" }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
