import React, { useState } from 'react';
import './IQAC.css';
import { FaChalkboardTeacher, FaUserTie, FaIndustry, FaGraduationCap } from 'react-icons/fa';

import WorkshopManager from '../Workshops/WorkshopManager';
import GuestLecturesManager from '../GuestLectures/GuestLecturesManager';
import IndustrialVisitsManager from '../IndustrialVisits/IndustrialVisitsManager'; // [NEW]

// Placeholder empty components for the other 1 module
const FDP_PDP = () => <div className="iqac-placeholder"><h3>FDP / PDP Module</h3><p>Coming Soon...</p></div>;

const IQACManager = ({ userRole, userId }) => {
    // Determine which horizontal tab is currently active
    const [activeTab, setActiveTab] = useState('workshops');

    // Render the correct child component based on the active tab
    const renderSubModule = () => {
        switch (activeTab) {
            case 'workshops':
                return <WorkshopManager userId={userId} userRole={userRole} />;
            case 'guest-lectures':
                return <GuestLecturesManager userId={userId} userRole={userRole} />; // [NEW]
            case 'industrial-visits':
                return <IndustrialVisitsManager userId={userId} userRole={userRole} />; // [NEW]
            case 'fdp-pdp':
                return <FDP_PDP userId={userId} userRole={userRole} />;
            default:
                return <WorkshopManager userId={userId} userRole={userRole} />;
        }
    };

    return (
        <div className="std-page-container iqac-container">
            <div className="std-page-header">
                <h2>Internal Quality Assurance Cell (IQAC)</h2>
            </div>

            {/* IQAC Horizontal Navigation Tabs */}
            <div className="achievements-tabs">
                <button
                    className={`std-tab-btn ${activeTab === 'workshops' ? 'active' : ''}`}
                    onClick={() => setActiveTab('workshops')}
                >
                    <FaChalkboardTeacher /> Workshops
                </button>
                <button
                    className={`std-tab-btn ${activeTab === 'guest-lectures' ? 'active' : ''}`}
                    onClick={() => setActiveTab('guest-lectures')}
                >
                    <FaUserTie /> Guest Lectures
                </button>
                <button
                    className={`std-tab-btn ${activeTab === 'industrial-visits' ? 'active' : ''}`}
                    onClick={() => setActiveTab('industrial-visits')}
                >
                    <FaIndustry /> Industrial Visits
                </button>
                <button
                    className={`std-tab-btn ${activeTab === 'fdp-pdp' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fdp-pdp')}
                >
                    <FaGraduationCap /> FDP / PDP
                </button>
            </div>

            {/* Mount the selected Module */}
            <div className="iqac-module-content" style={{ marginTop: '20px' }}>
                {renderSubModule()}
            </div>
        </div>
    );
};

export default IQACManager;
