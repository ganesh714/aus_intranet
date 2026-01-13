import React, { useState } from "react";
import "./Content.css";

// Import Components
import Sidebar from "../features/Sidebar/Sidebar";
import Dashboard from "../features/Dashboard/Dashboard";
import PersonalData from "../features/PersonalData/PersonalData";
import AnnouncementManager from "../features/Announcements/AnnouncementManager";
import CategoryViewer from "../features/Documents/CategoryViewer";
import ResourceRepository from "../features/Documents/ResourceRepository";
import FileViewer from "../features/Documents/FileViewer";
import MaterialManager from "../features/Materials/MaterialManager";
import TimetableManager from "../features/Timetable/TimetableManager"; // [NEW IMPORT]
import AchievementManager from "../features/Achievements/AchievementManager"; // [NEW IMPORT]

const Content = () => {
    // --- USER INFO ---
    const userRole = sessionStorage.getItem('userRole');
    const userId = sessionStorage.getItem('userId');
    const userSubRole = sessionStorage.getItem('usersubRole');

    // --- STATE MANAGEMENT ---
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState(null);
    const [pdfLinks, setPdfLinks] = useState([]);

    // View State
    const [activeView, setActiveView] = useState('dashboard');
    const [viewParams, setViewParams] = useState({
        category: null,
        subCategory: null
    });
    const [deptFilter, setDeptFilter] = useState('All');

    // Sidebar State (FIXED: This was missing)
    const [activeCategory, setActiveCategory] = useState(null);

    // --- VIEW HANDLERS ---
    const handleDashboardClick = () => {
        setActiveView('dashboard');
        setActiveCategory(null); // Optional: Close menus when going to dashboard
    };

    const handlePersonalDataClick = () => {
        setActiveView('personal-data');
        setActiveCategory(null);
    };

    const handleAchievementsClick = () => {
        setActiveView('achievements');
        setActiveCategory(null);
    };

    const handleSendAnnounceClick = () => {
        setActiveView('announcements');
        setActiveCategory(null);
    };

    const handleViewAnnouncementsClick = () => {
        setActiveView('announcements-feed');
        setActiveCategory(null);
    };

    const handleSubCategoryClick = (categoryItems, subCategory, categoryName) => {

        // Only checking for Material
        if (categoryName === 'Student Related' && subCategory === 'Material') {
            setActiveView('material-manager');
            setViewParams({ category: categoryName, subCategory: subCategory });
            return;
        }

        // [NEW] Handle Time Table in Accordion
        if (categoryName === 'Student Related' && subCategory === 'Time Table') {
            setActiveView('timetable-manager');
            return;
        }

        // 3. Handle Announcements
        if (subCategory === 'Announcements') {
            setActiveView('announcements-feed');
            // If viewing specific category announcements, you might want to filter them here
            // But usually 'Announcements' in sidebar goes to general feed or category specific feed
            // keeping it simple for now:
            setViewParams({ category: categoryName, subCategory: 'Announcements' });
        } else {
            setActiveView('category');
            setViewParams({
                category: categoryName,
                subCategory: subCategory
            });
        }
    };

    // 2. Handle Direct Category Click (Students)
    // 2. Handle Direct Category Click (Students & Equipment)
    const handleDirectCategoryClick = (categoryName) => {
        if (categoryName === 'Material' || categoryName === 'Teaching Material') {
            setActiveView('material-manager');
            setActiveCategory('Material');
        } else if (categoryName === 'Time Table') {
            // [NEW] Direct Link for Students
            setActiveView('timetable-manager');
            setActiveCategory('Time Table');
        } else if (categoryName === 'Dept.Equipment') {
            setActiveView('category');
            setViewParams({
                category: 'Dept.Equipment',
                subCategory: 'Documents'
            });
            setActiveCategory('Dept.Equipment');
        } else if (categoryName === 'Faculty related') {
            setActiveView('announcements-feed');
            setViewParams({
                category: 'Faculty related',
                subCategory: 'Announcements'
            });
            setActiveCategory('Faculty related');
        }
    };

    // --- FIXED: Toggle Logic ---
    const toggleCategory = (categoryName) => {
        setActiveCategory(prev => prev === categoryName ? null : categoryName);
    };

    const handleFileClick = (url, type = null, name = null) => {
        if (!url) return;

        // Ensure proxy if it's a relative path (simplified check)
        // If it starts with http, leave it. If not, prepent proxy.
        const finalUrl = url.startsWith('http') ? url : `http://localhost:5001/proxy-file/${url}`;

        setSelectedFile(finalUrl);
        setSelectedFileType(type);
        setSelectedFileName(name);
    };

    const handleCloseViewer = () => {
        setSelectedFile(null);
        setSelectedFileType(null);
        setSelectedFileName(null);
    };

    // --- RENDER ACTIVE VIEW ---
    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard />;

            case 'personal-data':
                return (
                    <PersonalData
                        userId={userId}
                        userRole={userRole}
                        onFileClick={handleFileClick}
                    />
                );

            case 'announcements':
                return (
                    <AnnouncementManager
                        userRole={userRole}
                        userId={userId}
                        userSubRole={userSubRole}
                        currentViewCategory={viewParams.category}
                        deptFilter={deptFilter}
                        setDeptFilter={setDeptFilter}
                        onPdfClick={handleFileClick} // Using file handler
                        initialMode="send" // Helper to open directly in send mode if needed
                    />
                );

            case 'announcements-feed':
                return (
                    <AnnouncementManager
                        userRole={userRole}
                        userId={userId}
                        userSubRole={userSubRole}
                        currentViewCategory={viewParams.category} // Pass category to filter announcements
                        deptFilter={deptFilter}
                        setDeptFilter={setDeptFilter}
                        onPdfClick={handleFileClick} // Using file handler
                        initialMode="view"
                    />
                );

            case 'material-manager':
                return (
                    <MaterialManager
                        userRole={userRole}
                        userSubRole={userSubRole}
                        userId={userId}
                        onPdfClick={handleFileClick} // Using file handler
                    />
                );

            // [NEW CASE]
            case 'timetable-manager':
                return (
                    <TimetableManager
                        userRole={userRole}
                        userSubRole={userSubRole}
                        userId={userId}
                        onFileClick={handleFileClick}
                    />
                );

            case 'achievements':
                return (
                    <AchievementManager
                        userRole={userRole}
                        userId={userId}
                    />
                );

            case 'category':
                return (
                    <CategoryViewer
                        userRole={userRole}
                        userSubRole={userSubRole}
                        categoryName={viewParams.category}
                        subCategoryName={viewParams.subCategory}
                        onPdfClick={handlePdfClick}
                    />
                );

            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="content-wrapper">
            {/* Resource Repository - Handles PDF fetching side effects */}
            <ResourceRepository
                userRole={userRole}
                setPdfLinks={setPdfLinks}
            />

            {/* Sidebar */}
            <Sidebar
                userRole={userRole}
                pdfLinks={pdfLinks}
                activeCategory={activeCategory} // <--- FIXED: Passing state

                // Active highlighting flags
                showContentP={activeView === 'dashboard'}
                showSendAnnounce={activeView === 'announcements'}
                type={activeView === 'announcements-feed' ? 'Announcements' : activeView === 'personal-data' ? 'Personal Data' : activeView === 'achievements' ? 'Achievements' : ''}

                onDashboardClick={handleDashboardClick}
                onSendAnnounceClick={handleSendAnnounceClick}
                onViewAnnouncementsClick={handleViewAnnouncementsClick}
                onPersonalDataClick={handlePersonalDataClick}
                onAchievementsClick={handleAchievementsClick} // [NEW] Passing handler
                onToggleCategory={toggleCategory} // <--- FIXED: Passing handler
                onSubCategoryClick={handleSubCategoryClick}
                onDirectCategoryClick={handleDirectCategoryClick} // <--- New Prop for direct clicking main categories
            />

            {/* Main Content Area */}
            <div className="main-area">
                {renderActiveView()}
            </div>

            {/* File Viewer Modal */}
            {selectedFile && (
                <FileViewer
                    fileUrl={selectedFile}
                    fileType={selectedFileType}
                    fileName={selectedFileName}
                    onClose={handleCloseViewer}
                />
            )}
        </div>
    );
};

export default Content;