import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { getDueDateLabel } from '../utils';
import Avatar from './Avatar';

const ActionCard = ({ action, onStatusChange, onDelete }) => {
    const dueDateInfo = getDueDateLabel(action.dueDate);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-danger-600 bg-danger-50 border-danger-100';
            case 'medium': return 'text-warning-600 bg-warning-50 border-warning-100';
            case 'low': return 'text-success-600 bg-success-50 border-success-100';
            default: return 'text-secondary bg-bg-tertiary border-border-light';
        }
    };

    return (
        <div className="task-card group">
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(action.priority)} font-medium uppercase tracking-wider`}>
                    {action.priority === 'high' ? 'Yüksek' : action.priority === 'medium' ? 'Orta' : 'Düşük'}
                </span>
                {action.ritual && (
                    <span className="text-[10px] text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full truncate max-w-[100px]" title={action.ritual.name}>
                        {action.ritual.name}
                    </span>
                )}
            </div>

            <h4 className="task-card-title">{action.title}</h4>

            {action.description && (
                <p className="text-sm text-muted mb-3 line-clamp-2">{action.description}</p>
            )}

            <div className="task-card-meta mt-3">
                <div className={`task-card-due ${dueDateInfo.color}`}>
                    <Clock size={14} />
                    <span>{dueDateInfo.text}</span>
                </div>

                {action.assignee ? (
                    <Avatar name={action.assignee.name} color={action.assignee.color} size="sm" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-border-light border-2 border-dashed border-border-medium flex items-center justify-center text-muted">
                        ?
                    </div>
                )}
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-border-light opacity-0 group-hover:opacity-100 transition-opacity">
                <select
                    className="text-xs border rounded px-2 py-1 bg-white"
                    value={action.status}
                    onChange={(e) => onStatusChange(action._id, e.target.value)}
                >
                    <option value="todo">Yapılacak</option>
                    <option value="in-progress">Devam Ediyor</option>
                    <option value="done">Tamamlandı</option>
                </select>
                <button
                    onClick={() => onDelete(action._id)}
                    className="text-xs text-danger-500 hover:bg-danger-50 px-2 py-1 rounded ml-auto"
                >
                    Sil
                </button>
            </div>
        </div>
    );
};

export default ActionCard;
