import React from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Calendar, Settings } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-light-gray text-primary-dark font-sans flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
            {/* Top Header */}
            <header className="px-6 py-4 flex justify-between items-center bg-white shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-blue flex items-center justify-center">
                        <span className="text-xs font-heading font-bold text-white">LL</span>
                    </div>
                    <h1 className="text-lg font-heading font-bold tracking-tight">Logic Looper</h1>
                </div>
                <div className="flex gap-4">
                    <button className="text-dark-gray hover:text-primary-blue transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-4 pb-24 relative">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="h-full"
                >
                    {children}
                </motion.div>
            </main>

            {/* Bottom Navigation */}
            <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 pb-safe z-20">
                <ul className="flex justify-between items-center">
                    <li>
                        <button className="flex flex-col items-center gap-1 text-primary-blue">
                            <Calendar size={24} />
                            <span className="text-[10px] font-semibold">Today</span>
                        </button>
                    </li>
                    <li>
                        <button className="flex flex-col items-center gap-1 text-dark-gray hover:text-primary-blue transition-colors">
                            <Activity size={24} />
                            <span className="text-[10px] font-medium">Stats</span>
                        </button>
                    </li>
                    <li>
                        <button className="flex flex-col items-center gap-1 text-dark-gray hover:text-primary-blue transition-colors">
                            <User size={24} />
                            <span className="text-[10px] font-medium">Profile</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};
