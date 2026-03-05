import React, { useState } from 'react';
import './IQAC.css';
import { FaChalkboardTeacher, FaUserTie, FaIndustry, FaGraduationCap } from 'react-icons/fa';

import HODWorkshopManager from '../Workshops/HODWorkshopManager';
import HODGuestLecturesManager from '../GuestLectures/HODGuestLecturesManager';
import HODIndustrialVisitsManager from '../IndustrialVisits/HODIndustrialVisitsManager';
import HODFDP_PDPManager from '../FDP_PDP/HODFDP_PDPManager';
import HODFDP_STTP_OutsideManager from '../FDP_PDP/HODFDP_STTP_OutsideManager'; // [NEW]

const HODIQACManager = ({ userRole, userId }) => {
    // Determine which horizontal tab is currently active
    const [activeTab, setActiveTab] = useState('workshops');

    // Render the correct child component based on the active tab
    const renderSubModule = () => {
        switch (activeTab) {
            case 'workshops':
                return <HODWorkshopManager userRole={userRole} />;
            case 'guest-lectures':
                return <HODGuestLecturesManager userRole={userRole} />; // [NEW]
            case 'industrial-visits':
                return <HODIndustrialVisitsManager userRole={userRole} />; // [NEW]
            case 'fdp-pdp':
                return <HODFDP_PDPManager userRole={userRole} />;
            case 'fdp-sttp-outside':
                return <HODFDP_STTP_OutsideManager userRole={userRole} />; // [NEW]
            default:
                return <HODWorkshopManager userRole={userRole} />;
        }
    };

    return (
        <div className="std-page-container iqac-container">
            <div className="std-page-header">
                <h2>Department IQAC Overview</h2>
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
                <button
                    className={`std-tab-btn ${activeTab === 'fdp-sttp-outside' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fdp-sttp-outside')}
                >
                    <FaGraduationCap /> FDP / STTP (Outside)
                </button>
            </div>

            {/* Mount the selected Module */}
            <div className="iqac-module-content" style={{ marginTop: '20px' }}>
                {renderSubModule()}
            </div>
        </div>
    );
};

export default HODIQACManager;
