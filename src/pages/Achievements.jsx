import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Award, Plus, Calendar, ExternalLink, BookOpen, Scroll, Trophy, GraduationCap, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const Achievements = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

   
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newAchievement = {
            id: achievements.length + 1,
            title: formData.get('title'),
            type: formData.get('type'),
            date: formData.get('date'),
            organization: formData.get('organization'),
            description: formData.get('description')
        };

        setAchievements([newAchievement, ...achievements]);
        setIsModalOpen(false);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Publication': return <BookOpen className="w-4 h-4" />;
            case 'Certificate': return <Scroll className="w-4 h-4" />;
            case 'Award': return <Trophy className="w-4 h-4" />;
            case 'FDP': return <GraduationCap className="w-4 h-4" />;
            default: return <Award className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Publication': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Certificate': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Award': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'FDP': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Achievements</h2>
                    <p className="text-slate-500 mt-2 text-lg">Showcase your academic and professional milestones.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} size="lg" className="gap-2 shadow-lg shadow-brand-orange/20 bg-brand-orange hover:bg-brand-orange/90 text-white">
                    <Plus className="h-5 w-5" /> Add Achievement
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 group overflow-hidden">
                            <div className={cn("h-1 w-full", getTypeColor(item.type).replace('bg-', 'bg-').split(' ')[0].replace('100', '500'))}></div>
                            <CardContent className="p-6 flex flex-col h-full">
                                <div className="mb-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", getTypeColor(item.type))}>
                                            {getTypeIcon(item.type)}
                                            {item.type}
                                        </span>
                                        <div className="text-xs font-medium text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                                            <Calendar className="w-3 h-3" />
                                            {item.date}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-blue transition-colors leading-tight">
                                        {item.title}
                                    </h3>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                        {item.organization}
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                                    <button className="text-sm font-medium text-brand-orange hover:text-orange-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        View Certificate <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Achievement"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Achievement Title</label>
                        <Input name="title" placeholder="e.g. Best Paper Award 2025" required className="bg-slate-50 border-slate-200 focus:bg-white" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Type</label>
                            <select name="type" className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none focus:bg-white transition-colors">
                                <option value="Workshop">Workshop</option>
                                <option value="Publication">Publication</option>
                                <option value="Certificate">Certificate</option>
                                <option value="FDP">FDP</option>
                                <option value="Award">Award</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Date Received</label>
                            <Input name="date" type="date" required className="bg-slate-50 border-slate-200 focus:bg-white" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Issuing Organization</label>
                        <Input name="organization" placeholder="e.g. IIT Bombay, IEEE, etc." required className="bg-slate-50 border-slate-200 focus:bg-white" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Description</label>
                        <textarea
                            name="description"
                            className="flex min-h-[100px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none focus:bg-white transition-colors resize-none"
                            placeholder="Briefly describe the achievement..."
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Proof Document</label>
                        <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-center cursor-pointer">
                            <Input type="file" className="hidden" id="proof-upload" />
                            <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                <Upload className="w-5 h-5 text-slate-400" />
                                <span className="text-xs text-slate-500">Click to upload certificate (PDF/JPG)</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="shadow-lg shadow-brand-blue/20 bg-brand-blue hover:bg-brand-blue/90">Save Achievement</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Achievements;
