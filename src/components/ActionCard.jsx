import React, { useState, useEffect, useRef } from 'react';
import { Calendar, CheckCircle2, AlertCircle, Clock, Trash2, ChevronDown, Circle, ArrowRightCircle, PlayCircle } from 'lucide-react';
import { getDueDateLabel } from '../utils';
import Avatar from './Avatar';

const ActionCard = ({ action, onStatusChange, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const dueDateInfo = getDueDateLabel(action.dueDate);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-danger-700 bg-danger-50 border-danger-200';
            case 'medium': return 'text-warning-700 bg-warning-50 border-warning-200';
            case 'low': return 'text-success-700 bg-success-50 border-success-200';
            default: return 'text-secondary bg-gray-50 border-gray-200';
        }
    };

    const statusConfig = {
        'todo': { label: 'Yapılacak', color: 'bg-gray-100 text-gray-600', icon: Circle, border: 'border-gray-200' },
        'in-progress': { label: 'Sürüyor', color: 'bg-blue-50 text-blue-600', icon: PlayCircle, border: 'border-blue-200' },
        'done': { label: 'Tamamlandı', color: 'bg-success-50 text-success-600', icon: CheckCircle2, border: 'border-success-200' }
    };

    const currentStatus = statusConfig[action.status] || statusConfig['todo'];
    const StatusIcon = currentStatus.icon;

    const handleStatusSelect = (status) => {
        onStatusChange(action._id, status);
        setIsMenuOpen(false);
    };

    return (
        <div className="group relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            {/* Header: Priority & Delete */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityColor(action.priority)} font-bold uppercase tracking-wider`}>
                        {action.priority === 'high' ? 'Yüksek' : action.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                    {action.ritual && (
                        <span className="text-[10px] text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full truncate max-w-[120px] border border-primary-100" title={action.ritual.name}>
                            {action.ritual.name}
                        </span>
                    )}
                </div>

                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Bu aksiyonu silmek istediğine emin misin?')) onDelete(action._id);
                        }}
                        className="text-gray-300 hover:text-danger-600 hover:bg-danger-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform hover:scale-105"
                        title="Aksiyonu Sil"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {/* Title & Desc */}
            <h4 className="font-bold text-gray-800 text-base leading-snug mb-2">{action.title}</h4>
            {action.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{action.description}</p>
            )}

            {/* Footer: User, Date, Status Dropdown */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-3">
                    {action.assignee ? (
                        <div className="flex items-center gap-2" title={action.assignee.name}>
                            <Avatar name={action.assignee.name} color={action.assignee.color} size="sm" />
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">?</div>
                    )}

                    <div className={`flex items-center gap-1.5 text-xs font-medium ${dueDateInfo.color} px-2 py-1 rounded bg-opacity-10`}>
                        <Clock size={14} />
                        <span>{dueDateInfo.text}</span>
                    </div>
                </div>

                {/* Custom Status Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className={`flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${currentStatus.color} ${currentStatus.border} hover:opacity-80 active:scale-95`}
                    >
                        <StatusIcon size={14} />
                        <span>{currentStatus.label}</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 bottom-full mb-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-scaleIn origin-bottom-right">
                            <div className="p-1">
                                {Object.entries(statusConfig).map(([key, config]) => {
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={key}
                                            onClick={(e) => { e.stopPropagation(); handleStatusSelect(key); }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${action.status === key ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <Icon size={14} className={action.status === key ? 'text-primary-600' : 'text-gray-400'} />
                                            {config.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionCard;
