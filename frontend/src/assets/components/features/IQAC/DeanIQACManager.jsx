import React, { useState } from 'react';
import './IQAC.css';
import { FaChalkboardTeacher, FaUserTie, FaIndustry, FaGraduationCap } from 'react-icons/fa';

import DeanWorkshopManager from '../Workshops/DeanWorkshopManager';
import DeanGuestLecturesManager from '../GuestLectures/DeanGuestLecturesManager';
import DeanIndustrialVisitsManager from '../IndustrialVisits/DeanIndustrialVisitsManager';
import DeanFDP_PDPManager from '../FDP_PDP/DeanFDP_PDPManager';
import DeanFDP_STTP_OutsideManager from '../FDP_PDP/DeanFDP_STTP_OutsideManager';

const DeanIQACManager = ({ userRole }) => {
    const [activeTab, setActiveTab] = useState('workshops');

    const renderSubModule = () => {
        switch (activeTab) {
            case 'workshops':
                return <DeanWorkshopManager userRole={userRole} />;
            case 'guest-lectures':
                return <DeanGuestLecturesManager userRole={userRole} />;
            case 'industrial-visits':
                return <DeanIndustrialVisitsManager userRole={userRole} />;
            case 'fdp-pdp':
                return <DeanFDP_PDPManager userRole={userRole} />;
            case 'fdp-sttp-outside':
                return <DeanFDP_STTP_OutsideManager userRole={userRole} />;
            default:
                return <DeanWorkshopManager userRole={userRole} />;
        }
    };

    return (
        <div className="std-page-container iqac-container">
            <div className="std-page-header">
                <h2>Dean IQAC Overview</h2>
            </div>

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

            <div className="iqac-module-content" style={{ marginTop: '20px' }}>
                {renderSubModule()}
            </div>
        </div>
    );
};

export default DeanIQACManager;
