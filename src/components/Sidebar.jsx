import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const navItems = [
        { icon: <Dashboard sx={{ fontSize: 20 }} />, label: 'Dashboard', path: '/' },
        { icon: <FactCheck sx={{ fontSize: 20 }} />, label: 'Aksiyonlar', path: '/actions' },
        { icon: <CalendarToday sx={{ fontSize: 20 }} />, label: 'Ritüeller', path: '/rituals' },
        { icon: <People sx={{ fontSize: 20 }} />, label: 'Takım', path: '/team' },
    ];

    const currentPath = window.location.pathname;

    return (
        <>
            <button
                className="btn btn-icon btn-ghost md:hidden fixed top-4 right-4 z-50"
                onClick={toggleSidebar}
            >
                {isOpen ? <Close sx={{ fontSize: 24 }} /> : <Menu sx={{ fontSize: 24 }} />}
            </button>

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-glow">
                            <RocketLaunch sx={{ fontSize: 24 }} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600">
                                SquadBooster
                            </h3>
                            <p className="text-xs text-muted">Takımını Ateşle! 🚀</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <div
                            key={item.path}
                            className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <span className="nav-item-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="flex items-center gap-3 mb-4 p-3 bg-bg-tertiary rounded-lg">
                        <div
                            className="avatar"
                            style={{ backgroundColor: user?.color || 'var(--primary-500)' }}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-muted truncate">{user?.role || 'Üye'}</p>
                        </div>
                    </div>
                    <button
                        className="btn btn-ghost w-full justify-start text-danger-500 hover:text-danger-600 hover:bg-danger-50"
                        onClick={handleLogout}
                    >
                        <Logout sx={{ fontSize: 18 }} />
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
