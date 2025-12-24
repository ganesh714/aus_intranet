import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AnnouncementForm from './AnnouncementForm';
import AnnouncementFeed from './AnnouncementFeed';

const AnnouncementManager = ({
    userRole,
    userId,
    userSubRole,
    currentViewCategory,
    deptFilter,
    setDeptFilter,
    onPdfClick,
    initialMode = 'view' // <--- FIXED: Added prop to receive "send" or "view"
}) => {
    const [announcements, setAnnouncements] = useState([]);
    const [myAnnouncements, setMyAnnouncements] = useState([]);

    // <--- FIXED: Initialize state based on the prop
    const [showSendAnnounce, setShowSendAnnounce] = useState(initialMode === 'send');

    const [announceForm, setAnnounceForm] = useState({
        title: '',
        description: '',
        targetRole: '',
        targetSubRole: 'All',
        targets: [], // Array of { role, subRole }
        file: null
    });

    // <--- FIXED: Watch for changes (e.g., clicking Sidebar buttons while component is already open)
    useEffect(() => {
        setShowSendAnnounce(initialMode === 'send');
    }, [initialMode]);

    // Configuration
    const subRolesMapping = {
        'Student': ['All', 'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE', 'ECE', 'Ag.E', 'MPE', 'FED'],
        'Faculty': ['All', 'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE', 'ECE', 'Ag.E', 'MPE', 'FED'],
        'HOD': ['All', 'IT', 'CSE', 'AIML', 'CE', 'MECH', 'EEE', 'ECE', 'Ag.E', 'MPE', 'FED'],
        'Dean': ['All', 'IQAC', 'R&C', 'ADMIN', 'CD', 'SA', 'IR', 'AD', 'SOE', 'COE', 'SOP'],
        'Asso.Dean': ['All', 'SOE', 'IQAC', 'AD', 'FED'],
        'Leadership': ['All', 'DyPC', 'VC', 'ProVC', 'Registrar'],
        'Admin': ['All'],
        'All': ['All']
    };

    const getTargetRoles = () => {
        switch (userRole) {
            case 'Faculty': return ['Student'];
            case 'HOD': return ['Student', 'Faculty'];
            case 'Asso.Dean': return ['Student', 'Faculty', 'HOD'];
            case 'Dean': return ['Student', 'Faculty', 'HOD', 'Asso.Dean'];
            case 'Leadership':
            case 'Admin': return ['All', 'Student', 'Faculty', 'HOD', 'Dean', 'Asso.Dean', 'Leadership'];
            default: return ['All'];
        }
    };

    const roleOptions = getTargetRoles();

    // Initialize form with default target role
    useEffect(() => {
        if (roleOptions.length > 0 && !announceForm.targetRole) {
            setAnnounceForm(prev => ({ ...prev, targetRole: roleOptions[0] }));
        }
    }, [roleOptions]);

    const handleAddTarget = () => {
        const newTarget = {
            role: announceForm.targetRole,
            subRole: announceForm.targetSubRole
        };

        // Prevent duplicates
        const exists = announceForm.targets.some(t =>
            t.role === newTarget.role && t.subRole === newTarget.subRole
        );

        if (!exists) {
            setAnnounceForm(prev => ({
                ...prev,
                targets: [...prev.targets, newTarget]
            }));
        }
    };

    const handleRemoveTarget = (index) => {
        setAnnounceForm(prev => ({
            ...prev,
            targets: prev.targets.filter((_, i) => i !== index)
        }));
    };

    const getRoleFromCategory = (category) => {
        if (!category) return userRole;
        if (category.includes('Student')) return 'Student';
        if (category.includes('Faculty')) return 'Faculty';
        if (category.includes('HOD')) return 'HOD';
        if (category.includes('Asso.Dean')) return 'Asso.Dean';
        if (category.includes('Dean')) return 'Dean';
        if (category.includes('University')) return 'Leadership';
        return userRole;
    };

    // Fetch announcements
    const fetchAnnouncements = async () => {
        try {
            const isHighLevel = ['HOD', 'Dean', 'Asso.Dean', 'Leadership', 'Admin'].includes(userRole);
            const roleParam = currentViewCategory ? getRoleFromCategory(currentViewCategory) : userRole;
            let subRoleParam = userSubRole;

            if (isHighLevel && !showSendAnnounce) {
                subRoleParam = deptFilter;
            }

            const response = await axios.get('http://localhost:5001/get-announcements', {
                params: {
                    role: roleParam,
                    subRole: subRoleParam,
                    id: showSendAnnounce ? userId : null
                }
            });

            if (response.data.announcements) {
                const sorted = response.data.announcements.sort((a, b) =>
                    new Date(b.uploadedAt) - new Date(a.uploadedAt)
                );

                if (showSendAnnounce) {
                    setMyAnnouncements(sorted.filter(item => item.uploadedBy?.id === userId));
                } else {
                    setAnnouncements(sorted);
                }
            }
        } catch (error) {
            console.error("Error fetching announcements", error);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, [deptFilter, currentViewCategory, showSendAnnounce]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'targetRole') {
            setAnnounceForm({
                ...announceForm,
                targetRole: value,
                targetSubRole: 'All'
            });
        } else {
            setAnnounceForm({ ...announceForm, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        setAnnounceForm({ ...announceForm, file: e.target.files[0] });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Validation: Ensure at least one target is added
        if (announceForm.targets.length === 0) {
            alert('Please add at least one target audience.');
            return;
        }

        const formData = new FormData();
        formData.append('title', announceForm.title);
        formData.append('description', announceForm.description);

        // Pass the targets array as a JSON string
        formData.append('targets', JSON.stringify(announceForm.targets));

        if (announceForm.file) {
            formData.append('file', announceForm.file);
        }

        formData.append('user', JSON.stringify({
            username: sessionStorage.getItem('username'),
            id: userId,
            role: userRole,
            subRole: userSubRole,
        }));

        try {
            await axios.post('http://localhost:5001/add-announcement', formData);
            alert('Announcement Sent Successfully!');
            setAnnounceForm({
                title: '',
                description: '',
                targetRole: roleOptions[0],
                targetSubRole: 'All',
                targets: [],
                file: null
            });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error sending announcement', error);
            alert('Failed to send announcement.');
        }
    };

    const toggleView = () => {
        setShowSendAnnounce(!showSendAnnounce);
    };

    if (showSendAnnounce) {
        return (
            <AnnouncementForm

                roleOptions={roleOptions}
                subRolesMapping={subRolesMapping}
                myAnnouncements={myAnnouncements}
                onChange={handleFormChange}
                onFileChange={handleFileChange}
                // Pass the new props for target management
                formData={{
                    ...announceForm,
                    onAddTarget: handleAddTarget,
                    onRemoveTarget: handleRemoveTarget
                }}
                onSubmit={handleFormSubmit}
                onToggleView={toggleView}
            />
        );
    }

    return (
        <AnnouncementFeed
            announcements={announcements}
            deptFilter={deptFilter}
            setDeptFilter={setDeptFilter}
            userRole={userRole}
            subRolesMapping={subRolesMapping}
            onPdfClick={onPdfClick}
            onSendAnnouncementClick={toggleView}
        />
    );
};

export default AnnouncementManager;