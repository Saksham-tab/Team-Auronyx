const MqttCore = require('../core/mqtt.core');
const StreamCore = require('../core/stream.core');
const schemas = require('../validation/schemas.validation');
const SocketEmitter = require('../socket/socket.emitter');
const config = require('../config/env.config');
const logger = require('../utils/logger.util');

class PumpService {
    /**
     * Trigger pump control via MQTT
     */
    static async controlPump(action) {
        logger.info(`[Pump Service] Sending control ${action}`);
        const topic = config.mqtt.topics.pumpControl;
        MqttCore.publish(topic, { action, timestamp: new Date().toISOString() });
    }

    /**
     * Start consuming pump status stream (Ack from Pi)
     */
    static startConsumer() {
        StreamCore.consume(config.streams.pump, config.groups.pump, `consumer:${Math.random().toString(16).slice(3)}`, async (data) => {
            try {
                const { error, value } = schemas.pumpStatus.validate(data);
                if (error) return;

                logger.info(`[Pump Service] Status update: ${value.status}`);

                // Emit to frontend
                SocketEmitter.emitToAll('pump:update', value);

            } catch (err) {
                logger.error(`[Pump Service] Stream Error: ${err.message}`);
            }
        });
    }
}

module.exports = PumpService;
