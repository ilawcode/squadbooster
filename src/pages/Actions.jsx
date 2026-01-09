import React, { useState, useEffect } from 'react';
import { api } from '../utils';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ActionCard from '../components/ActionCard';
import { Plus, Search, Filter, X } from 'lucide-react';

const Actions = () => {
    const { user } = useAuth();
    const [actions, setActions] = useState([]);
    const [members, setMembers] = useState([]);
    const [rituals, setRituals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all'); // all, my

    // New Action Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignee: '',
        dueDate: '',
        priority: 'medium',
        ritual: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [actionsData, membersData, ritualsData] = await Promise.all([
                api.get('/actions'),
                api.get('/members'),
                api.get('/rituals')
            ]);
            setActions(actionsData);
            setMembers(membersData);
            setRituals(ritualsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAction = async (e) => {
        e.preventDefault();
        try {
            const newAction = await api.post('/actions', {
                ...formData,
                createdBy: user.name
            });
            setActions([newAction, ...actions]);
            setShowModal(false);
            setFormData({
                title: '',
                description: '',
                assignee: '',
                dueDate: '',
                priority: 'medium',
                ritual: ''
            });
        } catch (error) {
            console.error('Create action error:', error);
            alert('Aksiyon oluşturulurken hata oluştu');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.patch(`/actions/${id}`, { status });
            setActions(actions.map(a => a._id === id ? { ...a, status } : a));
        } catch (error) {
            console.error('Update status error', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu aksiyonu silmek istediğine emin misin?')) return;
        try {
            await api.delete(`/actions/${id}`);
            setActions(actions.filter(a => a._id !== id));
        } catch (error) {
            console.error('Delete action error', error);
        }
    };

    const filteredActions = filter === 'my'
        ? actions.filter(a => a.assignee?._id === user._id)
        : actions;

    const todoActions = filteredActions.filter(a => a.status === 'todo');
    const inProgressActions = filteredActions.filter(a => a.status === 'in-progress');
    const doneActions = filteredActions.filter(a => a.status === 'done');

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Aksiyonlar</h1>
                    <p className="page-subtitle">Takımın aldığı kararları ve görevleri takip et.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-bg-secondary rounded-lg border border-border-light p-1">
                        <button
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'all' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-muted hover:text-primary-600'}`}
                            onClick={() => setFilter('all')}
                        >
                            Tümü
                        </button>
                        <button
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'my' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-muted hover:text-primary-600'}`}
                            onClick={() => setFilter('my')}
                        >
                            Bana Atananlar
                        </button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        <span>Yeni Ekle</span>
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="kanban-board">
                {/* Todo Column */}
                <div className="kanban-column">
                    <div className="kanban-column-header">
                        <span className="kanban-column-title">Yapılacaklar</span>
                        <span className="kanban-column-count">{todoActions.length}</span>
                    </div>
                    <div className="kanban-cards">
                        {todoActions.map(action => (
                            <ActionCard
                                key={action._id}
                                action={action}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </div>

                {/* In Progress Column */}
                <div className="kanban-column">
                    <div className="kanban-column-header">
                        <span className="kanban-column-title">Devam Edenler</span>
                        <span className="kanban-column-count">{inProgressActions.length}</span>
                    </div>
                    <div className="kanban-cards">
                        {inProgressActions.map(action => (
                            <ActionCard
                                key={action._id}
                                action={action}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </div>

                {/* Done Column */}
                <div className="kanban-column">
                    <div className="kanban-column-header">
                        <span className="kanban-column-title">Tamamlananlar</span>
                        <span className="kanban-column-count">{doneActions.length}</span>
                    </div>
                    <div className="kanban-cards">
                        {doneActions.map(action => (
                            <ActionCard
                                key={action._id}
                                action={action}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Action Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Yeni Aksiyon Ekle</h3>
                            <button
                                className="btn btn-icon btn-ghost"
                                onClick={() => setShowModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAction}>
                            <div className="modal-body space-y-4">
                                <div className="form-group">
                                    <label className="form-label">Başlık</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ne yapılması gerekiyor?"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Detaylar..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Atanan Kişi</label>
                                        <select
                                            className="form-select"
                                            value={formData.assignee}
                                            onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                                        >
                                            <option value="">Seçiniz</option>
                                            {members.map(m => (
                                                <option key={m._id} value={m._id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Öncelik</label>
                                        <select
                                            className="form-select"
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low">Düşük</option>
                                            <option value="medium">Orta</option>
                                            <option value="high">Yüksek</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Bitiş Tarihi</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={formData.dueDate}
                                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">İlgili Ritüel</label>
                                        <select
                                            className="form-select"
                                            value={formData.ritual}
                                            onChange={e => setFormData({ ...formData, ritual: e.target.value })}
                                        >
                                            <option value="">Seçiniz (Opsiyonel)</option>
                                            {rituals.map(r => (
                                                <option key={r._id} value={r._id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>iptal</button>
                                <button type="submit" className="btn btn-primary">Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Actions;
