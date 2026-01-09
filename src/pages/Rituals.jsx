import React, { useState, useEffect } from 'react';
import { api } from '../utils';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import RitualCard from '../components/RitualCard';
import { Add, Close, CalendarToday } from '@mui/icons-material';

const Rituals = () => {
    const { user } = useAuth();
    const [rituals, setRituals] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // New Ritual Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'planning',
        description: '',
        date: '',
        duration: 60,
        participants: [],
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ritualsData, membersData] = await Promise.all([
                api.get('/rituals'),
                api.get('/members')
            ]);
            setRituals(ritualsData);
            setMembers(membersData);
        } catch (error) { console.error('Error fetching data:', error); }
        finally { setLoading(false); }
    };

    const handleCreateRitual = async (e) => {
        e.preventDefault();
        try {
            const newRitual = await api.post('/rituals', { ...formData, createdBy: user.name });
            setRituals([newRitual, ...rituals]);
            setShowModal(false);
            setFormData({ name: '', type: 'planning', description: '', date: '', duration: 60, participants: [], notes: '' });
        } catch (error) { console.error('Create ritual error:', error); alert('Hata oluştu'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu ritüeli silmek istediğine emin misin?')) return;
        try {
            await api.delete(`/rituals/${id}`);
            setRituals(rituals.filter(r => r._id !== id));
        } catch (error) { console.error(error); }
    };

    const toggleParticipant = (memberId) => {
        const current = formData.participants;
        if (current.includes(memberId)) {
            setFormData({ ...formData, participants: current.filter(id => id !== memberId) });
        } else {
            setFormData({ ...formData, participants: [...current, memberId] });
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingRituals = rituals.filter(r => new Date(r.date) >= today);
    const pastRituals = rituals.filter(r => new Date(r.date) < today);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarToday className="text-primary-600" sx={{ fontSize: 32 }} /> Ritüeller
                    </h1>
                    <p className="page-subtitle">Toplantılarını, planlamalarını ve reviewlarını yönet.</p>
                </div>
                <button className="btn btn-primary shadow-lg shadow-primary-500/20 px-4 py-2.5 h-auto flex items-center gap-2" onClick={() => setShowModal(true)}>
                    <Add sx={{ fontSize: 20 }} />
                    <span className="hidden md:inline">Ritüel Ekle</span>
                </button>
            </div>

            <div className="space-y-8">
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarToday className="text-primary-500" sx={{ fontSize: 20 }} />
                        <h2 className="text-lg font-bold text-gray-800">Yaklaşan Ritüeller</h2>
                    </div>
                    <div className="rituals-grid">
                        {upcomingRituals.length > 0 ? (
                            upcomingRituals.map(ritual => (
                                <RitualCard key={ritual._id} ritual={ritual} onDelete={handleDelete} />
                            ))
                        ) : (
                            <div className="col-span-2 p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                                Yaklaşan ritüel bulunmuyor.
                            </div>
                        )}
                    </div>
                </section>

                {pastRituals.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold mb-4 opacity-60">Geçmiş Ritüeller</h2>
                        <div className="rituals-grid opacity-60 hover:opacity-100 transition-opacity duration-300">
                            {pastRituals.map(ritual => (
                                <RitualCard key={ritual._id} ritual={ritual} onDelete={handleDelete} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Create Ritual Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal animate-slide-up" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title flex items-center gap-2">
                                <CalendarToday style={{ fontSize: 24, color: 'var(--primary)' }} />
                                Yeni Ritüel Planla
                            </h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                                <Close style={{ fontSize: 20 }} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRitual}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Ritüel Adı</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Örn: Sprint Planning #42"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Tip</label>
                                        <select
                                            className="form-select"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="planning">Planning</option>
                                            <option value="review">Review</option>
                                            <option value="retro">Retrospective</option>
                                            <option value="daily">Daily Standup</option>
                                            <option value="grooming">Grooming</option>
                                            <option value="other">Diğer</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Tarih & Saat</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Süre (Dakika)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                                        min="15"
                                        step="15"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Ritüel içeriği, gündem maddeleri..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Katılımcılar</label>
                                    <div className="participant-picker">
                                        {members.map(member => (
                                            <div
                                                key={member._id}
                                                onClick={() => toggleParticipant(member._id)}
                                                className={`participant-chip ${formData.participants.includes(member._id) ? 'selected' : ''}`}
                                            >
                                                {member.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Ritüeli Planla
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Rituals;
