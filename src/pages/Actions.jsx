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
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <ViewQuilt className="text-primary-600" sx={{ fontSize: 32 }} /> Aksiyonlar
                        </h1>
                        <p className="text-gray-500 mt-1">Takımın hedeflerini ve görevlerini buradan takip et.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-gray-100 p-1 rounded-lg flex border border-gray-200">
                            <button
                                className={`px-4 py-2 text-sm rounded-md transition-all font-medium ${filter === 'all' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                onClick={() => setFilter('all')}
                            >
                                Tümü
                            </button>
                            <button
                                className={`px-4 py-2 text-sm rounded-md transition-all font-medium ${filter === 'my' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                onClick={() => setFilter('my')}
                            >
                                Bana Atananlar
                            </button>
                        </div>
                        <button className="btn btn-primary shadow-lg shadow-primary-500/20 px-4 py-2.5 h-auto flex items-center gap-2" onClick={() => setShowModal(true)}>
                            <Add sx={{ fontSize: 20 }} /> <span className="hidden md:inline">Yeni Görev</span>
                        </button>
                    </div>
                </div>

                {/* Kanban Board */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="kanban-board flex-1 min-h-[500px]">
                        <DroppableColumn id="todo" title="Yapılacaklar" count={todoActions.length} items={todoActions} icon={<FormatListBulleted sx={{ fontSize: 20 }} />} color="text-gray-600">
                            {todoActions.map(action => (
                                <SortableItem key={action._id} id={action._id}>
                                    <ActionCard action={action} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                                </SortableItem>
                            ))}
                        </DroppableColumn>

                        <DroppableColumn id="in-progress" title="Sürüyor" count={inProgressActions.length} items={inProgressActions} icon={<PlayCircleOutline sx={{ fontSize: 20 }} className="text-blue-500" />} color="text-blue-600">
                            {inProgressActions.map(action => (
                                <SortableItem key={action._id} id={action._id}>
                                    <ActionCard action={action} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                                </SortableItem>
                            ))}
                        </DroppableColumn>

                        <DroppableColumn id="done" title="Tamamlandı" count={doneActions.length} items={doneActions} icon={<CheckCircle sx={{ fontSize: 20 }} className="text-success-500" />} color="text-success-600">
                            {doneActions.map(action => (
                                <SortableItem key={action._id} id={action._id}>
                                    <ActionCard action={action} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                                </SortableItem>
                            ))}
                        </DroppableColumn>
                    </div>
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeAction ? (
                            <div className="transform rotate-2 scale-105 opacity-90 cursor-grabbing">
                                <ActionCard action={activeAction} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
                <div className="h-12"></div> {/* Bottom Spacer */}
            </div>

            {/* Create Action Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FormatListBulleted className="text-primary-500" /> Yeni Görev Ekle
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-full transition-all shadow-sm hover:shadow-md">
                                <Close sx={{ fontSize: 20 }} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAction} className="overflow-y-auto p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Başlık</label>
                                <input
                                    className="form-input w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Görev adı..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Açıklama</label>
                                <textarea
                                    className="form-input w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 min-h-[100px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detaylar..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Bitiş Tarihi</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Öncelik</label>
                                    <select
                                        className="form-select w-full border-gray-300 rounded-lg px-4 py-2.5"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Düşük</option>
                                        <option value="medium">Orta</option>
                                        <option value="high">Yüksek</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Atanan Kişi</label>
                                    <div className="relative">
                                        <select
                                            className="form-select w-full border-gray-300 rounded-lg px-4 py-2.5 appearance-none"
                                            value={formData.assignee}
                                            onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                                        >
                                            <option value="">Seçiniz</option>
                                            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">İlgili Ritüel</label>
                                    <div className="relative">
                                        <select
                                            className="form-select w-full border-gray-300 rounded-lg px-4 py-2.5 appearance-none"
                                            value={formData.ritual}
                                            onChange={e => setFormData({ ...formData, ritual: e.target.value })}
                                        >
                                            <option value="">Seçiniz</option>
                                            {rituals.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                                <button type="button" className="btn btn-ghost px-5 py-2.5 rounded-lg font-medium" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary px-6 py-2.5 rounded-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all">Görevi Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Actions;
