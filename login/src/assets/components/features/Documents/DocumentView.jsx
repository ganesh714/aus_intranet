import React from 'react';
import './Documents.css';
import { FaSearch, FaFilePdf, FaCloudUploadAlt } from 'react-icons/fa'; // Added Upload Icon

const DocumentView = ({
    type,
    documents,
    searchQuery,
    setSearchQuery,
    onPdfClick,
    onUploadClick // <--- NEW PROP: Function to handle upload click
}) => {
    return (
        <div className="results-container">
            <div className="search-header">
                <div className="header-left">
                    <h2>{type}</h2>
                    {/* Render Upload Button only if onUploadClick is provided */}
                    {onUploadClick && (
                        <button className="std-btn" onClick={onUploadClick}>
                            <FaCloudUploadAlt /> Upload New
                        </button>
                    )}
                </div>

                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder={`Search ${type}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="modern-search"
                    />
                </div>
            </div>

            <div className="items-grid">
                {documents.length > 0 ? (
                    documents.map((item, index) => (
                        <div key={index} className="doc-card" onClick={(event) => (item.filePath || item.fileId?.filePath) && onPdfClick(item.filePath || item.fileId?.filePath, event)}>
                            <div className="doc-icon-box"><FaFilePdf /></div>
                            <div className="doc-info">
                                {/* Use optional chaining for safety */}
                                <span className="doc-title">{item.name || item.fileName}</span>
                                <span className="click-hint">Click to view</span>
                            </div>
                        </div>
                    ))
                ) : <div className="no-results">No results found</div>}
            </div>
        </div>
    );
};

export default DocumentView;