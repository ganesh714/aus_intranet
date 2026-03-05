import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaList } from 'react-icons/fa';
import AchievementList from './AchievementList';
import AchievementForm from './AchievementForm';
import './Achievements.css';
import axios from 'axios';

const AchievementManager = ({ userRole, userId }) => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'upload'
    const [achievements, setAchievements] = useState([]);

    // Load achievements from API on mount
    useEffect(() => {
        fetchAchievements();
    }, [userId]);

    const fetchAchievements = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-achievements`, {
                params: { userId }
            });
            setAchievements(response.data.achievements || []);
        } catch (error) {
            console.error("Failed to fetch achievements", error);
        }
    };

    // --- FILTER & SEARCH ---
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Derived list
    const displayedAchievements = achievements.filter(ach => {
        // Status Filter
        if (statusFilter !== 'All' && ach.status !== statusFilter) return false;

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const searchableText = [
                ach.title,
                ach.type,
                ach.issuingBody,
                ach.organizer,
                ach.publisher,
                ach.provider,
                ach.eventName,
                ach.companyName,
                ach.certificationName
            ].filter(Boolean).join(' ').toLowerCase();

            if (!searchableText.includes(query)) return false;
        }

        return true;
    });

    const handleSave = async (newAchievement) => {
        try {
            // Need to construct FormData if sending files
            // NOTE: The `AchievementForm` typically passes a JSON object. 
            // If it supports file uploads, we need to adapt it.
            // Assuming `newAchievement` object structure is what form gives.

            // Construct FormData from the newAchievement object
            const formData = new FormData();

            // Append explicit fields expected by backend
            formData.append('title', newAchievement.title);
            formData.append('type', newAchievement.type);
            formData.append('description', newAchievement.description || ''); // Safety check
            formData.append('date', newAchievement.date);
            formData.append('issuingBody', newAchievement.issuingBody || newAchievement.organizer || newAchievement.companyName || '');

            // Append user ID package
            const userJson = JSON.stringify({ id: userId });
            formData.append('user', userJson);

            // Append File if exists (Accommodate file object from form)
            // Note: Check how AchievementForm returns the file. 
            // For now, assuming it might be in `newAchievement.proof` (as File object)
            if (newAchievement.proof && newAchievement.proof instanceof File) {
                formData.append('proof', newAchievement.proof);
            }

            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-achievement`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Refresh list
            fetchAchievements();
            setActiveTab('list');

        } catch (error) {
            console.error("Error saving achievement:", error);
            alert("Failed to save achievement");
        }
    };

    return (
        <div className="std-page-container">
            <div className="std-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>My Achievements</h2>

                <div className="achievements-tabs" style={{ margin: 0 }}>
                    <button
                        className={`std-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        <FaList /> View All
                    </button>
                    <button
                        className={`std-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        <FaCloudUploadAlt /> Upload New
                    </button>
                </div>
            </div>

            {/* FILTER TOOLBAR (Only in List View) */}
            {activeTab === 'list' && (
                <div className="achievements-toolbar">
                    <p className="toolbar-description">
                        Manage and track your professional achievements
                    </p>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            className="std-input"
                            placeholder="Search achievements..."
                            style={{ width: '250px', padding: '8px 12px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <select
                            className="std-select"
                            style={{ width: 'auto', minWidth: '150px' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            )}

            {activeTab === 'list' && (
                <AchievementList
                    achievements={displayedAchievements}
                    onAddClick={() => setActiveTab('upload')}
                />
            )}

            {activeTab === 'upload' && (
                <AchievementForm
                    userRole={userRole}
                    userId={userId}
                    onCancel={() => setActiveTab('list')}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default AchievementManager;
