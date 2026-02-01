import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import './Developers.css';

// Example Import (Uncomment and change filename when you have the photo):
import sivaImg from "../images/siva_ganesh_v.png";
import venkat_ganesh from "../images/venkat_ganesh.jpg";
import veeranna from "../images/veeranna.jpeg";
import surya from "../images/surya.jpeg";
import prakash from "../images/prakash.jpeg";
import pavan from "../images/pavan.jpeg";

const Developers = () => {
    // Fake photos using UI Avatars for now (Delete this helper once you have real photos)
    const getFakePhoto = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

    const developers = [
        {
            name: 'K. B. S. V. Shankar',
            role: 'Project Lead & Analyst',
            status: 'Lead',
            image: surya,
            description: 'Served as the primary point of contact, bridging the gap between client requirements and technical implementation. Conducted initial database schema research and coordinated team efforts.',
            github: 'https://github.com/kuntella-surya',
            linkedin: 'https://www.linkedin.com/in/suryakuntella/',
            rollNo: '24A95A4406',
            branch: 'DS',
        },
        {
            name: 'Venkata Ganesh',
            role: 'System Architect & Full Stack Dev',
            status: 'Contributor',
            image: venkat_ganesh,
            description: 'Engineered the core system architecture, refactoring the backend into modular services using SOLID principles. Spearheaded the frontend development and delivered key modules like the Dashboard.',
            github: 'https://github.com/ganesh714',
            linkedin: 'https://www.linkedin.com/in/venkata-ganesh-934072291/',
            rollNo: '23A91A6115',
            branch: 'AIML',
        },
        {
            name: 'T Siva Ganesh Vemula',
            role: 'UI/UX & Full Stack Developer',
            status: 'Lead Developer',
            image: sivaImg,
            description: 'Established the frontend file structure and design system. Created the initial UI concepts in Stitch and handled complex backend integrations to ensure a seamless user experience.',
            github: 'https://github.com/SivaGaneshv1729',
            linkedin: 'https://www.linkedin.com/in/siva-ganesh-vemula/',
            rollNo: '23A91A6164',
            branch: 'AIML',
        },
        {
            name: 'Naga Veeranna',
            role: 'Quality Assurance Engineer',
            status: 'Contributor',
            image: veeranna,
            description: 'Ensured system stability through rigorous testing and validation. Managed data integrity during schema updates and handled operational communication during deployment phases.',
            github: 'https://github.com/NagaVeeranna',
            linkedin: 'https://www.linkedin.com/in/naga-veeranna-97a133286/',
            rollNo: '24A95A6103',
            branch: 'AIML',
        },
        {
            name: 'Ch Bhanu Prakash',
            role: 'Front End Developer',
            status: 'Contributor',
            image: prakash,
            description: 'Developed the frontend using React and styled it using Tailwind CSS.',
            github: 'https://github.com/prakash-chandaka007',
            linkedin: 'www.linkedin.com/in/prakash-chandaka',
            rollNo: '25B21AI045',
            branch: 'AIML',
        },
        {
            name: 'M Pavan Kumar',
            role: 'Front End Developer',
            status: 'Contributor',
            image: pavan,
            description: 'Developed the frontend using React and styled it using Tailwind CSS.',
            github: 'https://github.com/pavan1173',
            linkedin: 'https://www.linkedin.com/in/m-pavan-kumar-7a3228338?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
            rollNo: '25B11CS255',
            branch: 'CSE',
        }
    ];

    return (
        <div className="developers-container">
            {/* Background Overlay to match Home theme feeling */}
            <div className="dev-overlay"></div>

            <div className="dev-content">
                <div className="dev-header">
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
                                    <div className="dev-details">
                                        <span className="dev-roll">ID: {dev.rollNo}</span>
                                        <span className="dev-separator">|</span>
                                        <span className="dev-branch">{dev.branch}</span>
                                    </div>
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