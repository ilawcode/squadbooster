import express from 'express';
import RetroCard from '../models/RetroCard.js';
import Ritual from '../models/Ritual.js';

const router = express.Router();

// Get cards for a ritual
router.get('/:ritualId/cards', async (req, res) => {
    try {
        const cards = await RetroCard.find({ ritual: req.params.ritualId });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new card
router.post('/:ritualId/cards', async (req, res) => {
    const card = new RetroCard({
        ritual: req.params.ritualId,
        content: req.body.content,
        category: req.body.category,
        createdBy: req.body.createdBy
    });

    try {
        const newCard = await card.save();
        res.status(201).json(newCard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Vote for a card
router.post('/cards/:cardId/vote', async (req, res) => {
    try {
        const { userName } = req.body;
        const card = await RetroCard.findById(req.params.cardId);

        if (!card) return res.status(404).json({ message: 'Kart bulunamadı' });

        // Toggle vote
        if (card.votes.includes(userName)) {
            card.votes = card.votes.filter(v => v !== userName);
        } else {
            card.votes.push(userName);
        }

        await card.save();
        res.json(card);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update ritual step
router.patch('/:ritualId/step', async (req, res) => {
    try {
        const ritual = await Ritual.findById(req.params.ritualId);
        if (!ritual) return res.status(404).json({ message: 'Ritüel bulunamadı' });

        ritual.retroStep = req.body.step;
        await ritual.save();
        res.json(ritual);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Group cards (Merging `sourceCard` into `targetCard`)
router.post('/cards/group', async (req, res) => {
    try {
        const { targetCardId, sourceCardId } = req.body;

        const targetCard = await RetroCard.findById(targetCardId);
        const sourceCard = await RetroCard.findById(sourceCardId);

        if (!targetCard || !sourceCard) {
            return res.status(404).json({ message: 'Kartlar bulunamadı' });
        }

        // Add source card content to target card's grouped list
        targetCard.groupedCards.push({
            content: sourceCard.content,
            originalId: sourceCard._id
        });

        targetCard.isGroupHeader = true;

        // Delete the source card as it's now inside the target
        await sourceCard.deleteOne();
        await targetCard.save();

        res.json(targetCard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a card
router.delete('/cards/:cardId', async (req, res) => {
    try {
        const card = await RetroCard.findById(req.params.cardId);
        if (!card) return res.status(404).json({ message: 'Kart bulunamadı' });

        // Optional: Check if user owns the card or is admin (skipped for MVP)

        await card.deleteOne();
        res.json({ message: 'Kart silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
