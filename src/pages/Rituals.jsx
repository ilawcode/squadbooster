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
                    <div className="grid md:grid-cols-2 gap-6">
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
                        <div className="grid md:grid-cols-2 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
                            {pastRituals.map(ritual => (
                                <RitualCard key={ritual._id} ritual={ritual} onDelete={handleDelete} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Modern Create Ritual Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <CalendarToday className="text-primary-500" sx={{ fontSize: 24 }} /> Yeni Ritüel Planla
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-full transition-all shadow-sm hover:shadow-md">
                                <Close sx={{ fontSize: 20 }} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRitual} className="overflow-y-auto p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ritüel Adı</label>
                                <input
                                    type="text"
                                    className="form-input w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                                    placeholder="Örn: Sprint Planning #42"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Tip</label>
                                    <div className="relative">
                                        <select
                                            className="form-select w-full border-gray-300 rounded-lg px-4 py-2.5 appearance-none"
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
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Tarih & Saat</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Süre (Dakika)</label>
                                <input
                                    type="number"
                                    className="form-input w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    min="15"
                                    step="15"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Açıklama</label>
                                <textarea
                                    className="form-input w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 min-h-[80px]"
                                    placeholder="Ritüel içeriği, gündem maddeleri..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Katılımcılar</label>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    {members.map(member => (
                                        <div
                                            key={member._id}
                                            onClick={() => toggleParticipant(member._id)}
                                            className={`cursor-pointer select-none px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${formData.participants.includes(member._id)
                                                ? 'bg-primary-500 text-white border-primary-600 shadow-md transform scale-105'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                                                }`}
                                        >
                                            {member.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                                <button type="button" className="btn btn-ghost px-5 py-2.5 rounded-lg font-medium" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary px-6 py-2.5 rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all">Planla</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Rituals;
