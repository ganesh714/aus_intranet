import React, { useState, useEffect } from 'react';
import './IQAC.css';
import { FaChalkboardTeacher, FaUserTie, FaIndustry, FaGraduationCap, FaBuilding } from 'react-icons/fa';
import axios from 'axios';

import HODWorkshopManager from '../Workshops/HODWorkshopManager';
import HODGuestLecturesManager from '../GuestLectures/HODGuestLecturesManager';
import HODIndustrialVisitsManager from '../IndustrialVisits/HODIndustrialVisitsManager';
import HODFDP_PDPManager from '../FDP_PDP/HODFDP_PDPManager';
import HODFDP_STTP_OutsideManager from '../FDP_PDP/HODFDP_STTP_OutsideManager';

const isDeanRole = (role) => ['Dean', 'Asso.Dean'].includes(role);

const HODIQACManager = ({ userRole, userId }) => {
    const [activeTab, setActiveTab] = useState('workshops');

    // Department selector state — Dean/Asso.Dean only
    const [allDepts, setAllDepts] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');

    useEffect(() => {
        if (isDeanRole(userRole)) {
            fetchAllDepts();
        }
    }, [userRole]);

    const fetchAllDepts = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/all-subroles`);
            if (res.data && res.data.success) {
                // Only show departmental subroles (those where HOD is an allowed role)
                const deptOnly = res.data.subRoles.filter(d =>
                    Array.isArray(d.allowedRoles) && d.allowedRoles.includes('HOD')
                );
                setAllDepts(deptOnly);
                if (deptOnly.length > 0) {
                    setSelectedDept(deptOnly[0]._id);
                }
            }
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    // HOD uses their own session dept; Dean uses the picker value
    const effectiveDept = isDeanRole(userRole)
        ? selectedDept
        : (sessionStorage.getItem('userSubRoleId') || sessionStorage.getItem('usersubRole'));

    const renderSubModule = () => {
        const props = { userRole, selectedDept: effectiveDept };
        switch (activeTab) {
            case 'workshops':         return <HODWorkshopManager {...props} />;
            case 'guest-lectures':    return <HODGuestLecturesManager {...props} />;
            case 'industrial-visits': return <HODIndustrialVisitsManager {...props} />;
            case 'fdp-pdp':           return <HODFDP_PDPManager {...props} />;
            case 'fdp-sttp-outside':  return <HODFDP_STTP_OutsideManager {...props} />;
            default:                  return <HODWorkshopManager {...props} />;
        }
    };

    return (
        <div className="std-page-container iqac-container">
            <div className="std-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <h2>Department IQAC Overview</h2>

                {/* Department Picker — Dean / Asso.Dean only */}
                {isDeanRole(userRole) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FaBuilding style={{ color: '#6366f1', fontSize: 16 }} />
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Department:</label>
                        <select
                            className="std-select"
                            value={selectedDept}
                            onChange={e => setSelectedDept(e.target.value)}
                            style={{ minWidth: 180 }}
                        >
                            {allDepts.length === 0 && (
                                <option value="">Loading departments...</option>
                            )}
                            {allDepts.map(d => (
                                <option key={d._id} value={d._id}>
                                    {d.displayName} — {d.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* IQAC Horizontal Navigation Tabs */}
            <div className="achievements-tabs">
                <button className={`std-tab-btn ${activeTab === 'workshops' ? 'active' : ''}`} onClick={() => setActiveTab('workshops')}>
                    <FaChalkboardTeacher /> Workshops
                </button>
                <button className={`std-tab-btn ${activeTab === 'guest-lectures' ? 'active' : ''}`} onClick={() => setActiveTab('guest-lectures')}>
                    <FaUserTie /> Guest Lectures
                </button>
                <button className={`std-tab-btn ${activeTab === 'industrial-visits' ? 'active' : ''}`} onClick={() => setActiveTab('industrial-visits')}>
                    <FaIndustry /> Industrial Visits
                </button>
                <button className={`std-tab-btn ${activeTab === 'fdp-pdp' ? 'active' : ''}`} onClick={() => setActiveTab('fdp-pdp')}>
                    <FaGraduationCap /> FDP / PDP
                </button>
                <button className={`std-tab-btn ${activeTab === 'fdp-sttp-outside' ? 'active' : ''}`} onClick={() => setActiveTab('fdp-sttp-outside')}>
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
