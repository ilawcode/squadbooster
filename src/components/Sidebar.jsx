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
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600"
                onClick={toggleSidebar}
            >
                {isOpen ? <Close sx={{ fontSize: 24 }} /> : <Menu sx={{ fontSize: 24 }} />}
            </button>

            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <RocketLaunch sx={{ fontSize: 24 }} />
                        <span className="font-bold text-lg tracking-tight text-gray-900">SquadBooster</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                `}
                            >
                                <Icon sx={{ fontSize: 20 }} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold border border-indigo-200">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role || 'Üye'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
