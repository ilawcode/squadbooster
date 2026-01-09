import express from 'express';
import Ritual from '../models/Ritual.js';

const router = express.Router();

// Get all rituals
router.get('/', async (req, res) => {
    try {
        const rituals = await Ritual.find()
            .populate('participants')
            .sort({ date: -1 });
        res.json(rituals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get ritual by ID
router.get('/:id', async (req, res) => {
    try {
        const ritual = await Ritual.findById(req.params.id)
            .populate('participants');
        if (!ritual) {
            return res.status(404).json({ message: 'Ritüel bulunamadı' });
        }
        res.json(ritual);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create ritual
router.post('/', async (req, res) => {
    const ritual = new Ritual({
        name: req.body.name,
        type: req.body.type || 'other',
        description: req.body.description,
        date: req.body.date,
        duration: req.body.duration || 60,
        participants: req.body.participants || [],
        notes: req.body.notes,
        status: req.body.status || 'scheduled',
        createdBy: req.body.createdBy
    });

    try {
        const newRitual = await ritual.save();
        const populatedRitual = await Ritual.findById(newRitual._id)
            .populate('participants');
        res.status(201).json(populatedRitual);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update ritual
router.patch('/:id', async (req, res) => {
    try {
        const ritual = await Ritual.findById(req.params.id);
        if (!ritual) {
            return res.status(404).json({ message: 'Ritüel bulunamadı' });
        }

        const allowedUpdates = ['name', 'type', 'description', 'date', 'duration', 'participants', 'notes', 'status'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                ritual[field] = req.body[field];
            }
        });

        const updatedRitual = await ritual.save();
        const populatedRitual = await Ritual.findById(updatedRitual._id)
            .populate('participants');
        res.json(populatedRitual);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete ritual
router.delete('/:id', async (req, res) => {
    try {
        const ritual = await Ritual.findById(req.params.id);
        if (!ritual) {
            return res.status(404).json({ message: 'Ritüel bulunamadı' });
        }
        await ritual.deleteOne();
        res.json({ message: 'Ritüel silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get rituals by type
router.get('/type/:type', async (req, res) => {
    try {
        const rituals = await Ritual.find({ type: req.params.type })
            .populate('participants')
            .sort({ date: -1 });
        res.json(rituals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get upcoming rituals
router.get('/upcoming/list', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rituals = await Ritual.find({
            date: { $gte: today },
            status: { $ne: 'completed' }
        })
            .populate('participants')
            .sort({ date: 1 })
            .limit(10);
        res.json(rituals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
