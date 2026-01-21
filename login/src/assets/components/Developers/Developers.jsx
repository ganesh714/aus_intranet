import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import './Developers.css';

// Example Import (Uncomment and change filename when you have the photo):
import sivaImg from "../images/siva_ganesh_v.png";
import venkat_ganesh from "../images/venkat_ganesh.jpg";
import veeranna from "../images/veeranna.jpeg";

const Developers = () => {
    // Fake photos using UI Avatars for now (Delete this helper once you have real photos)
    const getFakePhoto = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

    const developers = [
        {
            name: 'K. B. Surya',
            role: 'Full Stack Developer',
            status: 'Contributor',
            image: getFakePhoto('K. B. Surya'),
            description: 'Focuses on UI components and responsive design. Implements modern CSS framework features for a seamless look.',
            github: 'https://github.com/rtrter',
            linkedin: '#',
        },
        {
            name: 'E.V.V.Ganesh',
            role: 'Full Stack Developer',
            status: 'Contributor',
            image: venkat_ganesh,
            description: 'Designs and implements the user-facing part of the website using Reactjs. Focuses on performance and user experience.',
            github: 'https://github.com/ganesh714',
            linkedin: 'https://www.linkedin.com/in/venkata-ganesh-934072291/',
        },
        {
            name: 'Siva Ganesh',
            role: 'Full Stack Developer',
            status: 'Lead Developer',
            image: sivaImg,
            description: 'Handles both frontend and backend development of the website. Integrates data from the scraper into the web app and ensures end-to-end functionality.',
            github: 'https://github.com/SivaGaneshv1729',
            linkedin: 'https://www.linkedin.com/in/siva-ganesh-vemula/',
        },
        {
            name: 'Naga Veeranna',
            role: 'Full Stack Developer',
            status: 'Contributor',
            image: veeranna,
            description: 'Contributes to backend architecture and API optimization. Ensures smooth data flow and efficient database management.',
            github: 'https://github.com/NagaVeeranna',
            linkedin: 'https://www.linkedin.com/in/naga-veeranna-97a133286/',
        }
    ];

    return (
        <div className="developers-container">
            {/* Background Overlay to match Home theme feeling */}
            <div className="dev-overlay"></div>

            <div className="dev-content">
                <div className="dev-header">
                    {/* Logo Removed as requested */}
                    <h1>Meet Our Developers</h1>
                    <p>The talented team behind the Intranet Portal</p>
                </div>

                <div className="dev-grid">
                    {developers.map((dev, index) => (
                        <div key={index} className="dev-card">
                            <div className="dev-card-header">
                                <div className="dev-identity">
                                    <h3>{dev.name}</h3>
                                    <span className="dev-role">{dev.role}</span>
                                </div>
                                <div className="dev-image-wrapper">
                                    <img src={dev.image} alt={dev.name} className="dev-photo" />
                                </div>
                            </div>

                            <div className="dev-card-body">
                                <p>{dev.description}</p>
                            </div>

                            <div className="dev-card-footer">
                                <a href={dev.github} target="_blank" rel="noopener noreferrer" className="dev-btn github">
                                    <FaGithub /> GitHub Profile
                                </a>
                                <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="dev-btn linkedin">
                                    <FaLinkedin /> LinkedIn Profile
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Developers;
