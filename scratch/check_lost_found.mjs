import mongoose from 'mongoose';
import LostAndFound from '../models/LostAndFound.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const count = await LostAndFound.countDocuments();
        console.log('Total LostAndFound items:', count);
        const items = await LostAndFound.find().limit(5);
        console.log('Sample items:', JSON.stringify(items, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDB();
