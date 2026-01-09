import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import actionRoutes from './routes/actions.js';
import memberRoutes from './routes/members.js';
import ritualRoutes from './routes/rituals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/actions', actionRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/rituals', ritualRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/squadbooster')
    .then(() => {
        console.log('✅ MongoDB bağlantısı başarılı');
        app.listen(PORT, () => {
            console.log(`🚀 Server ${PORT} portunda çalışıyor`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB bağlantı hatası:', error);
    });

export default app;
