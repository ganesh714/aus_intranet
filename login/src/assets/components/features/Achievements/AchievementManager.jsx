import React, { useState, useEffect } from 'react';
import AchievementList from './AchievementList';
import AchievementForm from './AchievementForm';
import './Achievements.css';

const AchievementManager = ({ userRole, userId }) => {
    const [view, setView] = useState('list'); // 'list' or 'form'
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

    const handleAddClick = () => {
        setView('form');
    };

    const handleCancel = () => {
        setView('list');
    };

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

        setView('list');
    };

    return (
        <>
            {view === 'list' && (
                <AchievementList
                    achievements={achievements}
                    onAddClick={handleAddClick}
                />
            )}
            {view === 'form' && (
                <AchievementForm
                    userRole={userRole}
                    userId={userId}
                    onCancel={handleCancel}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default AchievementManager;
