import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FileText, Calendar, Clock, ArrowLeft, Upload, CheckCircle, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';

const Announcements = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [role, setRole] = useState('Student');
    const [dept, setDept] = useState('All');
    const [file, setFile] = useState(null);

    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            title: 'Faculty Meeting Regarding NBA Accreditation',
            date: 'Dec 11, 2025',
            time: '10:00 AM',
            description: 'All faculty members are requested to attend the mandatory meeting in the Conference Hall. Please bring your updated course files.',
            category: 'Meeting'
        },
        {
            id: 2,
            title: 'Submission of Internal Marks',
            date: 'Dec 10, 2025',
            time: '04:00 PM',
            description: 'Last date for submission of internal marks for 3rd year students is Dec 15th.',
            category: 'Deadline'
        },
    ]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        const newAnnouncement = {
            id: announcements.length + 1,
            title,
            description,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            category: 'General'
        };
        setAnnouncements([newAnnouncement, ...announcements]);
        alert('Announcement sent successfully!');
        // Reset form
        setTitle('');
        setDescription('');
        setFile(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-slate-100">
                    <ArrowLeft className="h-6 w-6 text-slate-600" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Announcements & Circulars</h2>
                    <p className="text-slate-500 mt-1">Create and manage updates for students and staff.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Send Announcement Form */}
                <div className="lg:col-span-2">
                    <Card className="border-t-4 border-t-brand-orange shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                                <Megaphone className="h-5 w-5 text-brand-orange" />
                                Send New Announcement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSend} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Title</label>
                                    <Input
                                        placeholder="Enter announcement title"
                                        className="bg-slate-50 focus:bg-white transition-colors"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Description</label>
                                    <textarea
                                        className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white transition-colors resize-none"
                                        placeholder="Type your message here..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Target Role</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue/20 focus:outline-none focus:bg-white transition-colors"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        >
                                            <option value="Student">Student</option>
                                            <option value="Faculty">Faculty</option>
                                            <option value="All">All</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Target Department</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue/20 focus:outline-none focus:bg-white transition-colors"
                                            value={dept}
                                            onChange={(e) => setDept(e.target.value)}
                                        >
                                            <option value="All">All Departments</option>
                                            <option value="CSE">CSE</option>
                                            <option value="IT">IT</option>
                                            <option value="AIML">AIML</option>
                                            <option value="ECE">ECE</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Attachment (Optional)</label>
                                    <div className="flex items-center gap-3">
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors border border-slate-200">
                                                <Upload className="h-4 w-4" />
                                                Choose File
                                            </div>
                                            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                                        </label>
                                        <span className="text-sm text-slate-500 italic">
                                            {file ? file.name : 'No file chosen'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button type="submit" className="bg-brand-orange hover:bg-orange-600 text-white px-8 py-2 shadow-lg shadow-orange-200">
                                        Send Announcement
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Previous Announcements List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg px-1">Recent History</h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {announcements.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="hover:shadow-md transition-shadow bg-white/50 border-slate-200">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue uppercase">
                                                {item.category}
                                            </span>
                                            <span className="text-[10px] text-slate-400">{item.date}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm leading-tight mb-2">{item.title}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Announcements;
