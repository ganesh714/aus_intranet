import React from 'react';
import './Documents.css';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

const PdfViewer = ({ fileUrl, onClose }) => {
    // Close on Escape key
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Cleanup listener
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="std-modal-overlay">
            <div className="std-modal" style={{ width: '90%', height: '90vh', maxWidth: '1200px' }}>
                <div className="std-modal-header">
                    <h3 className="std-modal-title">PDF View</h3>
                    <button className="std-close-btn" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="std-modal-body" style={{ padding: 0 }}>
                    <object data={fileUrl} type="application/pdf" className="pdf-object" style={{ width: '100%', height: '100%' }}>
                        <p>Your browser doesn't support viewing PDFs.</p>
                    </object>
                </div>
            </div>
        </div>
    );
};

export default PdfViewer;