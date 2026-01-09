import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { formatDate } from '../utils';
import Avatar from './Avatar';

import { useNavigate } from 'react-router-dom';

const RitualCard = ({ ritual, onDelete }) => {
    const navigate = useNavigate();

    const getTypeInfo = (type) => {
        switch (type) {
            case 'planning': return { label: 'Planning', icon: 'planning', color: 'primary' };
            case 'review': return { label: 'Review', icon: 'review', color: 'accent' };
            case 'retro': return { label: 'Retrospective', icon: 'retro', color: 'success' };
            case 'daily': return { label: 'Daily', icon: 'daily', color: 'info' };
            case 'grooming': return { label: 'Grooming', icon: 'grooming', color: 'warning' };
            default: return { label: 'Toplantı', icon: 'other', color: 'primary' };
        }
    };

    const typeInfo = getTypeInfo(ritual.type);

    // SVG icons for rituals
    const Icons = {
        planning: <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM11 7h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" fill="currentColor" />,
        review: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />,
        retro: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" fill="currentColor" />,
        daily: <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor" />,
        other: <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor" />
    };

    return (
        <div className="ritual-card group relative">
            <div className={`ritual-icon ${typeInfo.icon}`}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                    {Icons[typeInfo.icon] || Icons.other}
                </svg>
            </div>

            <div className="ritual-content">
                <div className="flex justify-between items-start">
                    <div>
                        <span className={`badge badge-${typeInfo.color} mb-2`}>{typeInfo.label}</span>
                        <h3 className="ritual-title text-lg">{ritual.name}</h3>
                    </div>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(ritual._id)}
                            className="text-muted hover:text-danger-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Sil"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    )}
                </div>

                {ritual.description && (
                    <p className="text-muted mb-4">{ritual.description}</p>
                )}

                <div className="ritual-meta flex-wrap items-center">
                    <div className="flex items-center gap-1 mr-4">
                        <Calendar size={16} />
                        <span>{formatDate(ritual.date)}</span>
                    </div>
                    <div className="flex items-center gap-1 mr-auto">
                        <Clock size={16} />
                        <span>{ritual.duration} dk</span>
                    </div>

                    {ritual.type === 'retro' ? (
                        <button
                            onClick={() => navigate(`/retro/${ritual._id}`)}
                            className="btn btn-sm btn-accent py-1.5 px-3 mr-4 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 font-medium"
                        >
                            <span>🚀</span> Retro Başlat
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate(`/retro/${ritual._id}`)}
                            className="btn btn-sm btn-secondary py-1 px-3 mr-4 shadow-sm flex items-center gap-1.5"
                        >
                            <span>📝</span> Notlar
                        </button>
                    )}

                    {ritual.participants && ritual.participants.length > 0 && (
                        <div className="flex items-center gap-2 ml-auto">
                            <div className="avatar-group">
                                {ritual.participants.slice(0, 3).map((p) => (
                                    <Avatar key={p._id} name={p.name} color={p.color} size="sm" />
                                ))}
                                {ritual.participants.length > 3 && (
                                    <div className="avatar avatar-sm bg-bg-tertiary text-muted border-2 border-white">
                                        +{ritual.participants.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RitualCard;
