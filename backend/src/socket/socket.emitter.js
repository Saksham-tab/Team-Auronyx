const logger = require('../utils/logger.util');

/**
 * Socket Emitter Layer - Decouples business logic from Socket.io instance
 */
class SocketEmitter {
    static io = null;
    static normalizeUserId(userId) {
        return String(userId || '').replace(/^user_/, '');
    }

    static setIo(ioInstance) {
        this.io = ioInstance;
    }

    /**
     * Emit event to a specific user (room)
     * @param {string} userId - User ID
     * @param {string} event - Event name
     * @param {object} data - Payload
     */
    static emitToUser(userId, event, data) {
        if (!this.io) {
            logger.warn(`[Socket Emitter] IO not initialized. Event ${event} dropped.`);
            return;
        }

        const normalizedUserId = this.normalizeUserId(userId);
        logger.debug(`[Socket Emitter] Emitting ${event} to room: user_${normalizedUserId}`);
        this.io.to(`user_${normalizedUserId}`).emit(event, data);
    }

    static emitToAll(event, data) {
        if (!this.io) {
            logger.warn(`[Socket Emitter] IO not initialized. Event ${event} dropped.`);
            return;
        }
        logger.debug(`[Socket Emitter] Emitting ${event} to all clients`);
        this.io.emit(event, data);
    }
}

module.exports = SocketEmitter;
