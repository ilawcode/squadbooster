import React, { useState, useEffect, useRef } from 'react';
import {
    CalendarToday,
    CheckCircle,
    AccessTime,
    Delete,
    KeyboardArrowDown,
    RadioButtonUnchecked,
    PlayCircleFilled,
    Person,
    Label
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

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'high': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-l-rose-500', badge: 'bg-rose-100' };
            case 'medium': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-l-amber-500', badge: 'bg-amber-100' };
            case 'low': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-l-emerald-500', badge: 'bg-emerald-100' };
            default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-l-slate-300', badge: 'bg-slate-100' };
        }
    };

    const statusConfig = {
        'todo': { label: 'Yapılacak', color: 'text-slate-600 bg-slate-100', hover: 'hover:bg-slate-200', icon: RadioButtonUnchecked },
        'in-progress': { label: 'Sürüyor', color: 'text-blue-600 bg-blue-100', hover: 'hover:bg-blue-200', icon: PlayCircleFilled },
        'done': { label: 'Tamamlandı', color: 'text-emerald-600 bg-emerald-100', hover: 'hover:bg-emerald-200', icon: CheckCircle }
    };

    const currentStatus = statusConfig[action.status] || statusConfig['todo'];
    const StatusIcon = currentStatus.icon;
    const priorityStyle = getPriorityStyle(action.priority);

    const handleStatusSelect = (status) => {
        onStatusChange(action._id, status);
        setIsMenuOpen(false);
    };

    return (
        <div className={`group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border-l-[6px] ${priorityStyle.border} border-t border-r border-b border-gray-100 hover:-translate-y-1`}>

            {/* Top Row: Chips & Delete */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${priorityStyle.badge} ${priorityStyle.color}`}>
                        {action.priority === 'high' ? 'Yüksek Öncelik' : action.priority === 'medium' ? 'Orta Öncelik' : 'Düşük Öncelik'}
                    </span>
                    {action.ritual && (
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-600 truncate max-w-[120px]">
                            #{action.ritual.name}
                        </span>
                    )}
                </div>

                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Bu aksiyonu silmek istediğine emin misin?')) onDelete(action._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                        title="Aksiyonu Sil"
                    >
                        <Delete sx={{ fontSize: 20 }} />
                    </button>
                )}
            </div>

            {/* Content */}
            <h4 className="font-bold text-gray-800 text-lg mb-2 leading-snug">{action.title}</h4>
            {action.description && (
                <p className="text-sm text-gray-500 mb-5 line-clamp-2">{action.description}</p>
            )}

            {/* Bottom Row: Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-3">
                    {action.assignee ? (
                        <div className="ring-2 ring-white rounded-full shadow-sm">
                            <Avatar name={action.assignee.name} color={action.assignee.color} size="sm" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                            <Person sx={{ fontSize: 16 }} />
                        </div>
                    )}

                    <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg ${dueDateInfo.color} bg-opacity-10`}>
                        <AccessTime sx={{ fontSize: 16 }} />
                        <span>{dueDateInfo.text}</span>
                    </div>
                </div>

                {/* Status Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onMouseDown={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className={`flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${currentStatus.color} ${currentStatus.hover}`}
                    >
                        <StatusIcon sx={{ fontSize: 18 }} />
                        <span>{currentStatus.label}</span>
                        <KeyboardArrowDown sx={{ fontSize: 16 }} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scaleIn origin-bottom-right p-1.5">
                            {Object.entries(statusConfig).map(([key, config]) => {
                                const Icon = config.icon;
                                const isSelected = action.status === key;
                                return (
                                    <button
                                        key={key}
                                        onMouseDown={(e) => { e.stopPropagation(); handleStatusSelect(key); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-all mb-1 last:mb-0
                                            ${isSelected ? config.color : 'text-gray-500 hover:bg-gray-50'}
                                        `}
                                    >
                                        <Icon sx={{ fontSize: 18 }} className={isSelected ? 'text-current' : 'text-gray-400'} />
                                        {config.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionCard;
