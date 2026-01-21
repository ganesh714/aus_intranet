import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import logo from "../images/11.png";
import { FaSun, FaMoon } from 'react-icons/fa'; // [NEW] Theme Icons

const Homepage = ({ theme, setTheme }) => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="glass-nav">
        <div className="nav-logo">
          <img src={logo} alt="Aditya University Logo" />
          <span>Intranet</span>
        </div>
        <div className="nav-links">
          <div
            className="header-icon-btn theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </div>
          <button className="nav-btn-glass" onClick={() => navigate('/LoginForm')}>
            Faculty / Student Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Centralized Hub for <span className="highlight-text">Aditya University</span>
          </h1>
          <p className="hero-subtitle">
            Seamlessly access your dashboard, manage institutional resources,
            and stay connected with the academic community.
          </p>
          <div className="hero-actions">
            <button className="cta-btn primary" onClick={() => navigate('/LoginForm')}>
              Member Portal Login
            </button>
            <button className="cta-btn secondary" onClick={() => window.open('https://adityauniversity.in/', '_blank')}>
              Visit Main Site
            </button>
          </div>
        </div>

        <div className="hero-visuals">
          <div className="glass-card card-highlight">
            <span className="material-symbols-outlined icon">verified</span>
            <div className="card-content">
              <h3>Secure Access</h3>
              <p>SSO Integration for Students & Faculty</p>
            </div>
          </div>
        </div>
      </header>

      {/* NEW: Quick Stats Module */}
      <section className="stats-banner">
        <div className="stats-grid-container">
          <div className="stat-pill">
            <span className="stat-num">50k+</span>
            <span className="stat-label">Students Globally</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-pill">
            <span className="stat-num">150+</span>
            <span className="stat-label">Academic Programs</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-pill">
            <span className="stat-num">100%</span>
            <span className="stat-label">Digital Presence</span>
          </div>
        </div>
      </section>

      {/* NEW: Campus Highlights Module */}
      <section className="highlights-section">
        <h2 className="section-title">Institutional Features</h2>
        <div className="highlights-grid">
          <div className="glass-card h-card">
            <span className="material-symbols-outlined h-icon">hub</span>
            <h3>Unified Dashboard</h3>
            <p>Single-window access to all academic and administrative tools.</p>
          </div>
          <div className="glass-card h-card">
            <span className="material-symbols-outlined h-icon">cloud_upload</span>
            <h3>E-Resources</h3>
            <p>Access high-quality study materials and teaching resources anywhere.</p>
          </div>
          <div className="glass-card h-card">
            <span className="material-symbols-outlined h-icon">notifications_active</span>
            <h3>Quick Alerts</h3>
            <p>Real-time notifications for official announcements and events.</p>
          </div>
        </div>
      </section>


      {/* Simple Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Aditya University. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;
