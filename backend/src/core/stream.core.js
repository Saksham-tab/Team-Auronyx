const redis = require('../config/redis.config');
const config = require('../config/env.config');
const logger = require('../utils/logger.util');

/**
 * Handles Redis Stream operations (Publisher-Subscriber)
 */
const StreamCore = {
    /**
     * Publish a message to the Redis Stream
     * @param {string} stream - Stream name
     * @param {object} data - Data to publish
     */
    async publish(stream, data) {
        try {
            const payload = JSON.stringify(data);
            await redis.xadd(stream, '*', 'data', payload);
            logger.debug(`[Redis Stream] Published to ${stream}`);
        } catch (err) {
            logger.error(`[Redis Stream] Publish Error: ${err.message}`);
        }
    },

    /**
     * Start a consumer for a Redis Stream
     * @param {string} stream - Stream name
     * @param {string} group - Consumer group name
     * @param {string} consumer - Consumer name
     * @param {function} handler - Message handler function
     */
    async consume(stream, group, consumer, handler) {
        // Ensure consumer group exists
        try {
            await redis.xgroup('CREATE', stream, group, '0', 'MKSTREAM');
        } catch (err) {
            if (!err.message.includes('BUSYGROUP')) {
                logger.error(`[Redis Stream] Group Create Error: ${err.message}`);
            }
        }

        logger.info(`[Redis Stream] Consumer ${consumer} started for ${group} on ${stream}`);

        // Polling loop
        while (true) {
            try {
                // Read new messages ('>')
                const results = await redis.xreadgroup('GROUP', group, consumer, 'BLOCK', 5000, 'COUNT', 1, 'STREAMS', stream, '>');

                if (results) {
                    const [streamName, messages] = results[0];
                    for (const [id, [fieldName, fieldValue]] of messages) {
                        const data = JSON.parse(fieldValue);

                        // Process message
                        await handler(data);

                        // Acknowledge message
                        await redis.xack(stream, group, id);
                    }
                }
            } catch (err) {
                logger.error(`[Redis Stream] Consume Error: ${err.message}`);
                // Small delay on error to prevent spinning
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
};

module.exports = StreamCore;
