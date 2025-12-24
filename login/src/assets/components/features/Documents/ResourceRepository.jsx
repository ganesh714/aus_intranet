// src/features/Documents/ResourceRepository.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResourceRepository = ({ userRole, setPdfLinks }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const subRole = sessionStorage.getItem('usersubRole');
                const queryParams = {
                    role: userRole || '',
                    subRole: subRole || ''
                };

                const response = await axios.get('http://localhost:5001/get-pdfs', {
                    params: queryParams
                });

                if (response.data.pdfs) {
                    const groupedPdfs = response.data.pdfs.reduce((acc, pdf) => {
                        const { category } = pdf;
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(pdf);
                        return acc;
                    }, {});

                    // Ensure required categories exist based on user role
                    const ensureCategory = (cat) => {
                        if (!groupedPdfs[cat]) groupedPdfs[cat] = [];
                    };

                    if (userRole === 'Officers') ensureCategory("University related");
                    if (['Dean', 'Officers'].includes(userRole)) ensureCategory("Dean's related");
                    if (['Asso.Dean', 'Dean', 'Officers'].includes(userRole)) ensureCategory("Asso.Dean's related");
                    if (['HOD', 'Dean', 'Officers'].includes(userRole)) ensureCategory("HOD's related");
                    if (['Faculty', 'HOD', 'Dean', 'Officers'].includes(userRole)) ensureCategory('Faculty related');

                    // if (userRole === 'HOD' || userRole === 'Faculty' || userRole === 'Student') {
                    //     ensureCategory('Teaching Material');
                    //     ensureCategory('Time Table');
                    // }



                    if ((userRole === 'HOD' || userRole === 'Faculty') && !groupedPdfs['Dept.Equipment']) {
                        groupedPdfs['Dept.Equipment'] = [{
                            name: 'No documents uploaded yet',
                            category: 'Dept.Equipment',
                            subcategory: 'Documents',
                            filePath: null
                        }];
                    }

                    // --- LOGIC FOR "STUDENT RELATED" (Non-Students) ---
                    if (userRole !== 'Student') {
                        // Initialize if missing
                        if (!groupedPdfs['Student Related']) {
                            groupedPdfs['Student Related'] = [];
                        }

                        // Determine Permissions
                        const isHighLevel = ['Dean', 'Asso.Dean', 'Officers', 'Admin'].includes(userRole);
                        const isFacultyLevel = ['HOD', 'Faculty'].includes(userRole);

                        // 1. Announcements (Everyone gets this if the sidebar supports it, or specific per role)
                        const hasAnnouncements = groupedPdfs['Student Related'].some(i => i.subcategory === 'Announcements');
                        if (!hasAnnouncements) {
                            groupedPdfs['Student Related'].push({ category: 'Student Related', subcategory: 'Announcements' });
                        }

                        // 2. Material & Time Table (Only HOD & Faculty)
                        if (isFacultyLevel) {
                            const hasMaterial = groupedPdfs['Student Related'].some(i => i.subcategory === 'Material');
                            if (!hasMaterial) {
                                groupedPdfs['Student Related'].push({ category: 'Student Related', subcategory: 'Material' });
                            }
                            const hasTimeTable = groupedPdfs['Student Related'].some(i => i.subcategory === 'Time Table');
                            if (!hasTimeTable) {
                                groupedPdfs['Student Related'].push({ category: 'Student Related', subcategory: 'Time Table' });
                            }
                        }
                    }

                    // --- LOGIC FOR STUDENTS ---
                    if (userRole === 'Student') {
                        // Ensure main categories exist
                        if (!groupedPdfs['Teaching Material']) {
                            groupedPdfs['Teaching Material'] = [{ category: 'Teaching Material', subcategory: 'hidden' }];
                        }
                        if (!groupedPdfs['Time Table']) {
                            groupedPdfs['Time Table'] = [{ category: 'Time Table', subcategory: 'hidden' }];
                        }
                    }


                    // Transform to sidebar format
                    let pdfCategories = Object.keys(groupedPdfs).map(category => {
                        const items = groupedPdfs[category];
                        const hasDocuments = items.some(item => item.subcategory === 'Documents');
                        if (!hasDocuments) items.push({
                            name: 'No documents uploaded yet',
                            category,
                            subcategory: 'Documents',
                            filePath: null
                        });

                        // UPDATED: Do not add "Announcements" placeholder for "University related"
                        if (!items.some(i => i.subcategory === 'Announcements') && category !== "University related") {
                            items.push({
                                name: 'Placeholder',
                                category,
                                subcategory: 'Announcements',
                                filePath: null
                            });
                        }
                        return { category, items };
                    });

                    setPdfLinks(pdfCategories);
                }
            } catch (error) {
                console.error('Error fetching PDFs:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPdfs();
    }, [userRole, setPdfLinks]);

    return null; // This component only handles side effects
};

export default ResourceRepository;