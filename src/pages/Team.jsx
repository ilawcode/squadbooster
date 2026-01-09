import React, { useState, useEffect } from 'react';
import { api } from '../utils';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import { Add, Close, People } from '@mui/icons-material';

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

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <People className="text-primary-600" sx={{ fontSize: 32 }} /> Takım Üyeleri
                    </h1>
                    <p className="page-subtitle">Squad'ını güçlendiren kahramanlar.</p>
                </div>
                <button className="btn btn-primary shadow-lg shadow-primary-500/20 px-4 py-2.5 h-auto flex items-center gap-2" onClick={() => setShowModal(true)}>
                    <Add sx={{ fontSize: 20 }} />
                    <span className="hidden md:inline">Üye Ekle</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map(member => (
                    <div key={member._id} className="bg-white rounded-xl p-6 flex flex-col items-center text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                        <Avatar name={member.name} color={member.color} size="xl" className="mb-4 text-2xl" />
                        <h3 className="text-lg font-bold mb-1 text-gray-900">{member.name}</h3>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full mb-4">
                            {member.role}
                        </span>
                        <div className="text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50 w-full">
                            Son görülme: {new Date(member.lastLogin).toLocaleDateString('tr-TR')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modern Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <People className="text-primary-500" sx={{ fontSize: 24 }} /> Yeni Üye
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-full transition-all shadow-sm hover:shadow-md">
                                <Close sx={{ fontSize: 20 }} />
                            </button>
                        </div>

                        <form onSubmit={handleInvite} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">İsim Soyisim</label>
                                <input
                                    type="text"
                                    className="form-input w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                                    placeholder="Ad Soyad"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Rol</label>
                                <div className="relative">
                                    <select
                                        className="form-select w-full border-gray-300 rounded-lg px-4 py-2.5 appearance-none"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Team Member">Team Member</option>
                                        <option value="Product Owner">Product Owner</option>
                                        <option value="Scrum Master">Scrum Master</option>
                                        <option value="Tech Lead">Tech Lead</option>
                                        <option value="Designer">Designer</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                                <button type="button" className="btn btn-ghost px-5 py-2.5 rounded-lg font-medium" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary px-6 py-2.5 rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all">Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Team;
