import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FileText, Search, X, ChevronRight, Clock } from 'lucide-react';
import dashboardBanner from '../assets/dashboard-banner.png';
import { cn } from '../lib/utils';


const Dashboard = () => {
    const [expandedCategory, setExpandedCategory] = React.useState('Faculty related');
    const navigate = useNavigate();
    const [selectedSubItem, setSelectedSubItem] = React.useState('Documents');
    const [selectedDoc, setSelectedDoc] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const sidebarStructure = [
        {
            title: 'Faculty related',
            items: ['Documents', 'Announcements', 'Timetables']
        },
        {
            title: 'Dept.Equipment',
            items: ['Manuals', 'Maintenance', 'Usage Logs']
        },
        {
            title: 'Teaching Material',
            items: ['Lecture Notes', 'Syllabus', 'Question Papers']
        },
        {
            title: 'Staff Presentations',
            items: ['PPTs', 'Webinars', 'Reports']
        }
    ];

    const announcements = [
        "All faculty members are requested to submit the semester plan by Friday.",
        "New research grant opportunities available - check the Research portal.",
        "Department meeting scheduled for Monday at 10:00 AM in the Conference Hall.",
        "Library hours extended for the upcoming examination period."
    ];


    const toggleCategory = (categoryTitle) => {
        if (expandedCategory === categoryTitle) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(categoryTitle);
        }
    };
    const getMockDocs = (category, subItem) => {
        const baseDocs = [
            { id: 1, title: `${subItem} - ${category} File 1`, type: 'PDF', date: '2024-03-01' },
            { id: 2, title: `${subItem} - ${category} File 2`, type: 'PDF', date: '2024-03-05' },
            { id: 3, title: `${subItem} - ${category} File 3`, type: 'PDF', date: '2024-03-10' },
        ];
        return baseDocs;
    };

    const currentDocs = React.useMemo(() => {
        const docs = getMockDocs(expandedCategory || 'Faculty related', selectedSubItem || 'Documents');
        if (!searchTerm) return docs;
        return docs.filter(doc =>
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [expandedCategory, selectedSubItem, searchTerm]);
    return (
        <div className="space-y-6">
            {/* Banner Section */}
            <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img src={dashboardBanner} alt="Welcome to Aditya University Intranet" className="w-full h-auto object-cover" />
            </div>
            {/* Scrolling Announcements */}
            <div className="bg-white border-y border-brand-orange/20 py-2 overflow-hidden flex items-center shadow-sm">
                <div
                    className="bg-brand-orange text-white text-xs font-bold px-3 py-1 ml-4 rounded uppercase tracking-wider shrink-0 z-10 shadow-md cursor-pointer hover:bg-orange-600 transition-colors"
                    role="button"
                    onClick={() => navigate('/announcements')}
                >
                    Announcements
                </div>
                <div className="marquee-container flex-1 overflow-hidden ml-4 relative h-6 cursor-pointer" onClick={() => navigate('/announcements')}>
                    <div className="absolute whitespace-nowrap animate-marquee">
                        {announcements.map((announcement, index) => (
                            <span key={index} className="mx-8 text-sm font-medium text-brand-blue inline-flex items-center">
                                <span className="w-2 h-2 bg-brand-orange rounded-full mr-2"></span>
                                {announcement}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar Widget (Accordion Style) */}
                <div className="lg:col-span-1 space-y-4">
                    {sidebarStructure.map((category) => (
                        <div key={category.title} className="rounded-lg overflow-hidden shadow-md">
                            <button
                                onClick={() => toggleCategory(category.title)}
                                className={`w-full flex items-center justify-between p-4 font-bold text-lg transition-colors
                                    ${expandedCategory === category.title
                                        ? 'bg-brand-orange text-white'
                                        : 'bg-white text-brand-blue hover:bg-orange-50'}`}
                            >
                                {category.title}
                                <span className="text-xl">{expandedCategory === category.title ? '−' : '+'}</span>
                            </button>
                            {expandedCategory === category.title && (
                                <div className="bg-black text-white p-2">
                                    {category.items.map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => {
                                                setSelectedSubItem(item);
                                                setSelectedDoc(null);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded transition-colors text-sm font-medium
                                                ${selectedSubItem === item
                                                    ? 'bg-brand-blue/80 text-white border-l-4 border-brand-orange'
                                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="shadow-md min-h-[500px]">
                        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-bold text-brand-blue uppercase">
                                {expandedCategory} <span className="text-brand-orange">/</span> {selectedSubItem}
                            </CardTitle>
                            {selectedDoc && (
                                <button
                                    onClick={() => setSelectedDoc(null)}
                                    className="text-sm font-medium text-slate-500 hover:text-brand-orange underline"
                                >
                                    Back to {selectedSubItem}
                                </button>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            {selectedDoc ? (
                                // PDF Viewer / Document View
                                <div className="w-full h-[600px] bg-slate-100 flex flex-col items-center justify-center p-8">
                                    {/* Placeholder for actual PDF Viewer */}
                                    <div className="w-full h-full bg-white shadow-inner border border-slate-200 rounded-lg flex flex-col">
                                        <div className="bg-slate-800 text-white p-2 text-sm flex justify-between items-center rounded-t-lg">
                                            <span>{selectedDoc.title}.pdf</span>
                                            <div className="flex gap-2">
                                                <button className="hover:bg-slate-700 px-2 rounded">Download</button>
                                                <button className="hover:bg-slate-700 px-2 rounded">Print</button>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center bg-slate-50">
                                            <div className="text-center text-slate-400">
                                                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                                <p>PDF Preview for {selectedDoc.title}</p>
                                                <p className="text-xs mt-2 uppercase">Page 1 / 1</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="relative mb-6 group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-orange transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={`Search in ${selectedSubItem}...`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-all text-sm"
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {currentDocs.length > 0 ? (
                                            currentDocs.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    onClick={() => setSelectedDoc(doc)}
                                                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-brand-orange/30 hover:shadow-md hover:shadow-brand-orange/5 cursor-pointer transition-all group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "p-3 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                                            doc.type === 'PDF' ? 'bg-red-50 text-red-600 group-hover:bg-red-100' : 'bg-blue-50 text-brand-blue group-hover:bg-blue-100'
                                                        )}>
                                                            <FileText className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-slate-800 group-hover:text-brand-orange transition-colors text-sm md:text-base">{doc.title}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{doc.type}</span>
                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <Clock size={10} /> {doc.date}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-slate-300 group-hover:text-brand-orange transition-colors transform group-hover:translate-x-1">
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                                <div className="bg-white p-3 rounded-full w-fit mx-auto shadow-sm mb-3">
                                                    <Search className="h-6 w-6 text-slate-300" />
                                                </div>
                                                <p className="font-medium text-slate-700">No documents found</p>
                                                <p className="text-xs mt-1">Try adjusting your search for "{searchTerm}"</p>
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="text-brand-orange text-xs font-medium mt-3 hover:underline"
                                                >
                                                    Clear Search
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card >
                </div >
            </div >
        </div >
    );
};

export default Dashboard;
