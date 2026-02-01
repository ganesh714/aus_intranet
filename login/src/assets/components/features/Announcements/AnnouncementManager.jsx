import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AnnouncementForm from './AnnouncementForm';
import AnnouncementFeed from './AnnouncementFeed';

const AnnouncementManager = ({
    userRole,
    userId,
    userSubRole,
    userBatch, // Passed from parent or read from session in the future (for now we assume parent passes it or we read from session here if needed)
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
        targetBatch: '', // Added targetBatch
        targets: [], // Array of { role, subRole, batch }
        file: null
    });

    // <--- FIXED: Watch for changes (e.g., clicking Sidebar buttons while component is already open)
    useEffect(() => {
        setShowSendAnnounce(initialMode === 'send');
    }, [initialMode]);

    // Configuration
    // [NEW] Dynamic SubRoles Mapping State
    const [subRolesMapping, setSubRolesMapping] = useState({ 'All': ['All'] });

    // [NEW] Fetch SubRoles from Backend
    useEffect(() => {
        const fetchSubRoles = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/all-subroles`);
                if (response.data.success) {
                    const mapping = { 'All': ['All'] }; // Start with default

                    // Group subroles by their parent role
                    response.data.subRoles.forEach(subRole => {
                        if (!mapping[subRole.role]) {
                            mapping[subRole.role] = ['All'];
                        }
                        mapping[subRole.role].push(subRole.name);
                    });

                    // Update state
                    setSubRolesMapping(mapping);
                }
            } catch (error) {
                console.error("Error fetching subroles:", error);
                // Fallback to hardcoded list if fetch fails (optional, or just alert)
            }
        };

        fetchSubRoles();
    }, []);

    const getTargetRoles = () => {
        switch (userRole) {
            case 'Faculty': return ['Student'];
            case 'HOD': return ['Student', 'Faculty'];
            case 'Asso.Dean':
            case 'Associate Dean':
            case 'Assoc Dean': return ['Student', 'Faculty', 'HOD'];
            case 'Dean': return ['Student', 'Faculty', 'HOD', 'Asso.Dean'];
            case 'Officers':
            case 'Admin': return ['All', 'Student', 'Faculty', 'HOD', 'Dean', 'Asso.Dean', 'Officers'];
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
        // Validation for Student role
        if (announceForm.targetRole === 'Student' && !announceForm.targetBatch.trim()) {
            return; // Should be handled by UI disable too, but safe guard here
        }

        const newTarget = {
            role: announceForm.targetRole,
            subRole: announceForm.targetSubRole,
            batch: announceForm.targetRole === 'Student' ? announceForm.targetBatch : null
        };

        // Prevent duplicates
        const exists = announceForm.targets.some(t =>
            t.role === newTarget.role &&
            t.subRole === newTarget.subRole &&
            t.batch === newTarget.batch
        );

        if (!exists) {
            setAnnounceForm(prev => ({
                ...prev,
                targets: [...prev.targets, newTarget],
                targetBatch: '' // Reset batch after adding
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
        if (category.includes('University')) return 'Officers';
        return userRole;
    };

    // Fetch announcements
    const fetchAnnouncements = async () => {
        try {
            const canCreate = ['HOD', 'Dean', 'Asso.Dean'].includes(userRole) || (userRole === 'Officers');
            const roleParam = currentViewCategory ? getRoleFromCategory(currentViewCategory) : userRole;
            let subRoleParam = userSubRole;
            // Read batch directly from session if not passed as prop (or ensure parent passes it)
            const batchParam = sessionStorage.getItem('userBatch');

            if (canCreate && !showSendAnnounce) {
                subRoleParam = deptFilter;
            }

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-announcements`, {
                params: {
                    role: roleParam,
                    subRole: subRoleParam,
                    batch: batchParam, // Pass batch
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
                targetSubRole: 'All',
                targetBatch: '' // Reset batch when role changes
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
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-announcement`, formData);
            alert('Announcement Sent Successfully!');
            setAnnounceForm({
                title: '',
                description: '',
                targetRole: roleOptions[0],
                targetSubRole: 'All',
                targetBatch: '',
                targets: [],
                file: null
            });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error sending announcement', error);
            alert('Failed to send announcement.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/delete-announcement/${id}`);
            alert('Announcement deleted successfully!');
            fetchAnnouncements(); // Refresh list
        } catch (error) {
            console.error("Error deleting announcement", error);
            alert("Failed to delete announcement.");
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
                userRole={userRole} // [NEW] Pass role for conditional UI
                onSubmit={handleFormSubmit}
                onToggleView={toggleView}
                onDelete={handleDelete}
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