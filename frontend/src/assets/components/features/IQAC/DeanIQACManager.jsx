import React from 'react';
import './IQAC.css'; // Reuses existing IQAC styles

const DeanIQACManager = () => {
    return (
        <div className="std-page-container iqac-container">
            <div className="std-page-header">
                <h2>Dean IQAC Dashboard</h2>
            </div>
            
            {/* Empty Main Area */}
            <div className="iqac-module-content" style={{ 
                marginTop: '30px', 
                padding: '40px', 
                textAlign: 'center', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px dashed #cbd5e1'
            }}>
                <h4 style={{ color: '#475569', marginBottom: '10px' }}>Welcome to the Dean IQAC Module</h4>
                <p style={{ color: '#64748b' }}>
                    This area is currently under construction. Future features and analytics will be displayed here.
                </p>
            </div>
        </div>
    );
};

export default DeanIQACManager;
