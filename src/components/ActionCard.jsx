import React, { useState, useRef, useEffect } from 'react';
import {
    AccessTime,
    Delete,
    RadioButtonUnchecked,
    PlayCircleOutline,
    CheckCircle,
    Person
} from '@mui/icons-material';
import { getDueDateLabel } from '../utils';
import Avatar from './Avatar';

const ActionCard = ({ action, onStatusChange, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const dueDateInfo = getDueDateLabel(action.dueDate);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'high': return 'high';
            case 'medium': return 'medium';
            case 'low': return 'low';
            default: return '';
        }
    };

    const statusConfig = {
        'todo': { label: 'Yapılacak', icon: RadioButtonUnchecked, color: 'text-gray-500' },
        'in-progress': { label: 'Sürüyor', icon: PlayCircleOutline, color: 'text-primary' },
        'done': { label: 'Tamam', icon: CheckCircle, color: 'text-success' }
    };

    const currentStatus = statusConfig[action.status] || statusConfig['todo'];
    const StatusIcon = currentStatus.icon;

    return (
        <div className="action-card group">
            {/* Priority indicator */}
            <div className={`action-card-priority ${getPriorityClass(action.priority)}`} />

            <div className="action-card-content">
                {/* Header with badges */}
                <div className="action-card-header">
                    <div className="action-card-badges">
                        {action.ritual && (
                            <span className="badge badge-primary">
                                {action.ritual.name}
                            </span>
                        )}
                        <span className="badge badge-gray">
                            {action.priority}
                        </span>
                    </div>

                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Silmek istediğine emin misin?')) {
                                    onDelete(action._id);
                                }
                            }}
                            className="btn btn-ghost btn-sm opacity-0 group-hover-visible transition-all"
                            style={{ color: 'var(--danger)' }}
                        >
                            <Delete style={{ fontSize: 16 }} />
                        </button>
                    )}
                </div>

                {/* Title & Description */}
                <h4 className="action-card-title">{action.title}</h4>
                {action.description && (
                    <p className="action-card-desc">{action.description}</p>
                )}

                {/* Footer */}
                <div className="action-card-footer">
                    <div className="action-card-meta">
                        {action.assignee ? (
                            <Avatar name={action.assignee.name} color={action.assignee.color} size="sm" />
                        ) : (
                            <div className="avatar avatar-sm" style={{ background: 'var(--gray-200)', color: 'var(--gray-500)' }}>
                                <Person style={{ fontSize: 12 }} />
                            </div>
                        )}

                        <div className={`action-card-due ${dueDateInfo.isOverdue ? 'overdue' : ''}`}>
                            <AccessTime style={{ fontSize: 14 }} />
                            <span>{dueDateInfo.text}</span>
                        </div>
                    </div>

                    {/* Status dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                            className="btn btn-ghost btn-sm"
                            style={{ color: action.status === 'done' ? 'var(--success)' : action.status === 'in-progress' ? 'var(--primary)' : 'var(--gray-500)' }}
                        >
                            <StatusIcon style={{ fontSize: 16 }} />
                            <span>{currentStatus.label}</span>
                        </button>

                        {isMenuOpen && (
                            <div
                                className="absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-lg border animate-fade-in"
                                style={{ width: '140px', zIndex: 50, borderColor: 'var(--gray-200)' }}
                            >
                                {Object.entries(statusConfig).map(([key, config]) => {
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={key}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onStatusChange(action._id, key);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 p-3 text-sm font-medium transition-all cursor-pointer"
                                            style={{
                                                background: action.status === key ? 'var(--primary-50)' : 'transparent',
                                                color: action.status === key ? 'var(--primary)' : 'var(--gray-600)',
                                                borderBottom: '1px solid var(--gray-100)'
                                            }}
                                        >
                                            <Icon style={{ fontSize: 14 }} />
                                            {config.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionCard;
