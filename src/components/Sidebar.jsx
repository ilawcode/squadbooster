import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Dashboard,
    FactCheck,
    CalendarToday,
    People,
    Logout,
    Menu,
    Close,
    RocketLaunch
} from '@mui/icons-material';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const navItems = [
        { icon: Dashboard, label: 'Dashboard', path: '/' },
        { icon: FactCheck, label: 'Aksiyonlar', path: '/actions' },
        { icon: CalendarToday, label: 'Ritüeller', path: '/rituals' },
        { icon: People, label: 'Takım', path: '/team' },
    ];

    return (
        <>
            <button
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-white/50 text-gray-600"
                onClick={toggleSidebar}
            >
                {isOpen ? <Close sx={{ fontSize: 24 }} /> : <Menu sx={{ fontSize: 24 }} />}
            </button>

            <div className={`
                fixed inset-y-0 left-0 z-40 w-72 sidebar-glass transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header */}
                <div className="h-20 flex items-center px-8 border-b border-indigo-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm">
                            <RocketLaunch sx={{ fontSize: 24 }} />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-gradient">SquadBooster</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-white shadow-md text-indigo-600 ring-1 ring-indigo-50 scale-[1.02]'
                                        : 'text-slate-500 hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm'}
                                `}
                            >
                                <Icon
                                    sx={{ fontSize: 20 }}
                                    className={`transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}
                                />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-indigo-50/50 bg-indigo-50/30">
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/50 border border-white/60 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
                            <p className="text-xs text-indigo-500 truncate font-medium">{user?.role || 'Üye'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                        <Logout sx={{ fontSize: 16 }} />
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
