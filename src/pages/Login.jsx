import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';


const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Validate credentials here (mock)
        navigate('/dashboard');
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-brand-blue relative items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 max-w-lg text-center">
                    <div className="mx-auto mb-8 h-24 w-24 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        {/* Placeholder for Logo */}
                        <span className="text-4xl font-bold">A</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Aditya University</h1>
                    <p className="text-lg text-blue-200">Welcome to the Faculty Portal. Manage your profile, announcements, and uploads in one place.</p>
                </div>
                {/* Decorative Circles */}
                <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-brand-orange/20 blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <Card className="w-full max-w-md shadow-none border-none bg-transparent">
                    <CardHeader className="text-center pb-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden mx-auto mb-4 h-16 w-16 rounded-full bg-brand-blue text-white flex items-center justify-center">
                            <span className="text-2xl font-bold">A</span>
                        </div>
                        <CardTitle className="text-3xl font-bold text-slate-900">Sign In</CardTitle>
                        <p className="text-slate-500 mt-2">Enter your employee credentials to continue</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Employee ID / Email</label>
                                <Input type="text" placeholder="e.g. FAC12345" className="h-11" required />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <a href="#" className="text-sm font-medium text-brand-orange hover:text-orange-700 hover:underline">Forgot password?</a>
                                </div>
                                <Input type="password" placeholder="••••••••" className="h-11" required />
                            </div>
                            <Button type="submit" className="w-full h-11 bg-brand-orange hover:bg-orange-600 text-white font-bold" size="lg">
                                Sign In
                            </Button>
                        </form>
                        <div className="mt-8 text-center text-xs text-slate-400">
                            &copy; 2025 Aditya University. All rights reserved.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;
