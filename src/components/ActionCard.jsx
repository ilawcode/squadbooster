import React, { useState, useRef, useEffect } from 'react';
import {
    CalendarToday,
    CheckCircle,
    AccessTime,
    Delete,
    MoreHoriz,
    RadioButtonUnchecked,
    PlayCircleOutline,
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
            if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-rose-500';
            case 'medium': return 'bg-amber-500';
            case 'low': return 'bg-emerald-500';
            default: return 'bg-gray-300';
        }
    };

    const statusConfig = {
        'todo': { label: 'Yapılacak', icon: RadioButtonUnchecked, color: 'text-gray-500' },
        'in-progress': { label: 'Sürüyor', icon: PlayCircleOutline, color: 'text-blue-600' },
        'done': { label: 'Tamam', icon: CheckCircle, color: 'text-emerald-600' }
    };

    const currentStatus = statusConfig[action.status] || statusConfig['todo'];
    const StatusIcon = currentStatus.icon;

    return (
        <div className="card-modern relative flex flex-col p-4 h-full bg-white group">
            {/* Priority Indicator Line */}
            <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-md ${getPriorityColor(action.priority)}`} />

            <div className="pl-3 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-2">
                        {action.ritual && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {action.ritual.name}
                            </span>
                        )}
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {action.priority}
                        </span>
                    </div>

                    {/* Ghost Delete Button */}
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Emin misin?')) onDelete(action._id);
                            }}
                            className="text-gray-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Delete sx={{ fontSize: 18 }} />
                        </button>
                    )}
                </div>

                {/* Title & Desc */}
                <h3 className="font-semibold text-gray-900 leading-tight mb-1">{action.title}</h3>
                {action.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{action.description}</p>
                )}

                {/* Footer Controls */}
                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {action.assignee ? (
                            <Avatar name={action.assignee.name} color={action.assignee.color} size="sm" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <Person sx={{ fontSize: 14 }} />
                            </div>
                        )}

                        <div className={`flex items-center gap-1 text-xs font-medium ${dueDateInfo.color}`}>
                            <AccessTime sx={{ fontSize: 14 }} />
                            <span>{dueDateInfo.text}</span>
                        </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold transition-colors hover:bg-gray-50 ${currentStatus.color}`}
                        >
                            <StatusIcon sx={{ fontSize: 16 }} />
                            <span>{currentStatus.label}</span>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 bottom-full mb-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
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
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors
                                                ${action.status === key ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}
                                            `}
                                        >
                                            <Icon sx={{ fontSize: 14 }} />
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
