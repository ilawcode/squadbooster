import React, { useState, useEffect } from 'react';
import { api } from '../utils';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ActionCard from '../components/ActionCard';
import {
    Add,
    Search,
    FilterList,
    Close,
    ViewQuilt,
    FormatListBulleted,
    CheckCircle,
    PlayCircleOutline
} from '@mui/icons-material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Draggable Sortable Item Wrapper
const SortableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 1,
        position: 'relative'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 touch-none">
            {children}
        </div>
    );
};

// Droppable Column
const DroppableColumn = ({ id, title, count, icon, color, items, children }) => {
    const { setNodeRef } = useSortable({ id, data: { type: 'Column', id } });

    return (
        <div ref={setNodeRef} className="kanban-column flex flex-col h-full md:min-h-[calc(100vh-180px)]">
            <div className={`kanban-column-header sticky top-0 z-10 ${color}`}>
                <div className="flex items-center gap-2 font-bold text-gray-700">
                    {icon}
                    <span>{title}</span>
                </div>
                <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold text-gray-600 shadow-sm border border-gray-100">
                    {count}
                </span>
            </div>
            <div className="flex-1 overflow-y-auto min-h-[150px] kanban-cards">
                <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
                    {children}
                </SortableContext>
                {items.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                        Boş
                    </div>
                )}
            </div>
        </div>
    );
};

const Actions = () => {
    const { user } = useAuth();
    const [actions, setActions] = useState([]);
    const [members, setMembers] = useState([]);
    const [rituals, setRituals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [activeId, setActiveId] = useState(null);

    // New Action Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignee: '',
        dueDate: '',
        priority: 'medium',
        ritual: ''
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

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
        } catch (error) { console.error('Error fetching data:', error); }
        finally { setLoading(false); }
    };

    const handleCreateAction = async (e) => {
        e.preventDefault();
        try {
            const newAction = await api.post('/actions', { ...formData, createdBy: user.name });
            setActions([newAction, ...actions]);
            setShowModal(false);
            setFormData({ title: '', description: '', assignee: '', dueDate: '', priority: 'medium', ritual: '' });
        } catch (error) { console.error(error); alert('Hata oluştu'); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.patch(`/actions/${id}`, { status });
            setActions(actions.map(a => a._id === id ? { ...a, status } : a));
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Silmek istediğine emin misin?')) return;
        try {
            await api.delete(`/actions/${id}`);
            setActions(actions.filter(a => a._id !== id));
        } catch (error) { console.error(error); }
    };

    // Drag Functionality
    const handleDragStart = (event) => setActiveId(event.active.id);

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // Find source action
        const actionId = active.id;
        const action = actions.find(a => a._id === actionId);

        // Determine target status based on Droppable Column ID or Item ID
        let newStatus = null;

        // If dropped on a column container
        if (['todo', 'in-progress', 'done'].includes(over.id)) {
            newStatus = over.id;
        } else {
            // If dropped over another card, find that card's status
            const overCard = actions.find(a => a._id === over.id);
            if (overCard) newStatus = overCard.status;
        }

        if (newStatus && action && action.status !== newStatus) {
            // Optimistic update
            setActions(actions.map(a => a._id === actionId ? { ...a, status: newStatus } : a));
            // API call
            try { await api.patch(`/actions/${actionId}`, { status: newStatus }); }
            catch (error) {
                console.error(error);
                // Revert on error
                setActions(actions.map(a => a._id === actionId ? { ...a, status: action.status } : a));
            }
        }
    };

    const filteredActions = filter === 'my' ? actions.filter(a => a.assignee?._id === user._id) : actions;
    const todoActions = filteredActions.filter(a => a.status === 'todo');
    const inProgressActions = filteredActions.filter(a => a.status === 'in-progress');
    const doneActions = filteredActions.filter(a => a.status === 'done');
    const activeAction = activeId ? actions.find(a => a._id === activeId) : null;

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: '0.4' } },
        }),
    };

    return (
        <Layout>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <ViewQuilt style={{ fontSize: 32, color: 'var(--primary)' }} />
                            Aksiyonlar
                        </h1>
                        <p className="page-subtitle">Takımın hedeflerini ve görevlerini buradan takip et.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="tabs">
                            <button
                                className={`tab ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                Tümü
                            </button>
                            <button
                                className={`tab ${filter === 'my' ? 'active' : ''}`}
                                onClick={() => setFilter('my')}
                            >
                                Bana Atananlar
                            </button>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Add style={{ fontSize: 20 }} />
                            <span>Yeni Görev</span>
                        </button>
                    </div>
                </div>

                {/* Kanban Board */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="kanban-board">
                        <DroppableColumn id="todo" title="Yapılacaklar" count={todoActions.length} items={todoActions} icon={<FormatListBulleted sx={{ fontSize: 20 }} />} color="text-gray-600">
                            {todoActions.map(action => (
                                <SortableItem key={action._id} id={action._id}>
                                    <ActionCard action={action} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                                </SortableItem>
                            ))}
                        </DroppableColumn>

                        <DroppableColumn id="in-progress" title="Sürüyor" count={inProgressActions.length} items={inProgressActions} icon={<PlayCircleOutline sx={{ fontSize: 20 }} style={{ color: 'var(--info)' }} />} color="text-blue-600">
                            {inProgressActions.map(action => (
                                <SortableItem key={action._id} id={action._id}>
                                    <ActionCard action={action} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                                </SortableItem>
                            ))}
                        </DroppableColumn>

                        <DroppableColumn id="done" title="Tamamlandı" count={doneActions.length} items={doneActions} icon={<CheckCircle sx={{ fontSize: 20 }} style={{ color: 'var(--success)' }} />} color="text-success-600">
                            {doneActions.map(action => (
                                <SortableItem key={action._id} id={action._id}>
                                    <ActionCard action={action} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                                </SortableItem>
                            ))}
                        </DroppableColumn>
                    </div>
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeAction ? (
                            <div style={{ transform: 'rotate(2deg) scale(1.05)', opacity: 0.9 }}>
                                <ActionCard action={activeAction} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Create Action Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal animate-slide-up" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title flex items-center gap-2">
                                <FormatListBulleted style={{ fontSize: 24, color: 'var(--primary)' }} />
                                Yeni Görev Ekle
                            </h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                                <Close style={{ fontSize: 20 }} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAction}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Başlık</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Görev adı..."
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detaylar..."
                                    />
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
                                        <label className="form-label">Atanan Kişi</label>
                                        <select
                                            className="form-select"
                                            value={formData.assignee}
                                            onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                                        >
                                            <option value="">Seçiniz</option>
                                            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">İlgili Ritüel</label>
                                        <select
                                            className="form-select"
                                            value={formData.ritual}
                                            onChange={e => setFormData({ ...formData, ritual: e.target.value })}
                                        >
                                            <option value="">Seçiniz</option>
                                            {rituals.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Görevi Oluştur
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Actions;
