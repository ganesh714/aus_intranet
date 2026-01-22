import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaChalkboardTeacher, FaUniversity, FaLaptopCode, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { MdSecurity, MdNotificationsActive, MdCloudQueue, MdGroups } from 'react-icons/md';
import './Homepage.css';
import logo from "../images/11.png";
import heroImage from "../images/hero_dashboard_v3-1.png";

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Aditya University Logo" className="h-16 w-auto" />
          </div>

          <div className="hidden md:flex space-x-8 text-sm font-semibold text-gray-600">
            {['Home', 'About Us', 'Developers', 'Contact'].map((item) => (
              <a key={item} href="#" className="hover:text-orange-600 transition-colors relative group">
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/LoginForm')}
              className="px-6 py-2 text-blue-900 font-semibold hover:text-orange-600 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/LoginForm')}
              className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-full hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5"
            >
              Student Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 text-left space-y-6 animate-fade-in-up">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider rounded-full mb-2 border border-blue-100">
            Welcome to the Future of Learning
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">Future Leaders</span> <br />
            with Innovation
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
            Aditya University provides a world-class education ecosystem, blending academic excellence with cutting-edge technology and seamless digital management using our exclusive Intranet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => navigate('/LoginForm')}
              className="px-8 py-3.5 bg-blue-900 text-white text-base font-bold rounded-full hover:bg-blue-800 transition-all shadow-xl hover:shadow-blue-900/20 transform hover:-translate-y-1"
            >
              Access Intranet
            </button>
            <button
              className="px-8 py-3.5 bg-white text-gray-700 border border-gray-200 text-base font-bold rounded-full hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 transition-all shadow-md"
            >
              Explore Courses
            </button>
          </div>
        </div>

        <div className="md:w-1/2 relative animate-fade-in-right">
          <div className="relative z-10">
            <img
              src={heroImage}
              alt="Dashboard Preview"
              className="w-full h-auto drop-shadow-2xl rounded-2xl animate-float"
            />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100 to-orange-50 blur-3xl rounded-full -z-10 opacity-70"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">Why Choose Aditya University?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Experience a seamless blend of academics and technology designed to elevate your educational journey.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <MdSecurity size={30} />, title: "Secure Data", desc: "Enterprise-grade security for all student and faculty records.", color: "bg-blue-100 text-blue-600" },
              { icon: <MdNotificationsActive size={30} />, title: "Real-time Updates", desc: "Instant notifications for classes, exams, and campus events.", color: "bg-orange-100 text-orange-600" },
              { icon: <MdCloudQueue size={30} />, title: "Cloud Storage", desc: "Unlimited access to study materials and lecture notes anywhere.", color: "bg-green-100 text-green-600" },
              { icon: <MdGroups size={30} />, title: "Seamless Connect", desc: "Integrated platform for faculty-student collaboration.", color: "bg-purple-100 text-purple-600" }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Meet Our Expert Faculty</h2>
            <p className="text-gray-500">Guided by visionary leaders and accomplished academicians.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Dr. N. Sesha Reddy", role: "Chairman", img: "https://i.pravatar.cc/300?img=11" },
              { name: "Dr. A. Ramachandra", role: "Principal", img: "https://i.pravatar.cc/300?img=68" },
              { name: "Dr. S. Priya", role: "Dean of Academics", img: "https://i.pravatar.cc/300?img=49" }
            ].map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <div className="h-64 overflow-hidden relative">
                  <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-blue-900/0 transition-colors z-10"></div>
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-blue-900 mb-1">{member.name}</h3>
                  <p className="text-orange-500 font-medium text-sm">{member.role}</p>
                  <button className="mt-4 px-4 py-2 border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:bg-blue-900 hover:text-white transition-colors">View Profile</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-6 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-orange-400 font-bold tracking-widest uppercase text-sm mb-2">Workflow</p>
            <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-0">
            {[
              { step: "01", title: "Login to Portal", desc: "Use your university credentials to access the secure Intranet." },
              { step: "02", title: "Access Dashboard", desc: "View attendance, marks, and announcements in one place." },
              { step: "03", title: "Manage Academics", desc: "Stay organized with digital materials and real-time updates." }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center px-6 md:w-1/3 relative">
                <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-bold shadow-lg mb-6 z-10 border-4 border-blue-800">
                  {item.step}
                </div>
                {idx !== 2 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-blue-700 -z-0"></div>}
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-blue-100 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1470" alt="Students" className="rounded-2xl shadow-2xl" />
          </div>
          <div className="md:w-1/2">
            <p className="text-orange-600 font-bold mb-4 uppercase tracking-wider text-sm">What Our Students Say</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">"The Aditya Intranet has completely transformed how I manage my studies. Everything I need is just a click away."</h2>
            <div className="flex items-center gap-4">
              <img src="https://i.pravatar.cc/100?img=5" alt="Student" className="w-12 h-12 rounded-full border-2 border-orange-500" />
              <div>
                <p className="font-bold text-blue-900">Ravi Kumar</p>
                <p className="text-sm text-gray-500">Computer Science, 3rd Year</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white">A</div>
              <span className="text-xl font-bold text-white">Aditya University</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Empowering students with knowledge, skills, and values to become global leaders.
            </p>
            <div className="flex gap-4 pt-2">
              <FaFacebook className="hover:text-orange-500 cursor-pointer transition-colors" />
              <FaTwitter className="hover:text-orange-500 cursor-pointer transition-colors" />
              <FaLinkedin className="hover:text-orange-500 cursor-pointer transition-colors" />
              <FaInstagram className="hover:text-orange-500 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-orange-500 cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors">Admissions</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors">Campus Life</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors">Placements</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-orange-500 cursor-pointer transition-colors">Student Portal</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors">Faculty Login</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors">Library</li>
              <li className="hover:text-orange-500 cursor-pointer transition-colors">Examinations</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>Aditya Nagar, ADB Road, Surampalem</li>
              <li>East Godavari District, A.P - 533437</li>
              <li className="pt-2"><span className="text-orange-500">Phone:</span> +91 99999 99999</li>
              <li><span className="text-orange-500">Email:</span> info@aditya.ac.in</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-600 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2026 Aditya University. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
