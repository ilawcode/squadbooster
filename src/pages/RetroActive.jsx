import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import { Plus, ThumbsUp, MessageSquare, ArrowRight, Check, Layers, Trash2, Calendar } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
const SortableItem = ({ id, card, onVote, step, onMerge }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white p-4 rounded-xl shadow-sm border border-border-light mb-3 select-none ${step === 'group' ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                    <p className="text-text-primary whitespace-pre-wrap">{card.content}</p>
                    {card.groupedCards && card.groupedCards.length > 0 && (
                        <div className="mt-2 pl-3 border-l-2 border-primary-200 space-y-1">
                            {card.groupedCards.map((g, i) => (
                                <p key={i} className="text-xs text-muted">{g.content}</p>
                            ))}
                        </div>
                    )}
                </div>

                {step === 'vote' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag
                            onVote(card._id);
                        }}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${card.isVoted
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-bg-tertiary text-text-secondary hover:bg-border-light'
                            }`}
                    >
                        <ThumbsUp size={14} />
                        <span>{card.votes.length}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

const RetroActive = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ritual, setRitual] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCardContent, setNewCardContent] = useState('');
    const [inputType, setInputType] = useState('good');

    // Action creation state
    const [actionModal, setActionModal] = useState(null);
    const [actionForm, setActionForm] = useState({ title: '', assignee: '' });
    const [members, setMembers] = useState([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchData();
        fetchMembers();

        // Polling for simple real-time updates (every 5 seconds)
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchData = async () => {
        try {
            const [ritualData, cardsData] = await Promise.all([
                api.get(`/rituals/${id}`),
                api.get(`/retro/${id}/cards`)
            ]);
            setRitual(ritualData);
            setCards(cardsData);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const data = await api.get('/members');
            setMembers(data);
        } catch (error) { console.error(error); }
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!newCardContent.trim()) return;

        try {
            const newCard = await api.post(`/retro/${id}/cards`, {
                content: newCardContent,
                category: inputType,
                createdBy: user.name
            });
            setCards([...cards, newCard]);
            setNewCardContent('');
        } catch (error) {
            console.error('Add card error:', error);
        }
    };

    const handleStepChange = async (step) => {
        try {
            const updatedRitual = await api.patch(`/retro/${id}/step`, { step });
            setRitual(updatedRitual);
        } catch (error) {
            console.error('Step update error:', error);
        }
    };

    const handleVote = async (cardId) => {
        try {
            const updatedCard = await api.post(`/retro/cards/${cardId}/vote`, { userName: user.name });
            setCards(cards.map(c => c._id === cardId ? updatedCard : c));
        } catch (error) {
            console.error('Vote error:', error);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        // Grouping Logic: If dropped over another card
        // For simplicity, we assume dropping A onto B merges A into B

        const confirmMerge = window.confirm("Bu kartları birleştirmek istiyor musunuz?");
        if (!confirmMerge) return;

        try {
            await api.post('/retro/cards/group', {
                targetCardId: over.id,
                sourceCardId: active.id
            });
            fetchData(); // Refresh to show merged state
        } catch (error) {
            console.error('Merge error:', error);
        }
    };

    const handleCreateAction = async (e) => {
        e.preventDefault();
        try {
            await api.post('/actions', {
                title: actionForm.title,
                assignee: actionForm.assignee,
                ritual: id,
                createdBy: user.name,
                status: 'todo'
            });
            setActionModal(null);
            setActionForm({ title: '', assignee: '' });
            alert('Aksiyon oluşturuldu!');
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <Layout><div className="p-8 text-center">Yükleniyor...</div></Layout>;
    if (!ritual) return <Layout><div className="p-8 text-center">Ritüel bulunamadı.</div></Layout>;

    const goodCards = cards.filter(c => c.category === 'good');
    const badCards = cards.filter(c => c.category === 'bad');
    const sortedByVotes = [...cards].sort((a, b) => b.votes.length - a.votes.length);

    // Step Rendering Logic
    return (
        <Layout>
            {/* Header */}
            <div className="bg-white border-b border-border-light sticky top-0 z-20 px-6 py-4 -mx-8 -mt-8 mb-8 shadow-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="badge badge-primary uppercase">{ritual.type}</span>
                            <h1 className="text-xl font-bold">{ritual.name}</h1>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(ritual.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{cards.length} Fikir</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Stepper Controls */}
                        {ritual.retroStep === 'input' && (
                            <button onClick={() => handleStepChange('group')} className="btn btn-primary">
                                Gruplamaya Geç <ArrowRight size={16} />
                            </button>
                        )}
                        {ritual.retroStep === 'group' && (
                            <button onClick={() => handleStepChange('vote')} className="btn btn-primary">
                                Oylamaya Geç <ArrowRight size={16} />
                            </button>
                        )}
                        {ritual.retroStep === 'vote' && (
                            <button onClick={() => handleStepChange('completed')} className="btn btn-success">
                                Sonuçları Gör <Check size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-6xl mx-auto">

                {/* STEP 1: INPUT */}
                {ritual.retroStep === 'input' && (
                    <div className="space-y-6">
                        <div className="card p-6 border-2 border-primary-100">
                            <h3 className="text-lg font-bold mb-4">Fikir Ekle</h3>
                            <form onSubmit={handleAddCard}>
                                <div className="flex bg-bg-tertiary p-1 rounded-lg mb-4 w-fit">
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${inputType === 'good' ? 'bg-white text-success-600 shadow-sm' : 'text-muted'}`}
                                        onClick={() => setInputType('good')}
                                    >
                                        🎉 İyi Gidenler
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${inputType === 'bad' ? 'bg-white text-danger-600 shadow-sm' : 'text-muted'}`}
                                        onClick={() => setInputType('bad')}
                                    >
                                        🌵 Geliştirilmeli
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="form-input flex-1"
                                        placeholder="Düşüncelerini paylaş..."
                                        value={newCardContent}
                                        onChange={(e) => setNewCardContent(e.target.value)}
                                        autoFocus
                                    />
                                    <button type="submit" className="btn btn-primary">Ekle</button>
                                </div>
                                <p className="text-xs text-muted mt-2 flex items-center gap-1">
                                    <MessageSquare size={12} />
                                    Girişleriniz anonim olarak görüntülenecektir.
                                </p>
                            </form>
                        </div>
                    </div>
                )}

                {/* BOARD VIEW (Input / Group / Vote) */}
                {ritual.retroStep !== 'completed' && (
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        {/* Good Column */}
                        <div className="bg-success-50/50 p-4 rounded-2xl border border-success-100/50 min-h-[500px]">
                            <h3 className="font-bold text-success-700 mb-4 flex items-center gap-2">
                                🎉 İyi Gidenler
                                <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm">{goodCards.length}</span>
                            </h3>

                            {ritual.retroStep === 'group' ? (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={goodCards.map(c => c._id)} strategy={verticalListSortingStrategy}>
                                        {goodCards.map(card => (
                                            <SortableItem key={card._id} id={card._id} card={card} step={ritual.retroStep} />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                goodCards.map(card => (
                                    <SortableItem
                                        key={card._id}
                                        id={card._id}
                                        card={{ ...card, isVoted: card.votes.includes(user.name) }}
                                        step={ritual.retroStep}
                                        onVote={handleVote}
                                    />
                                ))
                            )}
                        </div>

                        {/* Bad Column */}
                        <div className="bg-danger-50/50 p-4 rounded-2xl border border-danger-100/50 min-h-[500px]">
                            <h3 className="font-bold text-danger-700 mb-4 flex items-center gap-2">
                                🌵 Geliştirilmeli
                                <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm">{badCards.length}</span>
                            </h3>

                            {ritual.retroStep === 'group' ? (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={badCards.map(c => c._id)} strategy={verticalListSortingStrategy}>
                                        {badCards.map(card => (
                                            <SortableItem key={card._id} id={card._id} card={card} step={ritual.retroStep} />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                badCards.map(card => (
                                    <SortableItem
                                        key={card._id}
                                        id={card._id}
                                        card={{ ...card, isVoted: card.votes.includes(user.name) }}
                                        step={ritual.retroStep}
                                        onVote={handleVote}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* COMPLETED / RESULTS VIEW */}
                {ritual.retroStep === 'completed' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Sonuçlar ve Aksiyonlar</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortedByVotes.map((card, index) => (
                                <div key={card._id} className="card p-5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 bg-primary-50 rounded-bl-xl text-primary-700 font-bold text-sm">
                                        {card.votes.length} Oy
                                    </div>
                                    <div className={`w-1 h-full absolute left-0 top-0 ${card.category === 'good' ? 'bg-success-500' : 'bg-danger-500'}`} />

                                    <p className="font-medium mb-4 pr-8">{card.content}</p>

                                    {/* Create Action Button (Only for bad items usually, but allowed for all) */}
                                    <button
                                        onClick={() => {
                                            setActionForm({ ...actionForm, title: card.content });
                                            setActionModal(card._id);
                                        }}
                                        className="btn btn-sm btn-secondary w-full"
                                    >
                                        <Layers size={14} /> Aksiyon Oluştur
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {actionModal && (
                <div className="modal-overlay" onClick={() => setActionModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Aksiyon Oluştur</h3>
                        </div>
                        <form onSubmit={handleCreateAction}>
                            <div className="modal-body space-y-4">
                                <div className="form-group">
                                    <label className="form-label">Aksiyon Başlığı</label>
                                    <input
                                        className="form-input"
                                        value={actionForm.title}
                                        onChange={e => setActionForm({ ...actionForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Atanan Kişi</label>
                                    <select
                                        className="form-select"
                                        value={actionForm.assignee}
                                        onChange={e => setActionForm({ ...actionForm, assignee: e.target.value })}
                                    >
                                        <option value="">Seçiniz</option>
                                        {members.map(m => (
                                            <option key={m._id} value={m._id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setActionModal(null)}>İptal</button>
                                <button type="submit" className="btn btn-primary">Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default RetroActive;
