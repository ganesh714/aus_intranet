import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Add.css';

const Add = () => {
    const [selectedOption1, setSelectedOption1] = useState('');
    const [selectedOption2, setSelectedOption2] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState(''); // Hook for selected sub-category
    const [newCategory, setNewCategory] = useState('');
    const [newSubCategory, setNewSubCategory] = useState('');
    const [numOfFiles, setNumOfFiles] = useState(0);
    const [fileInputs, setFileInputs] = useState([]);
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [filesInCategory, setFilesInCategory] = useState([]);
    const navigate = useNavigate();
    const [subCategories, setSubCategories] = useState([]);
    // Get user role and sub-role from session storage
    const userRole = sessionStorage.getItem('userRole');
    const usersubRole = sessionStorage.getItem('usersubRole');  // Assuming subRole is stored in session storage

    const fetchCategories = async () => {
        const userRole = sessionStorage.getItem('userRole');
        const usersubRole = sessionStorage.getItem('usersubRole');

        // Fetch categories with role and subRole filters
        const url = `http://localhost:5001/get-pdfs?role=${userRole}&subRole=${usersubRole}`;
        const response = await fetch(url);
        const data = await response.json();

        // Extract unique categories from the filtered PDFs
        const uniqueCategories = [...new Set(data.pdfs.map(pdf => pdf.category))];

        // If the user is an Admin, modify the categories as per the logic
        if (userRole === 'Admin' || userRole === 'Officers') {
            // Admin/Officers can modify categories
            if (!uniqueCategories.includes("University related")) {
                uniqueCategories.push("University related");
            }

            if (!uniqueCategories.includes("Dean's related")) {
                uniqueCategories.push("Dean's related");
            }

            if (!uniqueCategories.includes("Asso.Dean's related")) {
                uniqueCategories.push("Asso.Dean's related");
            }

            if (!uniqueCategories.includes("HOD's related")) {
                uniqueCategories.push("HOD's related")
            }

            if (!uniqueCategories.includes('Faculty related')) {
                uniqueCategories.push('Faculty related');
            }

        } else if (userRole === 'Dean') {
            // Dean can modify 'Dean's related', 'HOD's related', and 'Faculty related'
            const deanCategories = ["Dean's related", "Asso.Dean's related", "HOD's related", "Faculty related"];

            deanCategories.forEach(category => {
                if (!uniqueCategories.includes(category)) {
                    uniqueCategories.push(category);
                }
            });

        } else if (userRole === 'Asso.Dean') {
            const deanCategories = ["Asso.Dean's related", "HOD's related", "Faculty related"];
            deanCategories.forEach(category => {
                if (!uniqueCategories.includes(category)) {
                    uniqueCategories.push(category);
                }
            });

        } else if (userRole === 'HOD') {
            // HOD can modify 'HOD's related' and 'Faculty related'
            const hodCategories = ["HOD's related", "Faculty related", "Dept.Equipment", "Teaching Material", "Staff Presentations"];

            hodCategories.forEach(category => {
                if (!uniqueCategories.includes(category)) {
                    uniqueCategories.push(category);
                }
            });
        } else {
            // If the user is not Admin/Leadership, exclude the specific categories
            const adminCategories = ["University related", "Dean's related", "Asso.Dean's related", "HOD's related", "Faculty related"];
            const filteredCategories = uniqueCategories.filter(category => !adminCategories.includes(category));
            setCategories(filteredCategories);
            return;
        }

        if (userRole !== 'HOD') {
            const filtered = uniqueCategories.filter(category => category !== "Dept.Equipment");
            setCategories(filtered);
            return;
        }

        setCategories(uniqueCategories);
    };

    const fetchFiles = async () => {
        if (!selectedOption2) return;

        try {
            const userRole = sessionStorage.getItem('userRole');
            const usersubRole = sessionStorage.getItem('usersubRole');

            const url = `http://localhost:5001/get-pdfs?role=${userRole}&subRole=${usersubRole}&category=${encodeURIComponent(selectedOption2)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            const filteredFiles = data.pdfs?.filter(pdf => pdf.category === selectedOption2) || [];
            setFilesInCategory(filteredFiles);

            // Extract subcategories
            const existingSubCategories = new Set(filteredFiles.map(file => file.subcategory));

            // Ensure default subcategories exist
            existingSubCategories.add('Documents');
            existingSubCategories.add('Announcements');

            setSubCategories(Array.from(existingSubCategories));
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    const handleDeletePdf = async (pdfId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this file?');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5001/delete-pdf/${pdfId}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (response.ok) {
                alert('PDF deleted successfully!');
                fetchFiles();
            } else {
                alert(data.message || 'Error deleting PDF');
            }
        } catch (error) {
            console.error('Error deleting PDF:', error);
            alert('Error deleting PDF');
        }
    };

    // Update fileInputs when numOfFiles changes
    useEffect(() => {
        setFileInputs(Array.from({ length: numOfFiles }).map(() => ({ fileName: '', file: null })));
    }, [numOfFiles]);

    useEffect(() => {
        fetchCategories(); // Fetch categories when the component mounts
    }, []);

    useEffect(() => {
        if (selectedOption1 === 'Edit' && selectedOption2) {
            fetchFiles();
        }
    }, [selectedOption1, selectedOption2]);

    // Validate and submit form
    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};

        // Validate selections
        if (!selectedOption1) newErrors.selectedOption1 = "Please select Edit or Create.";
        if (selectedOption1 === 'Edit' && !selectedOption2) newErrors.selectedOption2 = "Please select a category.";
        if (selectedOption1 === 'Create' && !newCategory) newErrors.newCategory = "Please enter a new category.";
        if (!numOfFiles || numOfFiles <= 0) newErrors.numOfFiles = "Please enter a valid number of files.";

        // Validate file inputs
        fileInputs.forEach((input, index) => {
            if (!input.file) newErrors[`file${index}`] = `Please select a file for file #${index + 1}.`;
            if (!input.fileName) newErrors[`fileName${index}`] = `Please enter a name for file #${index + 1}.`;
        });

        // If there are errors, return early
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // All fields are valid, upload the files to the server
        const formData = new FormData();

        fileInputs.forEach((input, index) => {
            formData.append('file', input.file);
            formData.append('category', selectedOption1 === 'Create' ? newCategory : selectedOption2);
            formData.append('subCategory', selectedOption1 === "Create" ? newSubCategory : selectedSubCategory); // Include sub-category in the form data
            formData.append('name', input.fileName);
            formData.append('user', JSON.stringify({
                username: sessionStorage.getItem('username'),
                role: userRole,
                subRole: usersubRole,
            }));
        });
        try {
            // Upload files
            const response = await fetch('http://localhost:5001/add-pdf', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                // Reset form state and navigate on success
                setSelectedOption1('');
                setSelectedOption2('');
                setNewCategory('');
                setNumOfFiles(0);
                setFileInputs([]);
                setErrors({});
                setSelectedSubCategory('');  // Reset sub-category on successful upload
                alert('Successfully uploaded files');
                navigate('/home-page');
            } else {
                alert(data.message || 'Error uploading files');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Error uploading files');
        }
    };

    // Handle file name change
    const handleFileNameChange = (e, index) => {
        const updatedFileInputs = [...fileInputs];
        updatedFileInputs[index].fileName = e.target.value;
        setFileInputs(updatedFileInputs);
    };

    // Handle file selection
    const handleFileChange = (e, index) => {
        const updatedFileInputs = [...fileInputs];
        updatedFileInputs[index].file = e.target.files[0];
        setFileInputs(updatedFileInputs);
    };

    return (
        <div className="add-container">
            <form onSubmit={handleSubmit} className="add-form">
                <button
                    type="button"
                    onClick={() => navigate('/home-page')}
                    className="add-back-button"
                >
                    <strong>&#8592;</strong>
                </button>

                {/* Action Selector (Create or Edit) */}
                <div className="form-group">
                    <label className="form-label">
                        Action:
                        <select value={selectedOption1} onChange={(e) => setSelectedOption1(e.target.value)} className="form-select">
                            <option value="">Select...</option>
                            <option value="Create">Create</option>
                            <option value="Edit">Edit</option>
                        </select>
                    </label>
                    {errors.selectedOption1 && <p className="error-text">{errors.selectedOption1}</p>}
                </div>

                {/* New Category for Create Action */}
                {selectedOption1 === 'Create' && (
                    <div>
                        <div className="form-group">
                            <label className="form-label">
                                New Category:
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="form-input"
                                />
                            </label>
                            {errors.newCategory && <p className="error-text">{errors.newCategory}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                New SubCategory:
                                <input
                                    type="text"
                                    value={newSubCategory}
                                    onChange={(e) => setNewSubCategory(e.target.value)}
                                    className="form-input"
                                />
                            </label>
                            {errors.newCategory && <p className="error-text">{errors.newCategory}</p>}
                        </div>
                    </div>
                )}

                {/* Category for Edit Action */}
                {selectedOption1 === 'Edit' && (
                    <div className="form-group">
                        <label className="form-label">
                            Category:
                            <select value={selectedOption2} onChange={(e) => setSelectedOption2(e.target.value)} className="form-select">
                                <option value="">Select Category</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {errors.selectedOption2 && <p className="error-text">{errors.selectedOption2}</p>}
                    </div>
                )}

                {selectedOption1 === 'Edit' && selectedOption2 && (
                    <div className="form-group">
                        <label className="form-label">
                            Sub Category:
                            <select
                                value={selectedSubCategory}
                                onChange={(e) => setSelectedSubCategory(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Select Sub Category</option>
                                {subCategories.map((subCat, index) => (
                                    <option key={index} value={subCat}>
                                        {subCat}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {errors.selectedSubCategory && <p className="error-text">{errors.selectedSubCategory}</p>}
                    </div>
                )}
                {selectedOption1 === 'Edit' && selectedOption2 && selectedSubCategory && filesInCategory.length > 0 && (
                    <div className="form-group row">
                        <h4>Existing Files in "{selectedOption2}" Category - "{selectedSubCategory}" Subcategory:</h4>
                        {filesInCategory
                            .filter(file => file.subcategory === selectedSubCategory)
                            .map((file) => (
                                <div key={file._id} className="file-item col-4">
                                    <span>{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeletePdf(file._id)}
                                        className="add-delete-button"
                                    >
                                        &#128465;
                                    </button>
                                </div>
                            ))}
                    </div>
                )}

                <br />

                {/* Number of Files */}
                <div className="form-group">
                    <label className="form-label">
                        Add Files:
                        <input
                            type="number"
                            value={numOfFiles}
                            onChange={(e) => setNumOfFiles(parseInt(e.target.value))}
                            className="form-input"
                        />
                    </label>
                    {errors.numOfFiles && <p className="error-text">{errors.numOfFiles}</p>}
                </div>

                {/* File Inputs */}
                {Array.from({ length: numOfFiles }).map((_, index) => (
                    <div key={index} className="file-input-group">
                        <label className="form-label">
                            File Name:
                            <input
                                type="text"
                                value={fileInputs[index]?.fileName || ''}
                                onChange={(e) => handleFileNameChange(e, index)}
                                className="form-input"
                            />
                        </label>
                        {errors[`fileName${index}`] && <p className="error-text">{errors[`fileName${index}`]}</p>}
                        <label className="form-label">
                            File:
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, index)}
                                className="form-input"
                            />
                        </label>
                        {errors[`file${index}`] && <p className="error-text">{errors[`file${index}`]}</p>}
                    </div>
                ))}

                {/* Submit Button */}
                <button type="submit" className="add-form-button">Submit</button>
            </form>
        </div>
    );
};

export default Add;