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
        <div className="pdf-modal">
            <div className="pdf-container">
                <div className="pdf-header-bar">
                    <button className="close-pdf-btn" onClick={onClose}><FaArrowLeft /> Back</button>
                    <button className="close-icon-btn" onClick={onClose}><FaTimes /></button>
                </div>
                <object data={fileUrl} type="application/pdf" className="pdf-object">
                    <p>Your browser doesn't support viewing PDFs.</p>
                </object>
            </div>
        </div>
    );
};

export default PdfViewer;