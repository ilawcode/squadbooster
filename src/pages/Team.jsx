import React, { useState, useEffect } from 'react';
import { api } from '../utils';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import { Plus, X, Users } from 'lucide-react';

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
            // Create new member manually (though login also creates them)
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
            <div className="page-header">
                <div>
                    <h1 className="page-title">Takım Üyeleri</h1>
                    <p className="page-subtitle">Squad'ını güçlendiren kahramanlar.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    <span>Üye Ekle</span>
                </button>
            </div>

            <div className="grid-3">
                {members.map(member => (
                    <div key={member._id} className="card p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                        <Avatar name={member.name} color={member.color} size="xl" className="mb-4 text-2xl" />
                        <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                        <span className="text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded-full mb-4">
                            {member.role}
                        </span>
                        <div className="text-xs text-muted mt-auto">
                            Son görülme: {new Date(member.lastLogin).toLocaleDateString('tr-TR')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Member Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Yeni Takım Üyesi</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleInvite}>
                            <div className="modal-body space-y-4">
                                <div className="form-group">
                                    <label className="form-label">İsim Soyisim</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ad Soyad"
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
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>iptal</button>
                                <button type="submit" className="btn btn-primary">Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Team;
