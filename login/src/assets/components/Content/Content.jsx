import React, { useState } from "react";
import "./Content.css";
<<<<<<< HEAD

const Content = () => {
  const [pdfLinks, setPdfLinks] = useState([]);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [showContentP, setShowContentP] = useState(true);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const role = sessionStorage.getItem("userRole");
        const subRole = sessionStorage.getItem("usersubRole");
        const response = await axios.get("http://localhost:5001/get-pdfs", {
          params: { role: role || "", subRole: subRole || "" },
        });

        if (response.data.pdfs) {
          // group by category
          const grouped = response.data.pdfs.reduce((acc, pdf) => {
            const category = pdf.category || "Uncategorized";
            if (!acc[category]) acc[category] = [];
            acc[category].push(pdf);
            return acc;
          }, {});

          // ensure default subcategories for each category (Documents / Announcements)
          const categories = Object.keys(grouped).map((cat) => {
            const items = [...grouped[cat]];
            const hasDocuments = items.some((it) => it.subcategory === "Documents");
            const hasAnnouncements = items.some((it) => it.subcategory === "Announcements");

            if (!hasDocuments) {
              items.push({
                name: "No documents uploaded yet",
                category: cat,
                subcategory: "Documents",
                filePath: null,
              });
            }
            if (!hasAnnouncements) {
              items.push({
                name: "No announcements uploaded yet",
                category: cat,
                subcategory: "Announcements",
                filePath: null,
              });
            }

            return { category: cat, items };
          });

          setPdfLinks(categories);
        }
      } catch (err) {
        console.error("Error fetching PDFs:", err);
      }
    };

    fetchPdfs();
  }, []);

  // clicking a subcategory — filter items and show them
  const handleSubCategoryClick = (categoryItems, subCat) => {
    const filtered = categoryItems.filter((it) => it.subcategory === subCat);
    setSelectedCategoryItems(filtered);
    setSelectedSubCategory(subCat);
    setShowContentP(false);
    setSelectedPdf(null);
    setSearchQuery("");
  };

  const handlePdfClick = (filePath, e) => {
    e.preventDefault();
    if (!filePath) return;
    const url = `http://localhost:5001/${filePath.replace(/\\/g, "/")}`;
    setSelectedPdf(url);
  };

  const filteredPdfs = selectedCategoryItems.filter((it) =>
    it.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setNoResults(filteredPdfs.length === 0 && searchQuery.length > 0);
  }, [filteredPdfs, searchQuery]);

  return (
    <div className="content-wrapper">
      {/* TOP NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
        <span className="navbar-brand">Aditya University — Intranet</span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#topNav"
          aria-controls="topNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="topNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {pdfLinks.map((cat, idx) => (
              <li key={idx} className="nav-item dropdown hover-dropdown mx-2">
                <span className="nav-link dropdown-toggle" role="button">
                  {cat.category}
                </span>

                {/* DROP-DOWN ON HOVER — subcategories horizontally stacked */}

    <div className="dropdown-on-hover shadow">
        {[...new Set(cat.items.map((i) => i.subcategory))].map((sub, sidx) => (
            <div
                key={sidx}
                className="dropdown-item"
                onClick={() => handleSubCategoryClick(cat.items, sub)}
            >
                {sub}
=======

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
import AchievementManager from "../features/Achievements/AchievementManager";
import HODAchievementManager from "../features/Achievements/HODAchievementManager";
import WorkshopManager from "../features/Workshops/WorkshopManager"; // [NEW]
import HODWorkshopManager from "../features/Workshops/HODWorkshopManager"; // [NEW]
import SubRoleManager from "../Admin/SubRoleManager"; // [NEW]

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
        } else if (categoryName === 'HODAchievements') {
            setActiveView('hod-achievements');
            setActiveCategory('HODAchievements');
        } else if (categoryName === 'Workshops') { // [NEW]
            setActiveView('workshops');
            setActiveCategory('Workshops');
        } else if (categoryName === 'HODWorkshops') { // [NEW]
            setActiveView('hod-workshops');
            setActiveCategory('HODWorkshops');
        } else if (categoryName === 'Manage SubRoles') { // [NEW]
            setActiveView('manage-subroles');
            setActiveCategory('Manage SubRoles');
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
        const finalUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_BACKEND_URL}/proxy-file/${url}`;

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
                return <Dashboard
                    userRole={userRole}
                    userId={userId}
                    userSubRole={userSubRole}
                    // Pass Navigation Handlers
                    onPersonalDataClick={handlePersonalDataClick}
                    onAchievementsClick={handleAchievementsClick}
                    onSendAnnounceClick={handleSendAnnounceClick}
                    onViewAnnouncementsClick={handleViewAnnouncementsClick}
                    onDirectCategoryClick={handleDirectCategoryClick}
                    // For subcategory navigations if needed in future
                    onSubCategoryClick={handleSubCategoryClick}
                />;

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

            case 'hod-achievements':
                return (
                    <HODAchievementManager
                        userRole={userRole}
                        userId={userId}
                    />
                );

            // [NEW] Workshop Module Routes
            case 'workshops':
                return (
                    <WorkshopManager
                        userRole={userRole}
                        userId={userId}
                    />
                );

            case 'hod-workshops':
                return (
                    <HODWorkshopManager
                        userRole={userRole}
                    />
                );

            case 'manage-subroles':
                return (
                    <SubRoleManager />
                );

            case 'category':
                return (
                    <CategoryViewer
                        userRole={userRole}
                        userSubRole={userSubRole}
                        categoryName={viewParams.category}
                        subCategoryName={viewParams.subCategory}
                        onPdfClick={handleFileClick}
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
                type={
                    activeView === 'announcements-feed' ? 'Announcements' :
                        activeView === 'personal-data' ? 'Personal Data' :
                            activeView === 'achievements' ? 'Achievements' :
                                activeView === 'hod-achievements' ? 'HODAchievements' :
                                    activeView === 'workshops' ? 'Workshops' : // [NEW]
                                        activeView === 'hod-workshops' ? 'HODWorkshops' :
                                            activeView === 'manage-subroles' ? 'Manage SubRoles' : ''
                }

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
>>>>>>> dfe66e3069dc2dac4650c1c8b66b6542e7e97295
            </div>
        ))}
    </div>

<<<<<<< HEAD
              </li>
            ))}
          </ul>
=======
            {/* File Viewer Modal */}
            {selectedFile && (
                <FileViewer
                    fileUrl={selectedFile}
                    fileType={selectedFileType}
                    fileName={selectedFileName}
                    onClose={handleCloseViewer}
                />
            )}
>>>>>>> dfe66e3069dc2dac4650c1c8b66b6542e7e97295
        </div>
      </nav>

      {/* SUBHEADER (shows selected category + subcategory) */}
      <div className="container py-3">
        {selectedSubCategory && (
          <div className="mb-3">
            <h6 className="m-0">
              Showing: <strong>{selectedSubCategory}</strong>
            </h6>
          </div>
        )}

        {/* CONTENT */}
        {showContentP ? (
          <p className="lead">
            Aditya University is a State Private University formed under the
            Andhra Pradesh Private Universities Act, 2016. Programs blend
            academic rigor with practical relevance...
          </p>
        ) : (
          <>
            {/* Search */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search PDFs in this subcategory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {noResults ? (
              <p className="text-danger">No search results found</p>
            ) : filteredPdfs.length > 0 ? (
              <div className="list-group">
                {filteredPdfs.map((item, i) => (
                  <button
                    key={i}
                    className="list-group-item list-group-item-action text-start"
                    onClick={(e) => item.filePath && handlePdfClick(item.filePath, e)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted">No items to display in this subcategory.</p>
            )}
          </>
        )}

        {/* PDF VIEWER */}
        {selectedPdf && (
          <div className="mt-4">
            <object
              data={selectedPdf}
              type="application/pdf"
              width="100%"
              height="700px"
            >
              <p>Your browser doesn't support embedded PDFs — download to view.</p>
            </object>

            <div className="mt-2">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedPdf(null)}
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;