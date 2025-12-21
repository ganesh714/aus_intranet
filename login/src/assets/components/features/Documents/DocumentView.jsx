import React from 'react';
import './Documents.css';
import { FaSearch, FaFilePdf } from 'react-icons/fa';

const DocumentView = ({ 
    type, 
    documents, 
    searchQuery, 
    setSearchQuery, 
    onPdfClick 
}) => {
    return (
        <div className="results-container">
            <div className="search-header">
                <h2>{type}</h2>
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
            </div>

            <div className="items-grid">
                {documents.length > 0 ? (
                    documents.map((item, index) => (
                        <div key={index} className="doc-card" onClick={(event) => item.filePath && onPdfClick(item.filePath, event)}>
                            <div className="doc-icon-box"><FaFilePdf /></div>
                            <div className="doc-info">
                                <span className="doc-title">{item.name}</span>
                                {item.filePath && <span className="click-hint">Click to view</span>}
                            </div>
                        </div>
                    ))
                ) : <div className="no-results">No results found</div>}
            </div>
        </div>
    );
};

export default DocumentView;