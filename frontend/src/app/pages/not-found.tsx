import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';
import { useTheme } from '../components/theme-provider';

const NotFoundPage: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`flex h-screen w-full items-center justify-center px-4 font-['Inter'] transition-colors duration-300 overflow-hidden ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'
            }`}>
            <div className="relative w-full max-w-lg text-center">
                {/* Background Glows */}
                <div className={`absolute -top-24 -left-24 h-80 w-80 rounded-full blur-[120px] pointer-events-none animate-pulse ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/20'
                    }`}></div>
                <div className={`absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700 ${isDark ? 'bg-purple-500/10' : 'bg-purple-500/20'
                    }`}></div>

                <div className="relative space-y-8 animate-in fade-in zoom-in duration-500">
                    {/* Error Icon/Code */}
                    <div className="relative inline-block">
                        <div className={`text-9xl font-black tracking-tighter text-transparent bg-clip-text select-none ${isDark ? 'bg-gradient-to-b from-white/20 to-white/5' : 'bg-gradient-to-b from-black/10 to-black/5'
                            }`}>
                            404
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 rotate-12">
                                <AlertCircle className="h-10 w-10 text-white -rotate-12" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Lost in Space?</h1>
                        <p className={`mx-auto max-w-md text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            The page you're looking for has vanished into another dimension. Let's get you back to reality.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            to="/"
                            className={`group flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all active:scale-95 ${isDark
                                    ? 'bg-white text-black hover:bg-gray-200'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                }`}
                        >
                            <Home className="h-4 w-4" />
                            Return Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className={`group flex items-center justify-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-semibold transition-all active:scale-95 ${isDark
                                    ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                                }`}
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Go Back
                        </button>
                    </div>
                </div>

                {/* Decorative particles */}
                <div className={`absolute top-0 left-1/4 h-1 w-1 rounded-full animate-ping ${isDark ? 'bg-white/20' : 'bg-indigo-500/20'
                    }`}></div>
                <div className={`absolute bottom-1/4 right-0 h-1.5 w-1.5 rounded-full animate-bounce [animation-duration:3s] ${isDark ? 'bg-indigo-500/40' : 'bg-indigo-500/30'
                    }`}></div>
            </div>
        </div>
    );
};

export default NotFoundPage;
