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
    Notes,
    ArrowForward
} from '@mui/icons-material';
import { formatDate } from '../utils';
import Avatar from './Avatar';
import { useNavigate } from 'react-router-dom';

const RitualCard = ({ ritual, onDelete }) => {
    const navigate = useNavigate();

    const getTypeStyle = (type) => {
        switch (type) {
            case 'planning': return {
                label: 'Planning',
                icon: EventNote,
                theme: 'indigo',
                bg: 'bg-indigo-50',
                text: 'text-indigo-600',
                border: 'border-l-indigo-500',
                iconBg: 'bg-indigo-100',
                btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            };
            case 'review': return {
                label: 'Review',
                icon: RateReview,
                theme: 'amber',
                bg: 'bg-amber-50',
                text: 'text-amber-600',
                border: 'border-l-amber-500',
                iconBg: 'bg-amber-100',
                btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
            };
            case 'retro': return {
                label: 'Retrospective',
                icon: RocketLaunch,
                theme: 'rose',
                bg: 'bg-rose-50',
                text: 'text-rose-600',
                border: 'border-l-rose-500',
                iconBg: 'bg-rose-100',
                btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
            };
            case 'daily': return {
                label: 'Daily',
                icon: Today,
                theme: 'sky',
                bg: 'bg-sky-50',
                text: 'text-sky-600',
                border: 'border-l-sky-500',
                iconBg: 'bg-sky-100',
                btn: 'bg-sky-600 hover:bg-sky-700 shadow-sky-200'
            };
            case 'grooming': return {
                label: 'Grooming',
                icon: ContentCut,
                theme: 'teal',
                bg: 'bg-teal-50',
                text: 'text-teal-600',
                border: 'border-l-teal-500',
                iconBg: 'bg-teal-100',
                btn: 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'
            };
            default: return {
                label: 'Toplantı',
                icon: MeetingRoom,
                theme: 'slate',
                bg: 'bg-slate-50',
                text: 'text-slate-600',
                border: 'border-l-slate-400',
                iconBg: 'bg-slate-100',
                btn: 'bg-slate-700 hover:bg-slate-800 shadow-slate-200'
            };
        }
    };

    const style = getTypeStyle(ritual.type);
    const RitualIcon = style.icon;

    return (
        <div className={`group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-${style.theme}-100/50 transition-all duration-300 border border-gray-100 hover:-translate-y-1 overflow-hidden`}>

            {/* Background Decor */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${style.bg} rounded-bl-full opacity-50 -mr-10 -mt-10 transition-transform group-hover:scale-110`} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${style.iconBg} ${style.text} flex items-center justify-center shadow-inner`}>
                        <RitualIcon sx={{ fontSize: 28 }} />
                    </div>
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(ritual._id); }}
                            className="text-gray-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Delete sx={{ fontSize: 20 }} />
                        </button>
                    )}
                </div>

                <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${style.bg} ${style.text}`}>
                        {style.label}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{ritual.name}</h3>
                </div>

                {ritual.description && (
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">{ritual.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-6 uppercase tracking-wide">
                    <div className="flex items-center gap-1.5">
                        <CalendarToday sx={{ fontSize: 16 }} />
                        <span>{formatDate(ritual.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <AccessTime sx={{ fontSize: 16 }} />
                        <span>{ritual.duration} dk</span>
                    </div>
                </div>

                <div className="flex items-end justify-between border-t border-gray-50 pt-5">
                    <div className="flex -space-x-3">
                        {ritual.participants && ritual.participants.slice(0, 4).map((p) => (
                            <div key={p._id} className="ring-4 ring-white rounded-full">
                                <Avatar name={p.name} color={p.color} size="md" />
                            </div>
                        ))}
                        {ritual.participants && ritual.participants.length > 4 && (
                            <div className="w-10 h-10 rounded-full bg-gray-50 ring-4 ring-white flex items-center justify-center text-xs font-bold text-gray-500">
                                +{ritual.participants.length - 4}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate(`/retro/${ritual._id}`)}
                        className={`btn btn-sm ${style.btn} text-white py-2.5 px-5 rounded-xl shadow-lg flex items-center gap-2 font-bold transform active:scale-95 transition-all`}
                    >
                        {ritual.type === 'retro' ? 'Başlat' : 'Detaylar'}
                        <ArrowForward sx={{ fontSize: 18 }} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RitualCard;
