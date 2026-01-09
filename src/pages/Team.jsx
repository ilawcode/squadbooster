import React, { useState, useEffect } from 'react';
import { api } from '../utils';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import { Add, Close, People, Email, Badge, CalendarMonth } from '@mui/icons-material';

const Team = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: 'Team Member'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await api.get('/members');
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            const newMember = await api.post('/members', {
                ...formData,
                color: randomColor
            });
            setMembers([...members, newMember]);
            setShowModal(false);
            setFormData({ name: '', role: 'Team Member' });
        } catch (error) {
            console.error('Invite error:', error);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Product Owner': return { bg: 'var(--warning-light)', color: 'var(--warning)' };
            case 'Scrum Master': return { bg: 'var(--primary-100)', color: 'var(--primary)' };
            case 'Tech Lead': return { bg: 'var(--danger-light)', color: 'var(--danger)' };
            case 'Designer': return { bg: '#fae8ff', color: '#a855f7' };
            default: return { bg: 'var(--gray-100)', color: 'var(--gray-600)' };
        }
    };

    return (
        <Layout>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <People style={{ fontSize: 32, color: 'var(--primary)' }} />
                        Takım Üyeleri
                    </h1>
                    <p className="page-subtitle">Squad'ını güçlendiren kahramanlar.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Add style={{ fontSize: 20 }} />
                    <span>Üye Ekle</span>
                </button>
            </div>

            {/* Team Grid - 3 Columns */}
            <div className="team-grid">
                {members.map(member => {
                    const roleStyle = getRoleBadgeColor(member.role);
                    return (
                        <div key={member._id} className="team-card">
                            <div className="team-card-avatar">
                                <div
                                    className="avatar avatar-lg"
                                    style={{ background: member.color, width: 72, height: 72, fontSize: '1.5rem' }}
                                >
                                    {member.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <h3 className="team-card-name">{member.name}</h3>
                            <span
                                className="team-card-role"
                                style={{ background: roleStyle.bg, color: roleStyle.color }}
                            >
                                {member.role}
                            </span>
                            <div className="team-card-meta">
                                <CalendarMonth style={{ fontSize: 14 }} />
                                <span>Katılım: {new Date(member.lastLogin).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Member Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title flex items-center gap-2">
                                <People style={{ fontSize: 24, color: 'var(--primary)' }} />
                                Yeni Üye Ekle
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn btn-ghost btn-icon"
                            >
                                <Close style={{ fontSize: 20 }} />
                            </button>
                        </div>

                        <form onSubmit={handleInvite}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">İsim Soyisim</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Örn: Ahmet Yılmaz"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Rol</label>
                                    <select
                                        className="form-select"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Team Member">Team Member</option>
                                        <option value="Product Owner">Product Owner</option>
                                        <option value="Scrum Master">Scrum Master</option>
                                        <option value="Tech Lead">Tech Lead</option>
                                        <option value="Designer">Designer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Üye Ekle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Team;
