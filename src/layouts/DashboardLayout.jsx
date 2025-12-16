import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Plus } from 'lucide-react';

const DashboardLayout = () => {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen bg-slate-50 flex-col">
            {/* Header at the top */}
            <Header />
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 relative">
                <div className="container mx-auto h-full">
                    <Outlet />
                </div>

                {/* Floating Action Button for Uploads */}
                <button
                    onClick={() => navigate('/uploads')}
                    className="fixed bottom-8 right-8 h-14 w-14 bg-brand-orange hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 z-50 group"
                    aria-label="Upload Documents"
                >
                    <Plus className="h-8 w-8 transition-transform group-hover:rotate-90" />
                </button>
            </div>
        </div>
    );
};

export default DashboardLayout;
