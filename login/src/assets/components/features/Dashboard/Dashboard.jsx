// src/features/Dashboard/Dashboard.jsx
import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="Dashboard">
            <h2>Welcome to Aditya University Intranet</h2>
            <p>Select a category from the menu to view documents or announcements.</p>
            <hr />
            <div className="university-desc">
                <h3>About Aditya University</h3>
                <p>Aditya University is a State Private University (SPU) located in Surampalem, Andhra Pradesh, India.</p>
                <p>The university offers various undergraduate, postgraduate, and doctoral programs in engineering, 
                   management, pharmacy, and other disciplines.</p>
                <p>Our mission is to provide quality education and foster innovation and research among students.</p>
            </div>
        </div>
    );
};

export default Dashboard;