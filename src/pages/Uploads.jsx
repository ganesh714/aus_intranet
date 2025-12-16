import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UploadCloud, FileText, Calendar, Trash2, ArrowLeft, ChevronDown, Search, X, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const departments = [
    'All Departments',
    'IT',
    'CSE',
    'AIML',
    'CE',
    'MECH',
    'EEE',
    'ECE',
    'Ag.E',
    'MPE',
    'FED'
];

const FileDropzone = ({ label, description, onFileSelect, selectedFile }) => {
    const inputRef = useRef(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={handleClick}
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xlsx,.xls"
            />
            <div className="mx-auto h-12 w-12 rounded-full bg-brand-orange/10 flex items-center justify-center mb-4">
                <UploadCloud className="h-6 w-6 text-brand-orange" />
            </div>
            <h4 className="text-lg font-medium text-slate-900">
                {selectedFile ? selectedFile.name : label}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
                {selectedFile
                    ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : description}
            </p>
            <Button variant="outline" className="mt-4" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
                {selectedFile ? 'Change File' : 'Select File'}
            </Button>
        </div>
    );
};

const Uploads = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('teaching');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDept, setSelectedDept] = useState('All Departments');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [uploads, setUploads] = useState([
        { name: 'Unit 1 - Introduction to AI.pdf', type: 'PDF', size: '2.4 MB', date: 'Dec 10, 2025', category: 'Teaching', department: 'AIML' },
        { name: 'Term 2 Timetable.xlsx', type: 'Excel', size: '14 KB', date: 'Dec 01, 2025', category: 'Timetable', department: 'IT' },
        { name: 'Machine Learning Basics.pdf', type: 'PDF', size: '3.1 MB', date: 'Nov 28, 2025', category: 'Teaching', department: 'CSE' },
        { name: 'Power Systems Analysis.pdf', type: 'PDF', size: '5.2 MB', date: 'Nov 25, 2025', category: 'Teaching', department: 'EEE' },
        { name: 'Digital Electronics Lab Manual.docx', type: 'DOCX', size: '1.8 MB', date: 'Nov 20, 2025', category: 'Teaching', department: 'ECE' },
    ]);

    const filteredUploads = React.useMemo(() => {
        return uploads.filter(upload => {
            const matchesDept = selectedDept === 'All Departments' || upload.department === selectedDept;
            const matchesSearch = upload.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                upload.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                upload.category.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesDept && matchesSearch;
        });
    }, [uploads, selectedDept, searchTerm]);

    const handleUpload = () => {
        if (!selectedFile) return;

        const newFile = {
            name: selectedFile.name,
            type: selectedFile.name.split('.').pop().toUpperCase(),
            size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            category: activeTab === 'teaching' ? 'Teaching' : 'Timetable',
            department: 'IT'
        };

        setUploads([newFile, ...uploads]);
        setSelectedFile(null);
        alert('File uploaded successfully!');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-slate-100">
                        <ArrowLeft className="h-6 w-6 text-slate-600" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Upload Center</h2>
                        <p className="text-slate-500 mt-1">Manage your teaching materials and timetables.</p>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-orange transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-full text-sm w-full md:w-64 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-all shadow-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    {/* Department Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-sm font-medium transition-all min-w-[180px] justify-between shadow-sm",
                                isDropdownOpen ? "border-brand-orange text-brand-orange ring-1 ring-brand-orange/20" : "border-slate-200 text-slate-700 hover:border-brand-orange/50"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5" />
                                {selectedDept}
                            </span>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isDropdownOpen && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden"
                                >
                                    <div className="py-1 max-h-[300px] overflow-y-auto">
                                        {departments.map((dept) => (
                                            <button
                                                key={dept}
                                                onClick={() => {
                                                    setSelectedDept(dept);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between",
                                                    selectedDept === dept
                                                        ? "bg-brand-orange/10 text-brand-orange font-medium"
                                                        : "text-slate-600 hover:bg-slate-50"
                                                )}
                                            >
                                                {dept}
                                                {selectedDept === dept && <div className="h-1.5 w-1.5 rounded-full bg-brand-orange" />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 w-fit">
                {['teaching', 'timetable'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedFile(null); }}
                        className={cn(
                            'rounded-lg px-4 py-2 text-sm font-medium transition-all capitalize',
                            activeTab === tab
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-900'
                        )}
                    >
                        {tab === 'teaching' ? 'Teaching Material' : 'Class Timetable'}
                    </button>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Upload Form */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>
                            {activeTab === 'teaching' ? 'Upload Teaching Material' : 'Upload Timetable'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FileDropzone
                            label={`Drop ${activeTab === 'teaching' ? 'lecture notes' : 'timetable file'} here`}
                            description="Supports PDF, DOCX, XLSX (Max 10MB)"
                            onFileSelect={setSelectedFile}
                            selectedFile={selectedFile}
                        />

                        {activeTab === 'teaching' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Subject Name</label>
                                    <Input placeholder="e.g. Artificial Intelligence" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Unit / Topic</label>
                                    <Input placeholder="e.g. Unit 1" />
                                </div>
                            </div>)}
                        {activeTab === 'timetable' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Semester / Section</label>
                                <Input placeholder="e.g. 3rd Sem - Section A" />
                            </div>
                        )}
                        <div className="flex justify-end">
                            <Button onClick={handleUpload} disabled={!selectedFile} className="bg-brand-blue hover:bg-brand-blue/90">
                                Upload File
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Files List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Uploads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredUploads.length > 0 ? (
                                filteredUploads.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={cn(
                                                "p-2 rounded text-white flex-shrink-0",
                                                file.type === 'PDF' ? 'bg-red-500' :
                                                    file.type === 'Excel' || file.type === 'XLSX' ? 'bg-green-600' :
                                                        'bg-blue-600'
                                            )}>
                                                {file.category === 'Teaching' ? <FileText size={18} /> : <Calendar size={18} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-slate-900 truncate group-hover:text-brand-orange transition-colors">{file.name}</p>
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                                                        {file.department}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400">{file.size} • {file.date} • {file.category}</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 flex flex-col items-center justify-center">
                                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                                        <Search className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-900 font-medium">No files found</p>
                                    <p className="text-slate-500 text-sm mt-1">
                                        No uploads match "{searchTerm}" in {selectedDept}
                                    </p>
                                    <Button
                                        variant="link"
                                        className="text-brand-orange mt-2"
                                        onClick={() => { setSearchTerm(''); setSelectedDept('All Departments'); }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Uploads;
