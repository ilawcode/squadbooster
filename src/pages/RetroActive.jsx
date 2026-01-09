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
            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                {/* Header Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-light flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                        {/* Stepper Controls */}
                        {ritual.retroStep === 'input' && (
                            <button onClick={() => handleStepChange('group')} className="btn btn-primary w-full md:w-auto shadow-lg shadow-primary-500/20">
                                Gruplamaya Geç <ArrowRight size={18} />
                            </button>
                        )}
                        {ritual.retroStep === 'group' && (
                            <button onClick={() => handleStepChange('vote')} className="btn btn-primary w-full md:w-auto shadow-lg shadow-primary-500/20">
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

                {/* Content Area */}

                {/* STEP 1: INPUT */}
                {ritual.retroStep === 'input' && (
                    <div className="card p-8 border-2 border-primary-100 shadow-lg relative overflow-hidden bg-white">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500"></div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <MessageSquare className="text-primary-500" />
                            Fikirlerini Paylaş
                        </h3>

                        <form onSubmit={handleAddCard} className="max-w-3xl">
                            <div className="flex bg-bg-tertiary p-1.5 rounded-xl mb-6 w-fit gap-1">
                                <button
                                    type="button"
                                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${inputType === 'good' ? 'bg-white text-success-600 shadow-sm scale-105' : 'text-muted hover:text-text-primary'}`}
                                    onClick={() => setInputType('good')}
                                >
                                    🎉 İyi Gidenler
                                </button>
                                <button
                                    type="button"
                                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${inputType === 'bad' ? 'bg-white text-danger-600 shadow-sm scale-105' : 'text-muted hover:text-text-primary'}`}
                                    onClick={() => setInputType('bad')}
                                >
                                    🌵 Geliştirilmeli
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    className="form-input flex-1 h-12 text-lg shadow-sm"
                                    placeholder="Düşüncelerini buraya yaz..."
                                    value={newCardContent}
                                    onChange={(e) => setNewCardContent(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="btn btn-primary h-12 px-6 shadow-md shadow-primary-500/20 hover:scale-105 transition-transform">
                                    <Plus size={20} /> Ekle
                                </button>
                            </div>
                            <p className="text-sm text-muted mt-3 flex items-center gap-2 opacity-75 ml-1">
                                <span className="w-1.5 h-1.5 bg-success-500 rounded-full"></span>
                                Girişleriniz tamamen anonimdir, rahatça yazabilirsiniz.
                            </p>
                        </form>
                    </div>
                )}

                {/* BOARD VIEW (Input / Group / Vote) */}
                {ritual.retroStep !== 'completed' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Good Column */}
                        <div className="bg-success-50/40 p-6 rounded-3xl border border-success-100 min-h-[500px] shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-success-700 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center shadow-sm text-lg">🎉</span>
                                    İyi Gidenler
                                </h3>
                                <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-success-700 shadow-sm border border-success-100">{goodCards.length}</span>
                            </div>

                            <div className="space-y-3">
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
                                {goodCards.length === 0 && (
                                    <div className="text-center py-12 text-muted opacity-60 border-2 border-dashed border-success-200 rounded-xl bg-white/50">
                                        Henüz bu kategoriye giriş yapılmadı
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bad Column */}
                        <div className="bg-danger-50/40 p-6 rounded-3xl border border-danger-100 min-h-[500px] shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-danger-700 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center shadow-sm text-lg">🌵</span>
                                    Geliştirilmeli
                                </h3>
                                <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-danger-700 shadow-sm border border-danger-100">{badCards.length}</span>
                            </div>

                            <div className="space-y-3">
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
                                {badCards.length === 0 && (
                                    <div className="text-center py-12 text-muted opacity-60 border-2 border-dashed border-danger-200 rounded-xl bg-white/50">
                                        Henüz bu kategoriye giriş yapılmadı
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* COMPLETED / RESULTS VIEW */}
                {ritual.retroStep === 'completed' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-primary-900">Sonuçlar ve Aksiyonlar</h2>
                                <p className="text-sm text-primary-700">En çok oy alan fikirleri aksiyona dönüştürün.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedByVotes.map((card, index) => (
                                <div key={card._id} className="bg-white rounded-xl p-6 relative overflow-hidden group hover:shadow-lg transition-all border border-border-light hover:border-primary-200 flex flex-col h-full">
                                    <div className="absolute top-0 right-0 px-3 py-1.5 bg-bg-tertiary rounded-bl-xl font-bold text-sm text-text-secondary border-b border-l border-border-light z-10">
                                        {card.votes.length} Oy
                                    </div>
                                    <div className={`w-1.5 h-full absolute left-0 top-0 ${card.category === 'good' ? 'bg-success-500' : 'bg-danger-500'}`} />

                                    <div className="mb-6 pr-8 flex-1">
                                        <p className="font-medium text-lg leading-relaxed text-text-primary">{card.content}</p>
                                        {card.groupedCards && card.groupedCards.length > 0 && (
                                            <div className="mt-4 pl-4 border-l-2 border-primary-100 space-y-2 bg-primary-50/50 p-3 rounded-r-lg">
                                                {card.groupedCards.map((g, i) => (
                                                    <p key={i} className="text-sm text-muted italic flex items-start gap-2">
                                                        <span className="text-primary-400 mt-1">•</span>
                                                        {g.content}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setActionForm({ ...actionForm, title: card.content });
                                            setActionModal(card._id);
                                        }}
                                        className="btn btn-secondary w-full group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-200 transition-colors mt-auto"
                                    >
                                        <Layers size={16} /> Aksiyon Oluştur
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {actionModal && (
                <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setActionModal(null)}>
                    <div className="modal bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <div className="modal-header p-6 border-b border-border-light bg-bg-tertiary/50">
                            <h3 className="modal-title text-xl font-bold">Aksiyon Oluştur</h3>
                        </div>
                        <form onSubmit={handleCreateAction}>
                            <div className="modal-body p-6 space-y-4">
                                <div className="form-group">
                                    <label className="form-label block text-sm font-medium text-text-secondary mb-1">Aksiyon Başlığı</label>
                                    <input
                                        className="form-input w-full h-10 px-3 rounded-lg border border-border-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                        value={actionForm.title}
                                        onChange={e => setActionForm({ ...actionForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label block text-sm font-medium text-text-secondary mb-1">Atanan Kişi</label>
                                    <select
                                        className="form-select w-full h-10 px-3 rounded-lg border border-border-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
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
                            <div className="modal-footer p-6 border-t border-border-light flex justify-end gap-3 bg-bg-tertiary/30">
                                <button type="button" className="btn btn-ghost text-muted hover:text-text-primary px-4 py-2 rounded-lg" onClick={() => setActionModal(null)}>İptal</button>
                                <button type="submit" className="btn btn-primary px-6 py-2 shadow-md hover:shadow-lg transition-all">Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default RetroActive;
