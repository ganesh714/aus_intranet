import React from 'react';
import { User, Key, LogOut, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import headerLogo from '../assets/header-logo.png';

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
            {/* Logo Section */}
            <div className="flex items-center">
                <img src={headerLogo} alt="Aditya University Logo" className="h-16 w-auto object-contain" />
            </div>

            {/* User & Actions Section */}
            <div className="flex items-center gap-4">
                {/* Send Announcements Button - Added based on request */}
                <button
                    onClick={() => navigate('/announcements')}
                    className="flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-sm mr-2"
                >
                    <Megaphone className="h-4 w-4" />
                    <span className="hidden sm:inline">Send Announcements</span>
                </button>

                <div className="hidden md:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <div className="h-8 w-8 rounded-full bg-brand-blue flex items-center justify-center text-white">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-brand-blue">pavan</span>
                        <span className="text-xs text-slate-500">pavan@adityauniversity.in</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-sm">
                        <Key className="h-4 w-4" />
                        <span className="hidden sm:inline">CHANGE PASSWORD</span>
                    </button>
                    <button className="flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-sm">
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">LOGOUT</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
