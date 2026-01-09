import express from 'express';
import Action from '../models/Action.js';

const router = express.Router();

// Get all actions
router.get('/', async (req, res) => {
    try {
        const actions = await Action.find()
            .populate('assignee')
            .populate('ritual')
            .sort({ createdAt: -1 });
        res.json(actions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get action by ID
router.get('/:id', async (req, res) => {
    try {
        const action = await Action.findById(req.params.id)
            .populate('assignee')
            .populate('ritual');
        if (!action) {
            return res.status(404).json({ message: 'Aksiyon bulunamadı' });
        }
        res.json(action);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create action
router.post('/', async (req, res) => {
    const action = new Action({
        title: req.body.title,
        description: req.body.description,
        assignee: req.body.assignee || null,
        dueDate: req.body.dueDate,
        status: req.body.status || 'todo',
        priority: req.body.priority || 'medium',
        ritual: req.body.ritual || null,
        createdBy: req.body.createdBy
    });

    try {
        const newAction = await action.save();
        const populatedAction = await Action.findById(newAction._id)
            .populate('assignee')
            .populate('ritual');
        res.status(201).json(populatedAction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update action
router.patch('/:id', async (req, res) => {
    try {
        const action = await Action.findById(req.params.id);
        if (!action) {
            return res.status(404).json({ message: 'Aksiyon bulunamadı' });
        }

        const allowedUpdates = ['title', 'description', 'assignee', 'dueDate', 'status', 'priority', 'ritual'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                action[field] = req.body[field];
            }
        });

        const updatedAction = await action.save();
        const populatedAction = await Action.findById(updatedAction._id)
            .populate('assignee')
            .populate('ritual');
        res.json(populatedAction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete action
router.delete('/:id', async (req, res) => {
    try {
        const action = await Action.findById(req.params.id);
        if (!action) {
            return res.status(404).json({ message: 'Aksiyon bulunamadı' });
        }
        await action.deleteOne();
        res.json({ message: 'Aksiyon silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get actions by status
router.get('/status/:status', async (req, res) => {
    try {
        const actions = await Action.find({ status: req.params.status })
            .populate('assignee')
            .populate('ritual')
            .sort({ createdAt: -1 });
        res.json(actions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get actions by assignee
router.get('/assignee/:assigneeId', async (req, res) => {
    try {
        const actions = await Action.find({ assignee: req.params.assigneeId })
            .populate('assignee')
            .populate('ritual')
            .sort({ createdAt: -1 });
        res.json(actions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
