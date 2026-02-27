const MqttCore = require('../core/mqtt.core');
const config = require('../config/env.config');
const logger = require('../utils/logger.util');

class SowingService {
    static async publishSowingDate(cropType, sowingDate) {
        const topic = config.mqtt.topics.sowingDate;
        const mqttPayload = {
            sowing_date: sowingDate
        };

        logger.info(`[Sowing Service] Publishing sowing date to topic=${topic}`);
        logger.info(`[MQTT][SOWING][OUT] topic=${topic} payload=${JSON.stringify(mqttPayload)}`);
        console.log(`[MQTT][SOWING][OUT] topic=${topic} payload=${JSON.stringify(mqttPayload)}`);
        await MqttCore.publishAsync(topic, mqttPayload, { qos: 1, retain: true });
        logger.info(`[MQTT][SOWING][ACK] topic=${topic} payload=${JSON.stringify(mqttPayload)}`);
        console.log(`[MQTT][SOWING][ACK] topic=${topic} payload=${JSON.stringify(mqttPayload)}`);
        return mqttPayload;
    }
}

module.exports = SowingService;
