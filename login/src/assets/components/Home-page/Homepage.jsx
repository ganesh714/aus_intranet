import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import logo from "../images/11.png";

const Homepage = () => {
  const navigate = useNavigate();

  return ( 
    <div className="landing-container" >
      <img 
        src={logo}
        alt="Logo" 
        className="top-left-image" 
      />
      
      <button className="button3" onClick={() => navigate('/LoginForm')}>
        Login
      </button>
      <p>Welcome to Aditya University Intranet</p>
    </div>
  );
};

export default Homepage;
