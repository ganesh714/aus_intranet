import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaList } from 'react-icons/fa';
import AchievementList from './AchievementList';
import AchievementForm from './AchievementForm';
import './Achievements.css';

const AchievementManager = ({ userRole, userId }) => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'upload'
    const [achievements, setAchievements] = useState([]);

    // Load achievements from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('user_achievements');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Filter by current user
                const userAchievements = parsed.filter(a => a.userId === userId);
                setAchievements(userAchievements);
            } catch (e) {
                console.error("Failed to parse achievements", e);
            }
        }
    }, [userId]);

    const handleSave = (newAchievement) => {
        // Save to state
        const updated = [newAchievement, ...achievements];
        setAchievements(updated);

        // Update localStorage
        const stored = localStorage.getItem('user_achievements');
        let allAchievements = [];
        if (stored) {
            try {
                allAchievements = JSON.parse(stored);
            } catch (e) { }
        }
        allAchievements.push(newAchievement);

        localStorage.setItem('user_achievements', JSON.stringify(allAchievements));

        setActiveTab('list');
    };

    return (
        <div className="std-page-container">
            <div className="std-page-header">
                <h2>My Achievements</h2>

                <div className="achievements-tabs">
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

            {activeTab === 'list' && (
                <AchievementList
                    achievements={achievements}
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
