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
    Notes
} from '@mui/icons-material';
import { formatDate } from '../utils';
import Avatar from './Avatar';
import { useNavigate } from 'react-router-dom';

const RitualCard = ({ ritual, onDelete }) => {
    const navigate = useNavigate();

    const getTypeInfo = (type) => {
        switch (type) {
            case 'planning': return { label: 'Planning', icon: EventNote, color: 'primary' };
            case 'review': return { label: 'Review', icon: RateReview, color: 'accent' };
            case 'retro': return { label: 'Retrospective', icon: RocketLaunch, color: 'success' };
            case 'daily': return { label: 'Daily', icon: Today, color: 'info' };
            case 'grooming': return { label: 'Grooming', icon: ContentCut, color: 'warning' };
            default: return { label: 'Toplantı', icon: MeetingRoom, color: 'primary' };
        }
    };

    const typeInfo = getTypeInfo(ritual.type);
    const RitualIcon = typeInfo.icon;

    return (
        <div className="ritual-card group relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-5">
            <div className="flex gap-4">
                {/* Icon Box */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-${typeInfo.color}-50 text-${typeInfo.color}-600`}>
                    <RitualIcon sx={{ fontSize: 24 }} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-1 bg-${typeInfo.color}-50 text-${typeInfo.color}-700 border border-${typeInfo.color}-100`}>
                                {typeInfo.label}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 truncate" title={ritual.name}>{ritual.name}</h3>
                        </div>
                        {onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(ritual._id); }}
                                className="text-gray-300 hover:text-danger-600 hover:bg-danger-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Sil"
                            >
                                <Delete sx={{ fontSize: 18 }} />
                            </button>
                        )}
                    </div>

                    {ritual.description && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ritual.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <CalendarToday sx={{ fontSize: 16 }} />
                            <span>{formatDate(ritual.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <AccessTime sx={{ fontSize: 16 }} />
                            <span>{ritual.duration} dk</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                        <div className="flex -space-x-2 overflow-hidden">
                            {ritual.participants && ritual.participants.slice(0, 4).map((p) => (
                                <div key={p._id} className="inline-block ring-2 ring-white rounded-full">
                                    <Avatar name={p.name} color={p.color} size="sm" />
                                </div>
                            ))}
                            {ritual.participants && ritual.participants.length > 4 && (
                                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                                    +{ritual.participants.length - 4}
                                </div>
                            )}
                        </div>

                        {ritual.type === 'retro' ? (
                            <button
                                onClick={() => navigate(`/retro/${ritual._id}`)}
                                className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3.5 rounded-lg shadow-sm hover:shadow flex items-center gap-1.5 font-medium transition-all"
                            >
                                <RocketLaunch sx={{ fontSize: 16 }} />
                                <span>Başlat</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(`/retro/${ritual._id}`)}
                                className="btn btn-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 font-medium transition-all"
                            >
                                <Notes sx={{ fontSize: 16 }} />
                                <span>Notlar</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RitualCard;
