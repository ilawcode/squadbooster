import React from 'react';
import {
    CalendarToday,
    AccessTime,
    Delete,
    EventNote,
    RateReview,
    RocketLaunch,
    Today,
    ContentCut,
    MeetingRoom,
    ArrowForward
} from '@mui/icons-material';
import { formatDate } from '../utils';
import Avatar from './Avatar';
import { useNavigate } from 'react-router-dom';

const RitualCard = ({ ritual, onDelete }) => {
    const navigate = useNavigate();

    const getTheme = (type) => {
        switch (type) {
            case 'planning': return { icon: EventNote, color: 'text-indigo-600', bg: 'bg-indigo-50' };
            case 'review': return { icon: RateReview, color: 'text-amber-600', bg: 'bg-amber-50' };
            case 'retro': return { icon: RocketLaunch, color: 'text-rose-600', bg: 'bg-rose-50' };
            case 'daily': return { icon: Today, color: 'text-sky-600', bg: 'bg-sky-50' };
            case 'grooming': return { icon: ContentCut, color: 'text-teal-600', bg: 'bg-teal-50' };
            default: return { icon: MeetingRoom, color: 'text-slate-600', bg: 'bg-slate-50' };
        }
    };

    const theme = getTheme(ritual.type);
    const Icon = theme.icon;

    return (
        <div className="card-modern p-5 flex flex-col h-full bg-white group">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.bg} ${theme.color}`}>
                    <Icon sx={{ fontSize: 20 }} />
                </div>
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(ritual._id); }}
                        className="text-gray-300 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Delete sx={{ fontSize: 18 }} />
                    </button>
                )}
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{ritual.name}</h3>
                {ritual.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{ritual.description}</p>
                )}
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-6">
                <div className="flex items-center gap-1.5">
                    <CalendarToday sx={{ fontSize: 14 }} />
                    <span>{formatDate(ritual.date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <AccessTime sx={{ fontSize: 14 }} />
                    <span>{ritual.duration} dk</span>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {ritual.participants && ritual.participants.slice(0, 3).map((p) => (
                        <div key={p._id} className="ring-2 ring-white rounded-full">
                            <Avatar name={p.name} color={p.color} size="sm" />
                        </div>
                    ))}
                    {ritual.participants && ritual.participants.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-50 border border-white flex items-center justify-center text-xs font-medium text-gray-500">
                            +{ritual.participants.length - 3}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigate(`/retro/${ritual._id}`)}
                    className="btn-modern btn-secondary-modern text-xs"
                >
                    {ritual.type === 'retro' ? 'Başlat' : 'Detay'}
                    <ArrowForward sx={{ fontSize: 14 }} />
                </button>
            </div>
        </div>
    );
};

export default RitualCard;
