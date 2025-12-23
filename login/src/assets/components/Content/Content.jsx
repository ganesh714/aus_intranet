import React, { useState } from "react";
import "./Content.css";

// Import Components
import Sidebar from "../features/Sidebar/Sidebar";
import Dashboard from "../features/Dashboard/Dashboard";
import PersonalData from "../features/PersonalData/PersonalData";
import AnnouncementManager from "../features/Announcements/AnnouncementManager";
import CategoryViewer from "../features/Documents/CategoryViewer";
import ResourceRepository from "../features/Documents/ResourceRepository";
import PdfViewer from "../features/Documents/PdfViewer";
import MaterialManager from "../features/Materials/MaterialManager"; // Import the new component

const Content = () => {
    // --- USER INFO ---
    const userRole = sessionStorage.getItem('userRole');
    const userId = sessionStorage.getItem('userId');
    const userSubRole = sessionStorage.getItem('usersubRole');

    // --- STATE MANAGEMENT ---
    const [selectedPdf, setSelectedPdf] = useState(null);
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
    };

    const handleSendAnnounceClick = () => {
        setActiveView('announcements');
    };

    const handleViewAnnouncementsClick = () => {
        setActiveView('announcements-feed');
    };

    const handleSubCategoryClick = (categoryItems, subCategory, categoryName) => {

        // Only checking for Material
        if (categoryName === 'Student Related' && subCategory === 'Material') {
            setActiveView('material-manager');
            setViewParams({ category: categoryName, subCategory: subCategory });
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
        if (categoryName === 'Teaching Material') {
            setActiveView('material-manager');
            setActiveCategory('Teaching Material');
        } else if (categoryName === 'Time Table') {
            setActiveView('Time Table');
            setActiveCategory('Time Table');
        } else if (categoryName === 'Dept.Equipment') {
            setActiveView('category');
            setViewParams({
                category: 'Dept.Equipment',
                subCategory: 'Documents'
            });
            setActiveCategory('Dept.Equipment');
        }
    };

    // --- FIXED: Toggle Logic ---
    const toggleCategory = (categoryName) => {
        setActiveCategory(prev => prev === categoryName ? null : categoryName);
    };

    const handlePdfClick = (pdfPath, event) => {
        if (event) event.preventDefault();
        if (!pdfPath) return;

        const pdfUrl = `http://localhost:5001/${pdfPath.replace(/\\/g, '/')}`;
        setSelectedPdf(pdfUrl);
    };

    const handleBackClick = () => {
        setSelectedPdf(null);
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
                        onPdfClick={handlePdfClick}
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
                        onPdfClick={handlePdfClick}
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
                        onPdfClick={handlePdfClick}
                        initialMode="view"
                    />
                );

            case 'material-manager':
                return (
                    <MaterialManager
                        userRole={userRole}
                        userSubRole={userSubRole}
                        userId={userId}
                        onPdfClick={handlePdfClick}
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
                type={activeView === 'announcements-feed' ? 'Announcements' : activeView === 'personal-data' ? 'Personal Data' : ''}

                onDashboardClick={handleDashboardClick}
                onSendAnnounceClick={handleSendAnnounceClick}
                onViewAnnouncementsClick={handleViewAnnouncementsClick}
                onPersonalDataClick={handlePersonalDataClick}
                onToggleCategory={toggleCategory} // <--- FIXED: Passing handler
                onSubCategoryClick={handleSubCategoryClick}
                onDirectCategoryClick={handleDirectCategoryClick} // <--- New Prop for direct clicking main categories
            />

            {/* Main Content Area */}
            <div className="main-area">
                {renderActiveView()}
            </div>

            {/* PDF Viewer Modal */}
            {selectedPdf && (
                <PdfViewer
                    fileUrl={selectedPdf}
                    onClose={handleBackClick}
                />
            )}
        </div>
    );
};

export default Content;