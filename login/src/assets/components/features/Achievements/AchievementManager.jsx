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
        let userAchievements = [];

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Filter by current user
                userAchievements = parsed.filter(a => a.userId === userId);
            } catch (e) {
                console.error("Failed to parse achievements", e);
            }
        }

        // --- SAMPLE DATA for DEMO ---
        const sampleAchievements = [
            {
                id: 'sample-1',
                type: 'Technical Certification',
                title: 'AWS Certified Solutions Architect',
                issuingBody: 'Amazon Web Services',
                date: '2023-11-15',
                status: 'Approved',
                proof: 'aws_cert.pdf'
            },
            {
                id: 'sample-2',
                type: 'Competitions & Awards',
                eventName: 'National Coding Hackathon 2023',
                organizer: 'TechIndia',
                rank: '1st Runner Up',
                date: '2023-09-20',
                status: 'Approved',
                proof: 'hackathon_cert.pdf'
            },
            {
                id: 'sample-3',
                type: 'Placements & Internships',
                companyName: 'Google',
                jobProfile: 'SDE Intern',
                package: '1.5 Lakh/mo',
                status: 'Pending',
                offerType: 'Internship'
            },
            {
                id: 'sample-4',
                type: 'Sports & Cultural Events',
                eventName: 'Inter-University Cricket Tournament',
                organizer: 'Sports Association',
                rank: 'Winner',
                date: '2023-02-10',
                status: 'Rejected',
                proof: 'winner_photo.jp'
            }
        ];

        // Combine samples with user data (Prepend samples for visibility)
        setAchievements([...sampleAchievements, ...userAchievements]);
    }, [userId]);

    // --- FILTER ---
    const [statusFilter, setStatusFilter] = useState('All');

    // Derived list
    const displayedAchievements = achievements.filter(ach => {
        if (statusFilter === 'All') return true;
        return ach.status === statusFilter;
    });

    const handleSave = (newAchievement) => {
        // ... (save logic same as before)
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

            {/* FILTER TOOLBAR (Only in List View) */}
            {activeTab === 'list' && (
                <div className="achievements-toolbar">
                    <p className="toolbar-description">
                        Manage and track your professional achievements
                    </p>
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
