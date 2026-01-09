import React, { useState, useEffect } from 'react';
import { api } from '../utils';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ActionCard from '../components/ActionCard';
import RitualCard from '../components/RitualCard';
import { Plus, Target, CheckSquare, Calendar, Loader } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [actions, setActions] = useState([]);
    const [upcomingRituals, setUpcomingRituals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [actionsData, ritualsData] = await Promise.all([
                    api.get('/actions'),
                    api.get('/rituals/upcoming/list')
                ]);
                setActions(actionsData);
                setUpcomingRituals(ritualsData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleActionStatusChange = async (id, status) => {
        try {
            await api.patch(`/actions/${id}`, { status });
            setActions(actions.map(a => a._id === id ? { ...a, status } : a));
        } catch (error) {
            console.error('Update status error', error);
        }
    };

    const handleActionDelete = async (id) => {
        if (!window.confirm('Bu aksiyonu silmek istediğine emin misin?')) return;
        try {
            await api.delete(`/actions/${id}`);
            setActions(actions.filter(a => a._id !== id));
        } catch (error) {
            console.error('Delete action error', error);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <Loader className="animate-spin text-primary-500" size={40} />
                </div>
            </Layout>
        );
    }

    // Stats
    const todoCount = actions.filter(a => a.status === 'todo').length;
    const inProgressCount = actions.filter(a => a.status === 'in-progress').length;
    const doneCount = actions.filter(a => a.status === 'done').length;

    // My Actions
    const myActions = actions.filter(a => a.assignee?._id === user._id && a.status !== 'done');

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Hoş Geldin, {user.name} 👋</h1>
                    <p className="page-subtitle">Bugün squadın için harika bir gün!</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-primary" onClick={() => window.location.href = '/actions'}>
                        <Plus size={18} />
                        <span>Yeni Aksiyon</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary">
                        <Target size={24} />
                    </div>
                    <div>
                        <div className="stat-value">{todoCount}</div>
                        <div className="stat-label">Yapılacak</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <Loader size={24} />
                    </div>
                    <div>
                        <div className="stat-value">{inProgressCount}</div>
                        <div className="stat-label">Devam Eden</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success">
                        <CheckSquare size={24} />
                    </div>
                    <div>
                        <div className="stat-value">{doneCount}</div>
                        <div className="stat-label">Tamamlanan</div>
                    </div>
                </div>
            </div>

            <div className="grid-2">
                {/* Upcoming Rituals */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="text-accent-500" size={24} />
                            Yaklaşan Ritüeller
                        </h2>
                    </div>

                    {upcomingRituals.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {upcomingRituals.map(ritual => (
                                <RitualCard key={ritual._id} ritual={ritual} />
                            ))}
                        </div>
                    ) : (
                        <div className="card p-8 flex flex-col items-center justify-center text-center">
                            <p className="text-muted">Yaklaşan ritüel bulunmuyor.</p>
                        </div>
                    )}
                </section>

                {/* My Actions */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <CheckSquare className="text-primary-500" size={24} />
                            Benim Aksiyonlarım
                        </h2>
                        <span className="badge badge-primary">{myActions.length}</span>
                    </div>

                    {myActions.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {myActions.map(action => (
                                <ActionCard
                                    key={action._id}
                                    action={action}
                                    onStatusChange={handleActionStatusChange}
                                    onDelete={handleActionDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="card p-8 flex flex-col items-center justify-center text-center">
                            <p className="text-muted">Üzerine atanmış aktif aksiyon yok.</p>
                            <button
                                className="btn btn-ghost text-primary-600 mt-2"
                                onClick={() => window.location.href = '/actions'}
                            >
                                Aksiyon Al
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
};

export default Dashboard;
