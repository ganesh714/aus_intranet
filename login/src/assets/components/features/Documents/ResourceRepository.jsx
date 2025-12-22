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
                    
                    if (userRole === 'Leadership') ensureCategory("University related");
                    if (['Dean', 'Leadership'].includes(userRole)) ensureCategory("Dean's related");
                    if (['Asso.Dean', 'Dean', 'Leadership'].includes(userRole)) ensureCategory("Asso.Dean's related");
                    if (['HOD', 'Dean', 'Leadership'].includes(userRole)) ensureCategory("HOD's related");
                    if (['Faculty', 'HOD', 'Dean', 'Leadership'].includes(userRole)) ensureCategory('Faculty related');
                    
                    if (userRole === 'HOD' || userRole === 'Faculty' || userRole === 'Student') {
                        ensureCategory('Teaching Material');
                        ensureCategory('Time Table');
                    }
                    
                    if (userRole === 'HOD' || userRole === 'Faculty') {
                        ensureCategory('Staff Presentations');
                    }

                    if ((userRole === 'HOD' || userRole === 'Faculty') && !groupedPdfs['Dept.Equipment']) {
                        groupedPdfs['Dept.Equipment'] = [{
                            name: 'No documents uploaded yet',
                            category: 'Dept.Equipment',
                            subcategory: 'Documents',
                            filePath: null
                        }];
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
                        if (!items.some(i => i.subcategory === 'Announcements')) {
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