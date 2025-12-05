import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Content.css";
import 'font-awesome/css/font-awesome.min.css';

const Content = () => {
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [pdfLinks, setPdfLinks] = useState([]);
    const [selectedCategoryPdfs, setSelectedCategoryPdfs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [showDocuments, setShowDocuments] = useState(false);
    const [showContentP, setShowContentP] = useState(true);
    const [showAnnouncements, setShowAnnouncements] = useState(false);
    const [type, settype] = useState();





    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const role = sessionStorage.getItem('userRole');
                const subRole = sessionStorage.getItem('usersubRole');

                const queryParams = { role: role || '', subRole: subRole || '' };

                const departmentCategory = `Department ${subRole} related`;

                const response = await axios.get('http://localhost:5001/get-pdfs', {
                    params: queryParams
                });


                if (response.data.pdfs) {
                    const groupedPdfs = response.data.pdfs.reduce((acc, pdf) => {
                        const { category } = pdf;
                        if (!acc[category]) {
                            acc[category] = [];
                        }
                        acc[category].push(pdf);
                        return acc;
                    }, {});

                    if (role === 'Officers' && !groupedPdfs["University related"]) {
                        groupedPdfs["University related"] = [];
                    }
                    if ((role === 'Dean' || role === 'Officers') && !groupedPdfs["Dean's related"]) {
                        groupedPdfs["Dean's related"] = [];
                    }
                    if ((role === 'Asso.Dean' ||role === 'Dean' || role === 'Officers') && !groupedPdfs["Asso.Dean's related"]) {
                        groupedPdfs["Asso.Dean's related"] = [];
                    }
                    if ((role === 'HOD' || role === 'Dean' || role === 'Officers') && !groupedPdfs["HOD's related"]) {
                        groupedPdfs["HOD's related"] = [];
                    }
                    if ((role === 'Faculty' || role === 'HOD' || role === 'Dean' || role === 'Officers')) {
                        if (!groupedPdfs['Faculty related']) {
                            groupedPdfs['Faculty related'] = [];
                        }
                        // if (!groupedPdfs['Dept.Equipment']) {
                        //     groupedPdfs['Dept.Equipment'] = [];
                        // }
                    }

                    if (role === 'HOD' || role === 'Faculty') {
                        // if (!groupedPdfs[departmentCategory]) {
                        //     groupedPdfs[departmentCategory] = [];
                        // }
                        if (!groupedPdfs['Teaching Material']) {
                            groupedPdfs['Teaching Material'] = [];
                        } if (!groupedPdfs['Staff Presentations']) {
                            groupedPdfs['Staff Presentations'] = [];
                        }
                    }

                    if ((role === 'HOD' || role === 'Faculty') && !groupedPdfs['Dept.Equipment']) {
                        groupedPdfs['Dept.Equipment'] = [{
                            name: 'No documents uploaded yet',
                            category: 'Dept.Equipment',
                            subcategory: 'Documents',
                            filePath: null
                        }];
                    }
                    


                    let pdfCategories = Object.keys(groupedPdfs).map(category => {
                        const items = groupedPdfs[category];

                        // Inject default subcategories if missing
                        const hasDocuments = items.some(item => item.subcategory === 'Documents');
                        const hasAnnouncements = items.some(item => item.subcategory === 'Announcements');

                        if (!hasDocuments) {
                            items.push({
                                name: 'No documents uploaded yet',
                                category,
                                subcategory: 'Documents',
                                filePath: null
                            });
                        }

                        if (!hasAnnouncements) {
                            items.push({
                                name: 'No announcements uploaded yet.',
                                category,
                                subcategory: 'Announcements',
                                filePath: null
                            });
                        }

                        return { category, items };
                    });


                    if (role === 'Officers') {
                        const sortedCategories = [
                            { category: 'Faculty related', items: groupedPdfs['Faculty related'] || [] },
                            { category: "HOD's related", items: groupedPdfs["HOD's related"] || [] },
                            { category: "Asso.Dean's related", items: groupedPdfs["Asso.Dean's related"] || [] },
                            { category: "Dean's related", items: groupedPdfs["Dean's related"] || [] },
                            { category: 'University related', items: groupedPdfs['University related'] || [] },
                            ...pdfCategories.filter(pdf => !['Faculty related', "HOD's related", "Asso.Dean's related", "Dean's related", 'University related'].includes(pdf.category))
                        ];

                        setPdfLinks(sortedCategories);
                    } else if (role === 'Dean') {
                        const sortedCategories = [
                            { category: 'Faculty related', items: groupedPdfs['Faculty related'] || [] },
                            { category: "HOD's related", items: groupedPdfs["HOD's related"] || [] },
                            { category: "Asso.Dean's related", items: groupedPdfs["Asso.Dean's related"] || [] },
                            { category: "Dean's related", items: groupedPdfs["Dean's related"] || [] },
                            ...pdfCategories.filter(pdf => !['Faculty related', "HOD's related", "Asso.Dean's related", "Dean's related"].includes(pdf.category))
                        ];

                        setPdfLinks(sortedCategories);

                    } else if (role === 'Asso.Dean') {
                        const sortedCategories = [
                            { category: 'Faculty related', items: groupedPdfs['Faculty related'] || [] },
                            { category: "HOD's related", items: groupedPdfs["HOD's related"] || [] },
                            { category: "Asso.Dean's related", items: groupedPdfs["Asso.Dean's related"] || [] },
                            ...pdfCategories.filter(pdf => !['Faculty related', "HOD's related", "Asso.Dean's related"].includes(pdf.category))
                        ];

                        setPdfLinks(sortedCategories);

                    } else if (role === 'HOD') {
                        const sortedCategories = [
                            { category: 'Faculty related', items: groupedPdfs['Faculty related'] || [] },
                            { category: "HOD's related", items: groupedPdfs["HOD's related"] || [] },
                            { category: "Dept.Equipment", items: groupedPdfs["Dept.Equipment"] || [] },
                            { category: "Teaching Material", items: groupedPdfs["Teaching Material"] || [] },
                            { category: "Staff Presentations", items: groupedPdfs["Staff Presentations"] || [] },
                            // ...(groupedPdfs[departmentCategory] ? [{ category: departmentCategory, items: groupedPdfs[departmentCategory] }] : []),
                            ...pdfCategories.filter(pdf =>
                                !['Faculty related', "HOD's related", "Dept.Equipment", "Teaching Material", "Staff Presentations"].includes(pdf.category))
                        ];
                        setPdfLinks(sortedCategories);

                    } else if (role === 'Faculty') {
                        const sortedCategories = [
                            { category: 'Faculty related', items: groupedPdfs['Faculty related'] || [] },
                            { category: "Dept.Equipment", items: groupedPdfs["Dept.Equipment"] || [] },
                            { category: "Teaching Material", items: groupedPdfs["Teaching Material"] || [] },
                            { category: "Staff Presentations", items: groupedPdfs["Staff Presentations"] || [] },
                            // ...(groupedPdfs[departmentCategory] ? [{ category: departmentCategory, items: groupedPdfs[departmentCategory] }] : []),
                            ...pdfCategories.filter(pdf =>
                                !['Faculty related', "Dept.Equipment", "Teaching Material", "Staff Presentations"].includes(pdf.category))
                        ];
                        setPdfLinks(sortedCategories);


                        

                    } else {
                        setPdfLinks(pdfCategories);
                    }
                }
            } catch (error) {
                console.error('Error fetching PDFs:', error);
                if (error.response && error.response.status === 401) {
                    alert('Unauthorized! Please log in to access the PDFs.');
                }
            }
        };

        fetchPdfs();
    }, []);

    const handlePdfClick = (pdfPath, event) => {
        event.preventDefault();
        console.log("PDF path:", pdfPath);
        const pdfUrl = `http://localhost:5001/${pdfPath.replace(/\\/g, '/')}`;
        setSelectedPdf(pdfUrl);
    };

    const handleDocumentsClick = (categoryItems) => {
        settype("Documents")
        setSelectedCategoryPdfs(categoryItems);
        setIsSearchVisible(true);
        setNoResults(false);
        setShowDocuments(true);
        setShowAnnouncements(false);  // Hide announcements when showing documents
        setShowContentP(false);
    };


    const handleBackClick = () => {
        setSelectedPdf(null);
    };



    const handleSubCategoryClick = (categoryItems, subCategory) => {
        settype(subCategory);
        // settype(null)
        const filteredItems = categoryItems.filter(item => item.subcategory === subCategory);
        setSelectedCategoryPdfs(filteredItems);
        setIsSearchVisible(true);
        setNoResults(false);
        setShowDocuments(true);
        setShowContentP(false);
        // setShowAnnouncements(false);
    };




    const handleAnnouncementsClick = (categoryItems) => {
        settype("Announcements")
        setSelectedCategoryPdfs(categoryItems);
        setShowContentP(false);
        setShowDocuments(true);
        setIsSearchVisible(true);
        setShowAnnouncements(true);  // Show announcements
    };

    const filteredPdfs = selectedCategoryPdfs.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) && (!type || item.subcategory === type)
        // && (!type || item.subcategory === type)
    );


    useEffect(() => {
        if (filteredPdfs.length === 0 && searchQuery) {
            setNoResults(true);
        } else {
            setNoResults(false);
        }
    }, [searchQuery, filteredPdfs]);



    return (
        <div className="content">
            {/* Left Navigation Bar */}
            <div className="leftNavBar">
                {pdfLinks.map((category, index) => (
                    <div key={index}>
                        <div className="category-container">
                            <li className={`category-title ${activeCategory === category.category ? "active" : ""}`}>
                                {category.category}
                            </li>
                            <div className="category-options">
                                {/* {[...new Set(category.items.map(item => item.subcategory))].map((subCat) => (
                                    <button key={subCat} onClick={() => handleSubCategoryClick(category.items, subCat)}>
                                        {subCat}
                                    </button>
                                ))} */}

{[...new Set(category.items.map(item => item.subcategory))]
    .filter(subCat =>
        !(
            ["Dept.Equipment", "Teaching Material", "Staff Presentations"].includes(category.category)
            && subCat === "Announcements"
        )
    )
    .map((subCat) => (
        <button key={subCat} onClick={() => handleSubCategoryClick(category.items, subCat)}>
            {subCat}
        </button>
    ))}




                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {/* Right Content Area */}
            <div className="rightContent">
                {showContentP ? (
                    <p className="contentp">
                        Aditya University is a State Private University formed under the Andhra Pradesh Private Universities Act,
                        2016. It has evolved from the well-established Aditya Engineering College in Surampalem, Kakinada District,
                        Andhra Pradesh. Aditya University is committed to providing quality higher education with global standards.
                        Programs are well crafted to blend academic rigor with practical relevance, equipping students to effectively
                        address both societal and industrial challenges. Experienced and learned teachers encourage intellectual
                        curiosity, critical thinking, and cooperation among the diverse student community in an inclusive manner to
                        realize their full potential and contribute to society. The memorandum of understanding with foreign
                        universities ushers in a new era of international academic excellence, fostering a vibrant, globally engaged
                        educational community at Aditya University leading to joint degree certifications and joint research
                        programs. Industry collaborations build a synergistic relationship for internship opportunities,
                        project-based learning, and innovative research.
                    </p>
                ) : isSearchVisible ? (
                    <>
                        <div className="searchBar">
                            <input
                                type="text"
                                placeholder="Search PDFs in this category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="searchInput"
                            />
                        </div>

                        {noResults ? (
                            <p>No search results found</p>
                        ) : filteredPdfs.length > 0 ? (
                            <div className="pdfGrid">
                                <div className={type === 'Documents' ? 'documents-view' : 'announcements-view'}>
                                    {type === 'Documents' ? (
                                        filteredPdfs.map((item, index) => (
                                            <div key={index} className="pdfItem">
                                                {item.filePath ? (
                                                    <a href="#" className="pdfLink" onClick={(event) => handlePdfClick(item.filePath, event)}>
                                                        {item.name}
                                                    </a>
                                                ) : (
                                                    <span>{item.name}</span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        filteredPdfs.length > 0 ? (
                                            <div className="announcements-scroller">
                                                <ul>
                                                    {filteredPdfs.map((item, index) => (
                                                        <li key={index}>
                                                            {item.filePath ? (
                                                                <a href="#" className="pdfLink" onClick={(event) => handlePdfClick(item.filePath, event)}>
                                                                    {item.name}
                                                                </a>
                                                            ) : (
                                                                <span>{item.name}</span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <p>No announcements available.</p>
                                        )
                                    )}
                                </div>


                            </div>
                        ) : selectedPdf ? (
                            <div className="pdfViewer">
                                <object
                                    id="pdfObject"
                                    data={selectedPdf}
                                    width="100%"
                                    height="700px"
                                    type="application/pdf"
                                >
                                    <p>Your browser doesn't support viewing PDFs. Please download the PDF to view it.</p>
                                </object>
                            </div>
                        ) : null}
                    </>
                ) : null}
            </div>

            {selectedPdf && (
                <div className="pdfViewer">
                    <object
                        id="pdfObject"
                        data={selectedPdf}
                        width="100%"
                        height="700px"
                        type="application/pdf"
                    >
                        <p>Your browser doesn't support viewing PDFs. Please download the PDF to view it.</p>
                    </object>
                    <button className="backButton" onClick={handleBackClick}>
                        &#8592;
                    </button>
                </div>
            )}
        </div>
    );
};

export default Content;
