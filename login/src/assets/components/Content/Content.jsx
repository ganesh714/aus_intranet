import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Content.css"; // Ensure this file exists and contains all your styles

// Import Feature Components
import Sidebar from "../features/Sidebar/Sidebar";
import AnnouncementForm from "../features/Announcements/AnnouncementForm";
import AnnouncementFeed from "../features/Announcements/AnnouncementFeed";
import DocumentView from "../features/Documents/DocumentView";
import PdfViewer from "../features/Documents/PdfViewer";

const Content = () => {
    // --- STATE MANAGEMENT ---
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [pdfLinks, setPdfLinks] = useState([]);
    const [selectedCategoryPdfs, setSelectedCategoryPdfs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [noResults, setNoResults] = useState(false);
    
    const [activeCategory, setActiveCategory] = useState(null);
    const [currentViewCategory, setCurrentViewCategory] = useState(null);
    
    const [showDocuments, setShowDocuments] = useState(false);
    const [showContentP, setShowContentP] = useState(true);
    const [type, settype] = useState();

    const [deptFilter, setDeptFilter] = useState('All');
    const [generalAnnouncements, setGeneralAnnouncements] = useState([]);
    const [showSendAnnounce, setShowSendAnnounce] = useState(false);
    const [myAnnouncements, setMyAnnouncements] = useState([]);
    const [announceForm, setAnnounceForm] = useState({
        title: '',
        description: '',
        targetRole: '', 
        targetSubRole: 'All',
        file: null
    });

    const userRole = sessionStorage.getItem('userRole');
    const userEmail = sessionStorage.getItem('userEmail');
    const userSubRole = sessionStorage.getItem('usersubRole');

    // --- CONFIGURATION / CONSTANTS ---
    const subRolesMapping = {
        'Student': ['All', 'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE', 'ECE', 'Ag.E', 'MPE', 'FED'],
        'Faculty': ['All', 'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE', 'ECE', 'Ag.E', 'MPE', 'FED'],
        'HOD':     ['All', 'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE', 'ECE', 'Ag.E', 'MPE', 'FED'],
        'Dean':    ['All', 'IQAC', 'R&C', 'ADMIN', 'CD', 'SA', 'IR', 'AD', 'SOE', 'COE', 'SOP'],
        'Asso.Dean': ['All', 'SOE', 'IQAC', 'AD', 'FED'],
        'Officers':  ['All', 'DyPC', 'VC', 'ProVC', 'Registrar'],
        'Admin':     ['All'], 
        'All':       ['All']
    };

    const getTargetRoles = () => {
        switch(userRole) {
            case 'Faculty': return ['Student'];
            case 'HOD': return ['Student', 'Faculty'];
            case 'Asso.Dean': return ['Student', 'Faculty', 'HOD'];
            case 'Dean': return ['Student', 'Faculty', 'HOD', 'Asso.Dean'];
            case 'Officers':
            case 'Admin': return ['All', 'Student', 'Faculty', 'HOD', 'Dean', 'Asso.Dean', 'Officers'];
            default: return ['All'];
        }
    };

    const roleOptions = getTargetRoles();

    // --- EFFECTS ---
    useEffect(() => {
        if (roleOptions.length > 0 && !announceForm.targetRole) {
            setAnnounceForm(prev => ({ ...prev, targetRole: roleOptions[0] }));
        }
    }, [roleOptions]);

    const getRoleFromCategory = (category) => {
        if (!category) return userRole; 
        if (category.includes('Faculty')) return 'Faculty';
        if (category.includes('HOD')) return 'HOD';
        if (category.includes('Asso.Dean')) return 'Asso.Dean';
        if (category.includes('Dean')) return 'Dean'; 
        if (category.includes('University')) return 'Officers'; 
        return userRole; 
    };

    // Fetch General Announcements
    const fetchGeneralAnnouncements = async () => {
        try {
            const isHighLevel = ['HOD', 'Dean', 'Asso.Dean', 'Officers', 'Admin'].includes(userRole);
            const roleParam = currentViewCategory ? getRoleFromCategory(currentViewCategory) : userRole;
            let subRoleParam = userSubRole;
            
            if (isHighLevel && type === 'Announcements') {
                subRoleParam = deptFilter;
            }

            const response = await axios.get('http://localhost:5001/get-announcements', {
                params: { role: roleParam, subRole: subRoleParam }
            });

            if (response.data.announcements) {
                const sorted = response.data.announcements.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
                setGeneralAnnouncements(sorted);
            }
        } catch (error) {
            console.error("Error fetching general announcements", error);
        }
    };

    useEffect(() => {
        if (type === 'Announcements') {
            fetchGeneralAnnouncements();
        }
    }, [deptFilter, currentViewCategory, type]);

    // Fetch PDFs
    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const subRole = sessionStorage.getItem('usersubRole');
                const queryParams = { role: userRole || '', subRole: subRole || '' };

                const response = await axios.get('http://localhost:5001/get-pdfs', { params: queryParams });

                if (response.data.pdfs) {
                    const groupedPdfs = response.data.pdfs.reduce((acc, pdf) => {
                        const { category } = pdf;
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(pdf);
                        return acc;
                    }, {});

                    const ensureCategory = (cat) => { if (!groupedPdfs[cat]) groupedPdfs[cat] = []; };
                    
                    if (userRole === 'Officers') ensureCategory("University related");
                    if (['Dean', 'Officers'].includes(userRole)) ensureCategory("Dean's related");
                    if (['Asso.Dean', 'Dean', 'Officers'].includes(userRole)) ensureCategory("Asso.Dean's related");
                    if (['HOD', 'Dean', 'Officers'].includes(userRole)) ensureCategory("HOD's related");
                    if (['Faculty', 'HOD', 'Dean', 'Officers'].includes(userRole)) ensureCategory('Faculty related');
                    
                    if (userRole === 'HOD' || userRole === 'Faculty' || userRole === 'Student') {
                        ensureCategory('Teaching Material');
                        ensureCategory('Time Table'); 
                    }
                     if (userRole === 'HOD' || userRole === 'Faculty') {
                         ensureCategory('Staff Presentations');
                    }

                    if ((userRole === 'HOD' || userRole === 'Faculty') && !groupedPdfs['Dept.Equipment']) {
                        groupedPdfs['Dept.Equipment'] = [{
                            name: 'No documents uploaded yet',
                            category: 'Dept.Equipment',
                            subcategory: 'Documents',
                            filePath: null
                        }];
                    }

                    let pdfCategories = Object.keys(groupedPdfs).map(category => {
                        const items = groupedPdfs[category];
                        const hasDocuments = items.some(item => item.subcategory === 'Documents');
                        if (!hasDocuments) items.push({ name: 'No documents uploaded yet', category, subcategory: 'Documents', filePath: null });
                        if (!items.some(i => i.subcategory === 'Announcements')) {
                            items.push({ name: 'Placeholder', category, subcategory: 'Announcements', filePath: null });
                        }
                        return { category, items };
                    });

                    setPdfLinks(pdfCategories);
                }
            } catch (error) {
                console.error('Error fetching PDFs:', error);
            }
        };
        fetchPdfs();
    }, [userRole]);

    // Fetch My Announcements
    const fetchMyAnnouncements = async () => {
        try {
            const response = await axios.get('http://localhost:5001/get-announcements', {
                params: { role: userRole, subRole: userSubRole, email: userEmail }
            });

            if (response.data.announcements) {
                const myUploads = response.data.announcements.filter(
                    item => item.uploadedBy.email === userEmail
                );
                setMyAnnouncements(myUploads);
            }
        } catch (error) {
            console.error("Error fetching my announcements", error);
        }
    };

    // Close PDF on Escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                handleBackClick();
            }
        };
        if (selectedPdf) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [selectedPdf]);

    // --- EVENT HANDLERS ---

    const handlePdfClick = (pdfPath, event) => {
        if(event) event.preventDefault();
        const pdfUrl = `http://localhost:5001/${pdfPath.replace(/\\/g, '/')}`;
        setSelectedPdf(pdfUrl);
    };

    const handleBackClick = () => {
        setSelectedPdf(null);
    };

    const handleDashboardClick = () => {
        setShowContentP(true);
        setIsSearchVisible(false);
        setNoResults(false);
        setActiveCategory(null);
        setCurrentViewCategory(null);
        settype(null);
        setShowSendAnnounce(false);
    };

    const handleSendAnnounceClick = () => {
        setShowSendAnnounce(true);
        setShowContentP(false);
        setIsSearchVisible(false);
        setNoResults(false);
        setActiveCategory(null);
        setCurrentViewCategory(null);
        settype(null);
        fetchMyAnnouncements();
    };

    const handleViewAnnouncementsClick = () => {
        settype('Announcements');
        setCurrentViewCategory(null); 
        setIsSearchVisible(true);
        setNoResults(false);
        setShowDocuments(true);
        setShowContentP(false);
        setShowSendAnnounce(false);
        setSelectedCategoryPdfs([]);
    };

    const handleSubCategoryClick = (categoryItems, subCategory, categoryName) => {
        settype(subCategory);
        setCurrentViewCategory(categoryName); 
        
        if(subCategory === 'Announcements') {
             setIsSearchVisible(true);
             setNoResults(false);
             setShowDocuments(true);
             setShowContentP(false);
             setShowSendAnnounce(false);
        } else {
             const filteredItems = categoryItems.filter(item => item.subcategory === subCategory);
             setSelectedCategoryPdfs(filteredItems);
             setIsSearchVisible(true);
             setNoResults(false);
             setShowDocuments(true);
             setShowContentP(false);
             setShowSendAnnounce(false);
        }
    };

    const toggleCategory = (categoryName) => {
        setActiveCategory(activeCategory === categoryName ? null : categoryName);
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'targetRole') {
            setAnnounceForm({ 
                ...announceForm, 
                targetRole: value,
                targetSubRole: 'All' 
            });
        } else {
            setAnnounceForm({ ...announceForm, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        setAnnounceForm({ ...announceForm, file: e.target.files[0] });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', announceForm.title);
        formData.append('description', announceForm.description);
        formData.append('targetRole', announceForm.targetRole);
        formData.append('targetSubRole', announceForm.targetSubRole);
        
        if (announceForm.file) {
            formData.append('file', announceForm.file);
        }

        formData.append('user', JSON.stringify({
            username: sessionStorage.getItem('username'),
            email: userEmail,
            role: userRole,
            subRole: sessionStorage.getItem('usersubRole'),
        }));

        try {
            await axios.post('http://localhost:5001/add-announcement', formData);
            alert('Announcement Sent Successfully!');
            setAnnounceForm({
                title: '',
                description: '',
                targetRole: roleOptions[0], 
                targetSubRole: 'All',
                file: null
            });
            fetchMyAnnouncements();
        } catch (error) {
            console.error('Error sending announcement', error);
            alert('Failed to send announcement.');
        }
    };

    const filteredPdfs = selectedCategoryPdfs.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="content-wrapper">
            {/* Sidebar Feature */}
            <Sidebar 
                userRole={userRole}
                pdfLinks={pdfLinks}
                activeCategory={activeCategory}
                showContentP={showContentP}
                showSendAnnounce={showSendAnnounce}
                type={type}
                onDashboardClick={handleDashboardClick}
                onSendAnnounceClick={handleSendAnnounceClick}
                onViewAnnouncementsClick={handleViewAnnouncementsClick}
                onToggleCategory={toggleCategory}
                onSubCategoryClick={handleSubCategoryClick}
            />

            <div className="main-area">
                {showContentP ? (
                    <div className="Dashboard">
                        <h2>Welcome to Aditya University Intranet</h2>
                        <p>Select a category from the menu to view documents or announcements.</p>
                        <hr />
                        <p className="university-desc">
                            Aditya University is a State Private University...
                        </p>
                    </div>
                ) : showSendAnnounce ? (
                    /* Announcement Form Feature */
                    <AnnouncementForm 
                        formData={announceForm}
                        roleOptions={roleOptions}
                        subRolesMapping={subRolesMapping}
                        myAnnouncements={myAnnouncements}
                        onChange={handleFormChange}
                        onFileChange={handleFileChange}
                        onSubmit={handleFormSubmit}
                    />
                ) : isSearchVisible ? (
                    /* Render either Announcements Feed or Document Grid */
                    type === 'Announcements' ? (
                        <AnnouncementFeed 
                            announcements={generalAnnouncements}
                            deptFilter={deptFilter}
                            setDeptFilter={setDeptFilter}
                            userRole={userRole}
                            subRolesMapping={subRolesMapping}
                            onPdfClick={handlePdfClick}
                        />
                    ) : (
                        <DocumentView 
                            type={type}
                            documents={filteredPdfs}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onPdfClick={handlePdfClick}
                        />
                    )
                ) : null}
            </div>

            {/* PDF Viewer Feature */}
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