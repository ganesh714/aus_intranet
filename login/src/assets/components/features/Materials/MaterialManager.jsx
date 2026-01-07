import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaCloudUploadAlt, FaUserTie, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import '../Documents/Documents.css';

const MaterialManager = ({ userRole, userSubRole, userId, onPdfClick }) => {
    const [materials, setMaterials] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    // START: Refactored for Multi-Dept & Batch
    // department state is now an array for new uploads, but we can default it to current user's dept
    const [selectedDepartments, setSelectedDepartments] = useState([userSubRole] || []);

    // START: Restored View Logic
    const [viewDepartment, setViewDepartment] = useState(userSubRole || '');
    // END: Restored View Logic

    const commonDepartments = ["IT", "CSE", "AIML", "CE", "MECH", "EEE", "ECE", "Ag.E", "MPE", "FED"];

    // Helper to calculate range if only end year is provided (e.g., "2027" -> "2023-2027")
    const getDefaultBatch = () => {
        if (userRole !== 'Student') return '';
        const rawBatch = sessionStorage.getItem('userBatch') || '';
        // If it looks like a single 4-digit year, assume it's the graduating year and format as range
        if (/^\d{4}$/.test(rawBatch)) {
            const endYear = parseInt(rawBatch);
            const startYear = endYear - 4;
            return `${startYear}-${endYear}`;
        }
        return rawBatch;
    };

    // Filter Logic
    const [filters, setFilters] = useState({
        batch: getDefaultBatch(),
    });

    const [uploadForm, setUploadForm] = useState({
        title: '',
        subject: '',
        targetBatch: '',
        file: null
    });

    const fetchMaterials = async () => {
        try {
            const params = {
                role: userRole,
                subRole: viewDepartment || userSubRole, // Restored: Use viewDepartment for filtering
                batch: filters.batch
                // Note: Departments filtering is slightly different now.
                // Student sees their own dept materials + shared ones.
                // Faculty sees what they uploaded + shared with their dept.
            };
            const response = await axios.get('http://localhost:5001/get-materials', { params });
            setMaterials(response.data.materials);
        } catch (error) {
            console.error("Error fetching materials", error);
        }
    };

    useEffect(() => {
        // If Student, only fetch if Batch is provided
        if (userRole !== 'Student' || filters.batch) {
            fetchMaterials();
        } else {
            setMaterials([]);
        }
    }, [userRole, filters, userSubRole, viewDepartment]);

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', uploadForm.title);
        formData.append('subject', uploadForm.subject);
        formData.append('targetBatch', uploadForm.targetBatch);
        formData.append('file', uploadForm.file);

        // Multi-Department Support
        formData.append('targetDepartments', JSON.stringify(selectedDepartments));

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
            setUploadForm({ title: '', subject: '', targetBatch: '', file: null });
            // Reset to default dept
            setSelectedDepartments([userSubRole]);
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


    // Reusable Multi-Select Component
    const handleDeptChange = (dept) => {
        if (selectedDepartments.includes(dept)) {
            setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
        } else {
            setSelectedDepartments([...selectedDepartments, dept]);
        }
    };

    const DepartmentMultiSelect = () => (
        <div className="multi-select-container" style={{
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '10px',
            maxHeight: '150px',
            overflowY: 'auto',
            background: 'white'
        }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Select Departments to Share With:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                {commonDepartments.map(dept => (
                    <label key={dept} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={selectedDepartments.includes(dept)}
                            onChange={() => handleDeptChange(dept)}
                            style={{ marginRight: '5px' }}
                        />
                        {dept}
                    </label>
                ))}
            </div>
        </div>
    );

    // Restored Dropdown for Header
    const DepartmentFilterSelect = () => (
        <select
            value={viewDepartment}
            onChange={(e) => setViewDepartment(e.target.value)}
            className="modern-search"
            style={{
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginRight: '10px',
                width: 'auto'
            }}
        >
            {commonDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
            ))}
        </select>
    );

    return (
        <div className="results-container">
            <div className="search-header">
                <h2>{userRole === 'Student' ? 'Class Materials' : 'Student Related / Material'}</h2>

                {userRole !== 'Student' && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Restored Header Dropdown */}
                        {!isUploading && <DepartmentFilterSelect />}

                        <button className="quick-upload-btn" onClick={() => {
                            // Sync Upload Depts with View Dept when opening?
                            if (!isUploading && viewDepartment) {
                                setSelectedDepartments([viewDepartment]);
                            }
                            setIsUploading(!isUploading)
                        }}>
                            <FaCloudUploadAlt /> {isUploading ? 'View List' : 'Upload Material'}
                        </button>
                    </div>
                )}
            </div>

            {/* STUDENT FILTERS */}
            {userRole === 'Student' && (
                <div className="filter-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Batch (Year)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                className="modern-search"
                                style={{ width: '100%', borderRadius: '6px', paddingRight: '30px' }}
                                placeholder="Enter Batch (e.g. 2022-2026)"
                                value={filters.batch}
                                onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                            />
                            <div style={{
                                position: 'absolute',
                                right: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                            }}>
                                <FaChevronUp
                                    style={{ cursor: 'pointer', fontSize: '10px', color: '#666' }}
                                    onClick={() => {
                                        const rangeRegex = /^(\d{4})-(\d{4})$/;
                                        const singleRegex = /^(\d{4})$/;
                                        if (rangeRegex.test(filters.batch)) {
                                            const [_, start, end] = filters.batch.match(rangeRegex);
                                            setFilters({ ...filters, batch: `${parseInt(start) + 1}-${parseInt(end) + 1}` });
                                        } else if (singleRegex.test(filters.batch)) {
                                            setFilters({ ...filters, batch: `${parseInt(filters.batch) + 1}` });
                                        }
                                    }}
                                />
                                <FaChevronDown
                                    style={{ cursor: 'pointer', fontSize: '10px', color: '#666' }}
                                    onClick={() => {
                                        const rangeRegex = /^(\d{4})-(\d{4})$/;
                                        const singleRegex = /^(\d{4})$/;
                                        if (rangeRegex.test(filters.batch)) {
                                            const [_, start, end] = filters.batch.match(rangeRegex);
                                            setFilters({ ...filters, batch: `${parseInt(start) - 1}-${parseInt(end) - 1}` });
                                        } else if (singleRegex.test(filters.batch)) {
                                            setFilters({ ...filters, batch: `${parseInt(filters.batch) - 1}` });
                                        }
                                    }}
                                />
                            </div>
                        </div>
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
                            <div className="form-group full">
                                <label>Target Batch (Year/Session)</label>
                                <input type="text" required value={uploadForm.targetBatch} onChange={e => setUploadForm({ ...uploadForm, targetBatch: e.target.value })} placeholder="e.g. 2022-2026" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>File</label>
                            <input type="file" required onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} />
                        </div>

                        {/* Multi-Dept Selector */}
                        <div className="form-group">
                            <DepartmentMultiSelect />
                        </div>

                        <button type="submit" className="send-btn">Upload</button>
                    </form>
                </div>
            )}

            {/* MATERIALS LIST */}
            <div className="materials-list-wrapper">
                {Object.keys(groupedMaterials).length > 0 ? (
                    Object.entries(groupedMaterials).map(([facultyName, items]) => {
                        // Extract department from the first item since all items in this group are from the same uploader
                        const uploaderDept = items[0]?.uploadedBy?.subRole;

                        return (
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
                                    <FaUserTie /> {facultyName} {uploaderDept ? <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>({uploaderDept})</span> : ''}
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
                                                    Batch: {item.targetBatch || item.targetYear} {/* Fallback for old items */}
                                                </span>
                                                <span style={{ fontSize: '10px', color: '#666', marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {item.targetDepartments?.map(d => (
                                                        <span key={d} style={{ background: '#eee', padding: '2px 5px', borderRadius: '4px' }}>{d}</span>
                                                    ))}
                                                    {/* Fallback for legacy explicit department field before array */}
                                                    {item.department && typeof item.department === 'string' && (
                                                        <span style={{ background: '#eee', padding: '2px 5px', borderRadius: '4px' }}>{item.department}</span>
                                                    )}
                                                </span>
                                                <span className="click-hint">Click to view</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-results">
                        {userRole === 'Student' && !filters.batch ? "Enter Batch to filter." : "No materials found."}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialManager;