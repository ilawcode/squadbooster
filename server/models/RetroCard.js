import mongoose from 'mongoose';

const retroCardSchema = new mongoose.Schema({
    ritual: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ritual',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String, // 'good' or 'bad'
        required: true,
        enum: ['good', 'bad']
    },
    votes: [{
        type: String // user names or IDs who voted
    }],
    isGroupHeader: {
        type: Boolean,
        default: false
    },
    groupedCards: [{
        content: String,
        originalId: mongoose.Schema.Types.ObjectId
    }],
    createdBy: {
        type: String, // For backend tracking, theoretically this user name
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('RetroCard', retroCardSchema);
