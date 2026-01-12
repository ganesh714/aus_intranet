// src/features/PersonalData/PersonalData.jsx
import React from 'react';
import DriveExplorer from './DriveExplorer';

const PersonalData = ({ userId, userRole, onFileClick }) => {
    // We delegate all logic to DriveExplorer.
    // userInfo needs to be an object with an 'id' and 'username' (if used). 
    // In DriveExplorer we used `userInfo.id`.

    // We might need username if we want to be consistent with other usage of user object
    const userInfo = {
        id: userId,
        role: userRole,
        username: sessionStorage.getItem('username') // Best effort from session
    };

    return (
        <DriveExplorer
            userInfo={userInfo}
            onPdfClick={onFileClick} // Pass as onPdfClick to DriveExplorer (until we update DriveExplorer)
        />
    );
};

export default PersonalData;