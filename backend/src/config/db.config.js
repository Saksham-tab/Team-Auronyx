const mongoose = require('mongoose');
const config = require('./env.config');
const logger = require('../utils/logger.util');

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodb.uri);
        logger.info('[DB] MongoDB Connected');
        return true;
    } catch (err) {
        logger.error(`[DB] MongoDB Connection Error: ${err.message}`);
        throw err;
    }
};

module.exports = connectDB;
