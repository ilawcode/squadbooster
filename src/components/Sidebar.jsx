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

            <div className={`sidebar-glass ${isOpen ? 'translate-x-0' : ''}`}>
                {/* Header */}
                <div className="sidebar-header-modern">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                            <RocketLaunch sx={{ fontSize: 24 }} />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-gradient">SquadBooster</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav-modern no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`nav-item-modern ${isActive ? 'active' : ''}`}
                            >
                                <Icon
                                    sx={{ fontSize: 20 }}
                                    className={`transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                                    style={{ color: isActive ? 'var(--primary-600)' : 'var(--text-tertiary)' }}
                                />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer-modern">
                    <div className="user-profile-modern">
                        <div className="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-md" style={{ background: 'var(--gradient-primary)' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0" style={{ overflow: 'hidden' }}>
                            <p className="text-sm font-bold text-gray-800 truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                            <p className="text-xs text-indigo-500 truncate font-medium" style={{ color: 'var(--primary-500)' }}>{user?.role || 'Üye'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
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
