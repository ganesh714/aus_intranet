import React, { useState } from 'react';
import './IQAC.css';
import { FaChalkboardTeacher, FaUserTie, FaIndustry, FaGraduationCap } from 'react-icons/fa';

import WorkshopManager from '../Workshops/WorkshopManager';
import GuestLecturesManager from '../GuestLectures/GuestLecturesManager';
import IndustrialVisitsManager from '../IndustrialVisits/IndustrialVisitsManager';
import FDP_PDPManager from '../FDP_PDP/FDP_PDPManager';
import FDP_STTP_OutsideManager from '../FDP_PDP/FDP_STTP_OutsideManager'; // [NEW]

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
                return <FDP_PDPManager userId={userId} userRole={userRole} />;
            case 'fdp-sttp-outside':
                return <FDP_STTP_OutsideManager userId={userId} userRole={userRole} />; // [NEW]
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
                {(userRole !== 'Faculty' || JSON.parse(sessionStorage.getItem('permissions') || '{}').canManageWorkshops) && (
                    <button
                        className={`std-tab-btn ${activeTab === 'workshops' ? 'active' : ''}`}
                        onClick={() => setActiveTab('workshops')}
                    >
                        <FaChalkboardTeacher /> Workshops
                    </button>
                )}

                {(userRole !== 'Faculty' || JSON.parse(sessionStorage.getItem('permissions') || '{}').canManageGuestLectures) && (
                    <button
                        className={`std-tab-btn ${activeTab === 'guest-lectures' ? 'active' : ''}`}
                        onClick={() => setActiveTab('guest-lectures')}
                    >
                        <FaUserTie /> Guest Lectures
                    </button>
                )}

                {(userRole !== 'Faculty' || JSON.parse(sessionStorage.getItem('permissions') || '{}').canManageIndustrialVisits) && (
                    <button
                        className={`std-tab-btn ${activeTab === 'industrial-visits' ? 'active' : ''}`}
                        onClick={() => setActiveTab('industrial-visits')}
                    >
                        <FaIndustry /> Industrial Visits
                    </button>
                )}
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

export default IQACManager;
