import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        trim: true,
        default: 'Team Member'
    },
    color: {
        type: String,
        default: '#6366f1'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('Member', memberSchema);
