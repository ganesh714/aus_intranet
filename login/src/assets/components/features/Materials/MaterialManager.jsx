import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaCloudUploadAlt, FaUserTie } from 'react-icons/fa';
import '../Documents/Documents.css';

const MaterialManager = ({ userRole, userSubRole, userId, onPdfClick }) => {
    const [materials, setMaterials] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const [filters, setFilters] = useState({
        year: '',
        section: ''
    });

    const [uploadForm, setUploadForm] = useState({
        title: '',
        subject: '',
        targetYear: '',
        targetSection: '',
        file: null
    });

    const fetchMaterials = async () => {
        try {
            const params = {
                role: userRole,
                subRole: userSubRole,
                year: filters.year,
                section: filters.section
                // Removed 'type' param
            };
            const response = await axios.get('http://localhost:5001/get-materials', { params });
            setMaterials(response.data.materials);
        } catch (error) {
            console.error("Error fetching materials", error);
        }
    };

    useEffect(() => {
        if (userRole !== 'Student' || (filters.year && filters.section)) {
            fetchMaterials();
        } else {
            setMaterials([]);
        }
    }, [userRole, filters, userSubRole]);

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        // Removed 'type' append
        formData.append('title', uploadForm.title);
        formData.append('subject', uploadForm.subject);
        formData.append('targetYear', uploadForm.targetYear);
        formData.append('targetSection', uploadForm.targetSection);
        formData.append('file', uploadForm.file);
        formData.append('user', JSON.stringify({
            username: sessionStorage.getItem('username'),
            id: userId,
            role: userRole,
            subRole: userSubRole
        }));

        try {
            await axios.post('http://localhost:5001/add-material', formData);
            alert('Material Uploaded Successfully!');
            setIsUploading(false);
            setUploadForm({ title: '', subject: '', targetYear: '', targetSection: '', file: null });
            fetchMaterials();
        } catch (error) {
            alert('Error uploading material');
            console.error(error);
        }
    };

    const groupedMaterials = materials.reduce((acc, item) => {
        const facultyName = item.uploadedBy.username || 'Unknown Faculty';
        if (!acc[facultyName]) acc[facultyName] = [];
        acc[facultyName].push(item);
        return acc;
    }, {});

    return (
        <div className="results-container">
            <div className="search-header">
                <h2>{userRole === 'Student' ? 'Class Materials' : 'Student Related / Material'}</h2>

                {userRole !== 'Student' && (
                    <button className="quick-upload-btn" onClick={() => setIsUploading(!isUploading)}>
                        <FaCloudUploadAlt /> {isUploading ? 'View List' : 'Upload Material'}
                    </button>
                )}
            </div>

            {/* STUDENT FILTERS */}
            {userRole === 'Student' && (
                <div className="filter-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Year</label>
                        <input
                            type="number"
                            className="modern-search"
                            style={{ width: '100%', borderRadius: '6px' }}
                            placeholder="Enter Year (e.g. 2)"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Section</label>
                        <input
                            type="number"
                            className="modern-search"
                            style={{ width: '100%', borderRadius: '6px' }}
                            placeholder="Enter Section (e.g. 1)"
                            value={filters.section}
                            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* UPLOAD FORM */}
            {isUploading && (
                <div className="announce-container" style={{ marginBottom: '20px' }}>
                    <form onSubmit={handleUpload} className="announce-form">
                        <h3>Upload New Material</h3>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Title</label>
                                <input type="text" required value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder="e.g. Unit 1 Notes" />
                            </div>
                            <div className="form-group half">
                                <label>Subject (Course)</label>
                                <input type="text" required value={uploadForm.subject} onChange={e => setUploadForm({ ...uploadForm, subject: e.target.value })} placeholder="e.g. Data Structures" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Target Year</label>
                                <input type="number" required value={uploadForm.targetYear} onChange={e => setUploadForm({ ...uploadForm, targetYear: e.target.value })} />
                            </div>
                            <div className="form-group half">
                                <label>Target Section</label>
                                <input type="number" required value={uploadForm.targetSection} onChange={e => setUploadForm({ ...uploadForm, targetSection: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>File</label>
                            <input type="file" required onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} />
                        </div>
                        <button type="submit" className="send-btn">Upload</button>
                    </form>
                </div>
            )}

            {/* MATERIALS LIST */}
            <div className="materials-list-wrapper">
                {Object.keys(groupedMaterials).length > 0 ? (
                    Object.entries(groupedMaterials).map(([facultyName, items]) => (
                        <div key={facultyName} className="faculty-group" style={{ marginBottom: '30px' }}>
                            <h3 style={{
                                fontSize: '18px',
                                color: '#1E3A8A',
                                borderBottom: '2px solid #F97316',
                                paddingBottom: '8px',
                                marginBottom: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <FaUserTie /> {facultyName}
                            </h3>

                            <div className="items-grid">
                                {items.map((item) => (
                                    <div key={item._id} className="doc-card" onClick={(e) => onPdfClick(item.fileId?.filePath, e)}>
                                        <div className="doc-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                            <FaBook />
                                        </div>
                                        <div className="doc-info">
                                            <span className="doc-title">{item.title}</span>
                                            <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>{item.subject}</span>
                                            <span style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                                                Year: {item.targetYear} | Sec: {item.targetSection}
                                            </span>
                                            <span className="click-hint">Click to view</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        {userRole === 'Student' && !filters.year ? "Please enter Year and Section above to find materials." : "No materials found."}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialManager;