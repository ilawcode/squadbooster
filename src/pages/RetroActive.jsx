import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import { Plus, ThumbsUp, MessageSquare, ArrowRight, Check, Layers, Trash2, Calendar, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component (Card View)
const SortableItem = ({ id, card, onVote, step, onMerge }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.8 : 1,
        position: 'relative'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        bg-white p-4 rounded-xl shadow-sm border border-border-light mb-3 select-none flex items-start gap-3 transition-all
        ${isDragging ? 'shadow-xl ring-2 ring-primary-400 scale-105 rotate-1' : 'hover:shadow-md'}
        ${step === 'group' ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
        >
            {step === 'group' && (
                <div className="mt-1 text-muted cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                    <GripVertical size={16} />
                </div>
            )}

            <div className="flex-1">
                <p className="text-text-primary font-medium text-base whitespace-pre-wrap leading-relaxed">{card.content}</p>
                {card.groupedCards && card.groupedCards.length > 0 && (
                    <div className="mt-3 pl-3 border-l-2 border-primary-200 space-y-1.5 bg-bg-tertiary/50 p-2 rounded-r-lg">
                        {card.groupedCards.map((g, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-muted">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-primary-400"></span>
                                <span>{g.content}</span>
                            </div>
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
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold transition-all transform active:scale-95 ${card.isVoted
                            ? 'bg-primary-100 text-primary-700 shadow-inner ring-1 ring-primary-200'
                            : 'bg-bg-tertiary text-text-secondary hover:bg-border-light'
                        }`}
                >
                    <ThumbsUp size={14} className={card.isVoted ? 'fill-current' : ''} />
                    <span>{card.votes.length}</span>
                </button>
            )}
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
    const [activeId, setActiveId] = useState(null); // For DragOverlay

    // Action creation state
    const [actionModal, setActionModal] = useState(null);
    const [actionForm, setActionForm] = useState({ title: '', assignee: '' });
    const [members, setMembers] = useState([]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px sürüklemeden drag başlamasın (yanlış tıklamaları önler)
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchData();
        fetchMembers();
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
        } catch (error) { console.error(error); }
    };

    const handleStepChange = async (step) => {
        try {
            const updatedRitual = await api.patch(`/retro/${id}/step`, { step });
            setRitual(updatedRitual);
        } catch (error) { console.error(error); }
    };

    const handleVote = async (cardId) => {
        try {
            const updatedCard = await api.post(`/retro/cards/${cardId}/vote`, { userName: user.name });
            setCards(cards.map(c => c._id === cardId ? updatedCard : c));
        } catch (error) { console.error(error); }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        // Grouping Logic
        // Kartı başka bir kartın üzerine bıraktı mı?
        const sourceCard = cards.find(c => c._id === active.id);
        const targetCard = cards.find(c => c._id === over.id);

        if (sourceCard && targetCard && sourceCard.category === targetCard.category) {
            const confirmMerge = window.confirm(`"${sourceCard.content}" kartını "${targetCard.content}" ile gruplamak istiyor musunuz?`);
            if (confirmMerge) {
                try {
                    await api.post('/retro/cards/group', {
                        targetCardId: over.id,
                        sourceCardId: active.id
                    });
                    // Optimistic update or wait for poll
                    fetchData();
                } catch (error) {
                    console.error('Merge error:', error);
                }
            }
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
        } catch (error) { console.error(error); }
    };

    if (loading) return <Layout><div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div></Layout>;
    if (!ritual) return <Layout><div className="p-8 text-center">Ritüel bulunamadı.</div></Layout>;

    const goodCards = cards.filter(c => c.category === 'good');
    const badCards = cards.filter(c => c.category === 'bad');
    const sortedByVotes = [...cards].sort((a, b) => b.votes.length - a.votes.length);

    const activeCard = activeId ? cards.find(c => c._id === activeId) : null;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-light flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-4 z-40 backdrop-blur-md bg-white/90">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="badge badge-primary uppercase px-3 py-1 text-xs font-bold tracking-wider">{ritual.type}</span>
                            <h1 className="text-2xl font-bold text-text-primary">{ritual.name}</h1>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted font-medium">
                            <span className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(ritual.date).toLocaleDateString()}</span>
                            <span className="w-1 h-1 bg-border-medium rounded-full"></span>
                            <span>{cards.length} Fikir</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {ritual.retroStep === 'input' && (
                            <button onClick={() => handleStepChange('group')} className="btn btn-primary w-full md:w-auto shadow-lg shadow-primary-500/20">
                                Gruplamaya Geç <ArrowRight size={18} />
                            </button>
                        )}
                        {ritual.retroStep === 'group' && (
                            <button onClick={() => handleStepChange('vote')} className="btn btn-warning w-full md:w-auto shadow-lg shadow-warning-500/20 text-white">
                                Oylamaya Geç <ArrowRight size={18} />
                            </button>
                        )}
                        {ritual.retroStep === 'vote' && (
                            <button onClick={() => handleStepChange('completed')} className="btn btn-success w-full md:w-auto shadow-lg shadow-success-500/20">
                                Sonuçları Gör <Check size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Input Step */}
                {ritual.retroStep === 'input' && (
                    <div className="card p-8 border-2 border-primary-100 shadow-xl relative overflow-hidden bg-white animate-scaleIn">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary-500"></div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary-900">
                            <MessageSquare className="text-primary-500" />
                            Aklındakileri Paylaş
                        </h3>
                        <form onSubmit={handleAddCard} className="max-w-3xl">
                            <div className="flex bg-bg-tertiary p-1.5 rounded-xl mb-6 w-fit gap-1 shadow-inner">
                                <button
                                    type="button"
                                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${inputType === 'good' ? 'bg-white text-success-600 shadow-sm' : 'text-muted hover:text-text-primary'}`}
                                    onClick={() => setInputType('good')}
                                >
                                    🎉 İyi Gidenler
                                </button>
                                <button
                                    type="button"
                                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${inputType === 'bad' ? 'bg-white text-danger-600 shadow-sm' : 'text-muted hover:text-text-primary'}`}
                                    onClick={() => setInputType('bad')}
                                >
                                    🌵 Geliştirilmeli
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    className="form-input flex-1 h-12 text-lg shadow-sm border-gray-300 focus:border-primary-500 focus:ring-primary-200"
                                    placeholder="Düşünceni buraya yaz..."
                                    value={newCardContent}
                                    onChange={(e) => setNewCardContent(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="btn btn-primary h-12 px-6 shadow-md hover:scale-105 transition-transform">
                                    <Plus size={20} /> Ekle
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Columns View */}
                {ritual.retroStep !== 'completed' && (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid md:grid-cols-2 gap-8 items-start">
                            {/* Good Column */}
                            <div className="bg-success-50/50 p-6 rounded-3xl border border-success-100 min-h-[500px] shadow-sm">
                                <h3 className="text-lg font-bold text-success-800 mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-2">🎉 İyi Gidenler</span>
                                    <span className="bg-white px-2 py-0.5 rounded text-sm shadow-sm">{goodCards.length}</span>
                                </h3>

                                {ritual.retroStep === 'group' ? (
                                    <SortableContext items={goodCards.map(c => c._id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-3 min-h-[400px]">
                                            {goodCards.map(card => (
                                                <SortableItem key={card._id} id={card._id} card={card} step={ritual.retroStep} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                ) : (
                                    <div className="space-y-3">
                                        {goodCards.map(card => (
                                            <SortableItem key={card._id} id={card._id} card={{ ...card, isVoted: card.votes.includes(user.name) }} step={ritual.retroStep} onVote={handleVote} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Bad Column */}
                            <div className="bg-danger-50/50 p-6 rounded-3xl border border-danger-100 min-h-[500px] shadow-sm">
                                <h3 className="text-lg font-bold text-danger-800 mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-2">🌵 Geliştirilmeli</span>
                                    <span className="bg-white px-2 py-0.5 rounded text-sm shadow-sm">{badCards.length}</span>
                                </h3>

                                {ritual.retroStep === 'group' ? (
                                    <SortableContext items={badCards.map(c => c._id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-3 min-h-[400px]">
                                            {badCards.map(card => (
                                                <SortableItem key={card._id} id={card._id} card={card} step={ritual.retroStep} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                ) : (
                                    <div className="space-y-3">
                                        {badCards.map(card => (
                                            <SortableItem key={card._id} id={card._id} card={{ ...card, isVoted: card.votes.includes(user.name) }} step={ritual.retroStep} onVote={handleVote} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DragOverlay>
                            {activeCard ? (
                                <div className="bg-white p-4 rounded-xl shadow-2xl border-2 border-primary-500 opacity-90 rotate-2 scale-105 cursor-grabbing">
                                    <p className="font-bold text-lg">{activeCard.content}</p>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}

                {/* Completed View */}
                {ritual.retroStep === 'completed' && (
                    <div className="space-y-6 animate-fadeIn pb-12">
                        <div className="flex items-center gap-3 mb-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                            <Layers className="text-primary-600" size={24} />
                            <h2 className="text-xl font-bold text-primary-900">Sonuçlar ve Aksiyonlar</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedByVotes.map(card => (
                                <div key={card._id} className="bg-white rounded-xl p-6 shadow-sm border border-border-light relative overflow-hidden">
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-gray-100 rounded-bl-lg font-bold text-sm">{card.votes.length} Oy</div>
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${card.category === 'good' ? 'bg-success-500' : 'bg-danger-500'}`}></div>
                                    <p className="font-medium text-lg mb-4">{card.content}</p>
                                    {card.groupedCards?.length > 0 && (
                                        <div className="pl-4 border-l-2 border-gray-200 text-sm text-gray-500 space-y-1 mb-4">
                                            {card.groupedCards.map((g, i) => <p key={i}>• {g.content}</p>)}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => { setActionForm({ ...actionForm, title: card.content }); setActionModal(card._id); }}
                                        className="btn btn-secondary w-full"
                                    >
                                        Aksiyon Oluştur
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {actionModal && (
                <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setActionModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xl font-bold">Aksiyon Oluştur</h3>
                        </div>
                        <form onSubmit={handleCreateAction} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Aksiyon Başlığı</label>
                                <input className="form-input w-full" value={actionForm.title} onChange={e => setActionForm({ ...actionForm, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Atanan Kişi</label>
                                <select className="form-select w-full" value={actionForm.assignee} onChange={e => setActionForm({ ...actionForm, assignee: e.target.value })}>
                                    <option value="">Seçiniz</option>
                                    {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
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
