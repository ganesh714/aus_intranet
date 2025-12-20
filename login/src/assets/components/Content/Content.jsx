import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Content.css";
import { MdDashboard, MdCampaign } from 'react-icons/md';
import { FaFilePdf, FaFolder, FaBullhorn, FaSearch, FaArrowLeft, FaChevronRight, FaTimes, FaUserCircle, FaCalendarAlt } from 'react-icons/fa';

const Content = () => {
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
                    
                    // Logic updated to hide these from Student
                    if (['HOD', 'Dean', 'Officers'].includes(userRole)) ensureCategory("HOD's related");
                    if (['Faculty', 'HOD', 'Dean', 'Officers'].includes(userRole)) ensureCategory('Faculty related');
                    
                    // Student, Faculty, HOD see these
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

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                handleBackClick();
            }
        };
        if (selectedPdf) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [selectedPdf]);

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

    // --- NEW HANDLER FOR STUDENT ANNOUNCEMENTS ---
    const handleViewAnnouncementsClick = () => {
        settype('Announcements');
        setCurrentViewCategory(null); // Shows announcements targeted to the user's role
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
            <div className="sidebar">
                <h3 className="sidebar-header">Menu</h3>
                <div className="category-list">
                    <div className={`category-item ${showContentP ? "expanded" : ""}`}>
                        <div className="category-header" onClick={handleDashboardClick}>
                            <span className="cat-name">
                                <MdDashboard className="cat-icon"/> Dashboard
                            </span>
                        </div>
                    </div>

                    {/* HIDE SEND ANNOUNCEMENT FOR STUDENTS */}
                    {userRole !== 'Student' && (
                        <div className={`category-item ${showSendAnnounce ? "expanded" : ""}`}>
                            <div className="category-header" onClick={handleSendAnnounceClick}>
                                <span className="cat-name">
                                    <MdCampaign className="cat-icon"/> Send Announcements
                                </span>
                            </div>
                        </div>
                    )}

                    {/* NEW: VIEW ANNOUNCEMENTS FOR STUDENTS */}
                    {userRole === 'Student' && (
                        <div className={`category-item ${type === 'Announcements' ? "expanded" : ""}`}>
                            <div className="category-header" onClick={handleViewAnnouncementsClick}>
                                <span className="cat-name">
                                    <FaBullhorn className="cat-icon"/> Announcements
                                </span>
                            </div>
                        </div>
                    )}

                    {pdfLinks.map((category, index) => (
                        <div key={index} className={`category-item ${activeCategory === category.category ? "expanded" : ""}`}>
                            <div className="category-header" onClick={() => toggleCategory(category.category)}>
                                <span className="cat-name"><FaFolder className="cat-icon"/> {category.category}</span>
                                <FaChevronRight className={`chevron ${activeCategory === category.category ? "rotate" : ""}`}/>
                            </div>
                            
                            <div className="subcategory-list">
                                {[...new Set(category.items.map(item => item.subcategory))]
                                    .filter(subCat => !(
                                        ["Dept.Equipment", "Teaching Material", "Staff Presentations", "Time Table"].includes(category.category) && subCat === "Announcements"
                                    ))
                                    .map((subCat) => (
                                        <button key={subCat} className="subcat-btn" onClick={() => handleSubCategoryClick(category.items, subCat, category.category)}>
                                            {subCat === 'Announcements' ? <FaBullhorn /> : <FaFilePdf />} {subCat}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
                    <div className="announce-container">
                        <h2>Send New Announcement</h2>
                        <form className="announce-form" onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" name="title" value={announceForm.title} onChange={handleFormChange} required placeholder="Enter announcement title"/>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={announceForm.description} onChange={handleFormChange} required rows="4"/>
                            </div>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Target Role</label>
                                    <select name="targetRole" value={announceForm.targetRole} onChange={handleFormChange}>
                                        {roleOptions.map((r, i) => <option key={i} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="form-group half">
                                    <label>Target Department</label>
                                    <select name="targetSubRole" value={announceForm.targetSubRole} onChange={handleFormChange}>
                                        {(subRolesMapping[announceForm.targetRole] || ['All']).map((sr, i) => (
                                            <option key={i} value={sr}>{sr}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Attachment (Optional)</label>
                                <input type="file" onChange={handleFileChange} />
                            </div>
                            <button type="submit" className="send-btn">Send Announcement</button>
                        </form>

                        <div className="my-announcements-section">
                            <h3>Announcements Sent By Me</h3>
                            {myAnnouncements.length === 0 ? <p className="no-data">No history.</p> : (
                                <div className="announcement-list">
                                    {myAnnouncements.map((item, index) => (
                                        <div key={index} className="announcement-card">
                                            <div className="ac-header">
                                                <h4>{item.title}</h4>
                                                <span className="ac-date">{new Date(item.uploadedAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="ac-desc">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : isSearchVisible ? (
                    <div className="results-container">
                        <div className="search-header">
                            <h2>{type}</h2>
                            {type === 'Announcements' && ['HOD', 'Dean', 'Asso.Dean', 'Officers', 'Admin'].includes(userRole) && (
                                <div className="search-input-wrapper" style={{ width: '200px' }}>
                                    <select 
                                        className="modern-search" 
                                        style={{ padding: '10px', paddingLeft: '15px' }}
                                        value={deptFilter}
                                        onChange={(e) => setDeptFilter(e.target.value)}
                                    >
                                        <option value="All">All Departments</option>
                                        {subRolesMapping['Faculty']?.filter(r => r !== 'All').map((dept, i) => (
                                            <option key={i} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {type !== 'Announcements' && (
                                <div className="search-input-wrapper">
                                    <FaSearch className="search-icon"/>
                                    <input
                                        type="text"
                                        placeholder={`Search ${type}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="modern-search"
                                    />
                                </div>
                            )}
                        </div>

                        {type === 'Announcements' ? (
                            <div className="general-announcements-wrapper">
                                {generalAnnouncements.length > 0 && (
                                    <div className="tickers-group">
                                        <div className="ticker-label-static" style={{fontWeight:'bold', marginBottom:'10px', color:'#F97316'}}><FaBullhorn /> Recent Updates:</div>
                                        {generalAnnouncements.slice(0, 5).map((ann, index) => (
                                            <div key={index} className="announcement-ticker-container" style={{ marginBottom: '10px' }}>
                                                <div className="ticker-track-wrapper">
                                                    <div className="ticker-track">
                                                        <span className="ticker-item">
                                                            {ann.title} - <span style={{fontSize:'0.9em', opacity:0.8}}>{new Date(ann.uploadedAt).toLocaleDateString()}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="all-announcements-grid">
                                    {generalAnnouncements.length === 0 ? (
                                        <p className="no-data">No announcements found matching filter.</p>
                                    ) : (
                                        generalAnnouncements.map((ann) => (
                                            <div key={ann._id} className="detail-card">
                                                <div className="dc-left">
                                                    <div className="dc-icon"><FaBullhorn /></div>
                                                </div>
                                                <div className="dc-content">
                                                    <div className="dc-header">
                                                        <h3 className="dc-title">{ann.title}</h3>
                                                        <span className="dc-date">
                                                            <FaCalendarAlt /> {new Date(ann.uploadedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="dc-description">{ann.description}</p>
                                                    <div className="dc-footer">
                                                        <div className="dc-author">
                                                            <FaUserCircle /> {ann.uploadedBy?.username} 
                                                            <span className="dc-role-badge">{ann.uploadedBy?.role}</span>
                                                        </div>
                                                        {ann.filePath && (
                                                            <button 
                                                                className="dc-pdf-btn" 
                                                                onClick={(e) => handlePdfClick(ann.filePath, e)}
                                                            >
                                                                <FaFilePdf /> View PDF
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="items-grid">
                                {filteredPdfs.length > 0 ? (
                                    filteredPdfs.map((item, index) => (
                                        <div key={index} className="doc-card" onClick={(event) => item.filePath && handlePdfClick(item.filePath, event)}>
                                            <div className="doc-icon-box"><FaFilePdf /></div>
                                            <div className="doc-info">
                                                <span className="doc-title">{item.name}</span>
                                                {item.filePath && <span className="click-hint">Click to view</span>}
                                            </div>
                                        </div>
                                    ))
                                ) : <div className="no-results">No results found</div>}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {selectedPdf && (
                <div className="pdf-modal">
                    <div className="pdf-container">
                        <div className="pdf-header-bar">
                            <button className="close-pdf-btn" onClick={handleBackClick}><FaArrowLeft /> Back</button>
                            <button className="close-icon-btn" onClick={handleBackClick}><FaTimes /></button>
                        </div>
                        <object data={selectedPdf} type="application/pdf" className="pdf-object">
                            <p>Your browser doesn't support viewing PDFs.</p>
                        </object>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Content;