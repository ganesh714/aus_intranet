// src/features/PersonalData/PersonalData.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DocumentView from '../Documents/DocumentView';

const PersonalData = ({ userEmail, userRole, onPdfClick }) => {
    const [personalFiles, setPersonalFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);

    // Fetch personal files on mount
    useEffect(() => {
        fetchPersonalFiles();
    }, [userEmail]);

    const fetchPersonalFiles = async () => {
        try {
            const response = await axios.get('http://localhost:5001/get-personal-files', {
                params: { email: userEmail }
            });
            
            const mapped = response.data.files.map(f => ({
                ...f,
                name: f.fileName,
                filePath: f.filePath
            }));
            
            setPersonalFiles(mapped);
        } catch (error) {
            console.error("Error fetching personal data", error);
        }
    };

    const handleSimpleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return alert("Please select a file first");

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('user', JSON.stringify({
            username: sessionStorage.getItem('username'),
            email: userEmail,
            role: userRole
        }));

        try {
            await axios.post('http://localhost:5001/upload-personal-file', formData);
            alert("File uploaded successfully!");
            setIsUploadModalOpen(false);
            setUploadFile(null);
            fetchPersonalFiles();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file");
        }
    };

    // Filter files based on search query
    const filteredFiles = personalFiles.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <DocumentView 
                type="Personal Data"
                documents={filteredFiles}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onPdfClick={onPdfClick}
                onUploadClick={() => setIsUploadModalOpen(true)}
            />

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="upload-modal-overlay">
                    <div className="upload-modal">
                        <h3>Upload to My Data</h3>
                        <form onSubmit={handleSimpleUpload}>
                            <input 
                                type="file" 
                                className="modal-file-input"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                required
                            />
                            <div className="modal-actions">
                                <button type="button" className="modal-btn close-btn" onClick={() => setIsUploadModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-btn submit-btn">
                                    Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PersonalData;