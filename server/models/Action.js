import mongoose from 'mongoose';

const actionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    dueDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'done'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    ritual: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ritual'
    },
    createdBy: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Action', actionSchema);
