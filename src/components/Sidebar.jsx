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
            {/* Mobile Menu Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <Close /> : <Menu />}
            </button>

            {/* Backdrop */}
            <div
                className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">
                            <RocketLaunch style={{ fontSize: 20 }} />
                        </div>
                        <span className="sidebar-logo-text">SquadBooster</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon style={{ fontSize: 20 }} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-role">{user?.role || 'Team Member'}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="sidebar-logout"
                    >
                        <Logout style={{ fontSize: 16 }} />
                        Çıkış Yap
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
