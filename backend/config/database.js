const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;

        if (!mongoUri) {
            throw new Error('MONGODB_URI or MONGO_URL environment variable is required');
        }

        const conn = await mongoose.connect(mongoUri);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDatabase;
