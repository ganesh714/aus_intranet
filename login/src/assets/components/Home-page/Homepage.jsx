// RoleLoginPage.jsx
import { useNavigate } from 'react-router-dom';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaSitemap, 
  FaUniversity, 
  FaLandmark, 
  FaUserShield 
} from 'react-icons/fa';
import './Homepage.css';
const RoleLoginPage = () => {
  const navigate = useNavigate();

  const time = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', hour12: true 
  });
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  const topRow = [
    { name: "Student Login",     icon: <FaUserGraduate />,    color: "from-blue-500 to-blue-600",    shadow: "shadow-blue-500/50" },
    { name: "Faculty Login",     icon: <FaChalkboardTeacher />, color: "from-indigo-500 to-indigo-600", shadow: "shadow-indigo-500/50" },
    { name: "HOD Login",         icon: <FaSitemap />,         color: "from-purple-500 to-purple-600", shadow: "shadow-purple-500/50" },
    { name: "Dean Login",        icon: <FaUniversity />,      color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/50" },
    { name: "Leadership Team",   icon: <FaLandmark />,        color: "from-amber-600 to-orange-600",    shadow: "shadow-amber-600/50" },
    { name: "Super Admin",       icon: <FaUserShield />,      color: "from-rose-600 to-red-700",        shadow: "shadow-rose-600/50" },
  ];

  const handleClick = (route) => {
    const routes = {
      "Student Login": "/login/student",
      "Faculty Login": "/login/faculty",
      "HOD Login": "/login/hod",
      "Dean Login": "/login/dean",
      "Leadership Team": "/login/leadership",
      "Super Admin": "/login/superadmin",
    };
    navigate(routes[route] || '/');
  };

  return (
  <>
  <div className="d-flex align-items-center justify-content-center">
  <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center py-5">
    <div className="container">
      <div className="row g-4">

        {topRow.map((item, index) => (
          <div key={index} className="col-md-4">
            <div className="card text-center p-4 role-card"
                onClick={() => handleClick(item.name)}
            >
              <div className="display-4 mb-3">{item.icon}</div>
              <h5 className="card-title fw-bold">{item.name}</h5>
            </div>
          </div>
        ))}

      </div>
    </div>

  </div>
  </div>
</>


  );
};

export default RoleLoginPage;