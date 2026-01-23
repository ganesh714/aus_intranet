// src/features/Documents/CategoryViewer.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DocumentView from './DocumentView';

const CategoryViewer = ({
    userRole,
    userSubRole,
    categoryName,
    subCategoryName,
    onPdfClick
}) => {
    const [pdfs, setPdfs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch PDFs for the category
    useEffect(() => {
        const fetchCategoryPdfs = async () => {
            try {
                const queryParams = {
                    role: userRole || '',
                    subRole: userSubRole || ''
                };

                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-pdfs`, {
                    params: queryParams
                });

                if (response.data.pdfs) {
                    // Filter by category and subcategory
                    const filtered = response.data.pdfs.filter(pdf =>
                        (!categoryName || pdf.category === categoryName) &&
                        (!subCategoryName || pdf.subcategory === subCategoryName)
                    );

                    setPdfs(filtered);
                }
            } catch (error) {
                console.error('Error fetching category PDFs:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryPdfs();
    }, [userRole, userSubRole, categoryName, subCategoryName]);

    // Filter PDFs based on search query
    const filteredPdfs = pdfs.filter(pdf =>
        pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <DocumentView
            type={subCategoryName || categoryName || "Documents"}
            documents={filteredPdfs}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onPdfClick={onPdfClick}
        />
    );
};

export default CategoryViewer;