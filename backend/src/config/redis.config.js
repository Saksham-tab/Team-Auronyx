const Redis = require('ioredis');
const config = require('./env.config');
const logger = require('../utils/logger.util');

const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redis.on('connect', () => logger.info('✅ Redis Connected'));
redis.on('error', (err) => logger.error(`❌ Redis Error: ${err.message}`));

module.exports = redis;
