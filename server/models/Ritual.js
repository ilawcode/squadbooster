import mongoose from 'mongoose';

const ritualSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['planning', 'review', 'retro', 'daily', 'grooming', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        default: 60
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    }],
    notes: {
        type: String,
        trim: true
    },
    retroStep: {
        type: String,
        enum: ['input', 'group', 'vote', 'completed'],
        default: 'input'
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed'],
        default: 'scheduled'
    },
    createdBy: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Ritual', ritualSchema);
