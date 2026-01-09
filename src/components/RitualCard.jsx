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

    const getIconAndClass = (type) => {
        switch (type) {
            case 'planning': return { icon: EventNote, className: 'planning' };
            case 'review': return { icon: RateReview, className: 'review' };
            case 'retro': return { icon: RocketLaunch, className: 'retro' };
            case 'daily': return { icon: Today, className: 'daily' };
            case 'grooming': return { icon: ContentCut, className: 'grooming' };
            default: return { icon: MeetingRoom, className: 'default' };
        }
    };

    const { icon: Icon, className: iconClass } = getIconAndClass(ritual.type);

    return (
        <div className="ritual-card group">
            {/* Header */}
            <div className="ritual-card-header">
                <div className={`ritual-card-icon ${iconClass}`}>
                    <Icon style={{ fontSize: 22 }} />
                </div>
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(ritual._id); }}
                        className="btn btn-ghost btn-sm opacity-0 group-hover-visible"
                        style={{ color: 'var(--danger)' }}
                    >
                        <Delete style={{ fontSize: 16 }} />
                    </button>
                )}
            </div>

            {/* Content */}
            <h3 className="ritual-card-title">{ritual.name}</h3>
            {ritual.description && (
                <p className="ritual-card-desc">{ritual.description}</p>
            )}

            {/* Meta */}
            <div className="ritual-card-meta">
                <div className="ritual-card-meta-item">
                    <CalendarToday style={{ fontSize: 14 }} />
                    <span>{formatDate(ritual.date)}</span>
                </div>
                <div className="ritual-card-meta-item">
                    <AccessTime style={{ fontSize: 14 }} />
                    <span>{ritual.duration} dk</span>
                </div>
            </div>

            {/* Footer */}
            <div className="ritual-card-footer">
                <div className="ritual-card-participants">
                    {ritual.participants && ritual.participants.slice(0, 3).map((p) => (
                        <Avatar key={p._id} name={p.name} color={p.color} size="sm" />
                    ))}
                    {ritual.participants && ritual.participants.length > 3 && (
                        <div
                            className="avatar avatar-sm"
                            style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}
                        >
                            +{ritual.participants.length - 3}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigate(`/retro/${ritual._id}`)}
                    className="btn btn-secondary btn-sm"
                >
                    {ritual.type === 'retro' ? 'Başlat' : 'Detay'}
                    <ArrowForward style={{ fontSize: 14 }} />
                </button>
            </div>
        </div>
    );
};

export default RitualCard;
