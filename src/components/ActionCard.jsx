import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Clock, Trash2, MoreHorizontal } from 'lucide-react';
import { getDueDateLabel } from '../utils';
import Avatar from './Avatar';

const ActionCard = ({ action, onStatusChange, onDelete }) => {
    const dueDateInfo = getDueDateLabel(action.dueDate);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-danger-700 bg-danger-50 border-danger-200';
            case 'medium': return 'text-warning-700 bg-warning-50 border-warning-200';
            case 'low': return 'text-success-700 bg-success-50 border-success-200';
            default: return 'text-secondary bg-gray-50 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'done': return 'bg-success-100 text-success-700 border-success-200';
            case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'done': return 'Tamamlandı';
            case 'in-progress': return 'Sürüyor';
            default: return 'Yapılacak';
        }
    };

    return (
        <div className="task-card group relative hover:shadow-md transition-all duration-200 border border-border-light bg-white rounded-xl p-4">
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
                        className="text-gray-400 hover:text-danger-500 hover:bg-danger-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Aksiyonu Sil"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <h4 className="font-bold text-text-primary text-base leading-snug mb-2">{action.title}</h4>

            {action.description && (
                <p className="text-sm text-muted mb-4 line-clamp-2 leading-relaxed">{action.description}</p>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-3">
                    {action.assignee ? (
                        <div className="flex items-center gap-2" title={action.assignee.name}>
                            <Avatar name={action.assignee.name} color={action.assignee.color} size="sm" />
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">?</div>
                    )}

                    <div className={`flex items-center gap-1.5 text-xs font-medium ${dueDateInfo.color} px-2 py-1 rounded bg-opacity-10`}>
                        <Clock size={14} />
                        <span>{dueDateInfo.text}</span>
                    </div>
                </div>

                <div className="relative">
                    <select
                        className={`appearance-none text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all pr-8 ${getStatusColor(action.status)}`}
                        value={action.status}
                        onChange={(e) => onStatusChange(action._id, e.target.value)}
                    >
                        <option value="todo">Yapılacak</option>
                        <option value="in-progress">Sürüyor</option>
                        <option value="done">Tamamlandı</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionCard;
