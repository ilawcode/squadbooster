import express from 'express';
import Member from '../models/Member.js';

const router = express.Router();

// Get all members
router.get('/', async (req, res) => {
    try {
        const members = await Member.find({ isActive: true }).sort({ name: 1 });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get member by ID
router.get('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Üye bulunamadı' });
        }
        res.json(member);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login or create member by name
router.post('/login', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'İsim gerekli' });
        }

        let member = await Member.findOne({ name: name.trim() });

        if (!member) {
            // Generate random color for new member
            const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            member = new Member({
                name: name.trim(),
                color: randomColor
            });
            await member.save();
        } else {
            member.lastLogin = Date.now();
            await member.save();
        }

        res.json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create member
router.post('/', async (req, res) => {
    const member = new Member({
        name: req.body.name,
        avatar: req.body.avatar || '',
        role: req.body.role || 'Team Member',
        color: req.body.color || '#6366f1'
    });

    try {
        const newMember = await member.save();
        res.status(201).json(newMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update member
router.patch('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Üye bulunamadı' });
        }

        const allowedUpdates = ['name', 'avatar', 'role', 'color', 'isActive'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                member[field] = req.body[field];
            }
        });

        const updatedMember = await member.save();
        res.json(updatedMember);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete member (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Üye bulunamadı' });
        }
        member.isActive = false;
        await member.save();
        res.json({ message: 'Üye deaktif edildi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
