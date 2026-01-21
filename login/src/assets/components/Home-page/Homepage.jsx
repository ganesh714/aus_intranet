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
            Welcome to <span className="highlight-text">Aditya University</span>
          </h1>
          <p className="hero-subtitle">
            The central hub for Students, Faculty, and Administration.
            Access your dashboard, manage resources, and stay connected.
          </p>
          <div className="hero-actions">
            <button className="cta-btn primary" onClick={() => navigate('/LoginForm')}>
              Get Started
            </button>
            <button className="cta-btn secondary" onClick={() => window.open('https://aditya.ac.in', '_blank')}>
              Visit Main Site
            </button>
          </div>
        </div>

        {/* Decorative Glass Cards (Visual Only) */}
        <div className="hero-visuals">
          <div className="glass-card card-1">
            <span className="material-symbols-outlined icon">school</span>
            <div className="card-content">
              <h3>Students</h3>
              <p>Access Timetables & Material</p>
            </div>
          </div>
          <div className="glass-card card-2">
            <span className="material-symbols-outlined icon">badge</span>
            <div className="card-content">
              <h3>Faculty</h3>
              <p>Manage Classes & Resources</p>
            </div>
          </div>
        </div>
      </header>

      {/* Simple Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Aditya University. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;
