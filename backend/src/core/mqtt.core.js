const mqttClient = require('../config/mqtt.config');
const StreamCore = require('./stream.core');
const config = require('../config/env.config');
const logger = require('../utils/logger.util');

function previewPayload(raw, maxLen = 600) {
    if (raw.length <= maxLen) return raw;
    return `${raw.slice(0, maxLen)}... [truncated ${raw.length - maxLen} chars]`;
}

/**
 * Handles MQTT subscriptions and publishes, bridging to Redis Streams.
 */
const MqttCore = {
    init() {
        // Subscribe to all relevant topics
        const subTopics = [
            config.mqtt.topics.sensorData,
            config.mqtt.topics.anomaly,
            config.mqtt.topics.pumpStatus
        ];

        mqttClient.subscribe(subTopics, (err) => {
            if (!err) {
                logger.info(`[MQTT] Subscribed to: ${subTopics.join(', ')}`);
            } else {
                logger.error(`[MQTT] Subscription Error: ${err.message}`);
            }
        });

        // Handle incoming messages
        mqttClient.on('message', async (topic, message) => {
            const rawMessage = message.toString();
            logger.info(`[MQTT][IN] topic=${topic} raw=${previewPayload(rawMessage)}`);

            try {
                const payload = JSON.parse(rawMessage);
                logger.info(`[MQTT][IN] parsed=${JSON.stringify(payload)}`);

                // Bridge to Redis Streams
                if (topic === config.mqtt.topics.sensorData) {
                    await StreamCore.publish(config.streams.sensors, payload);
                } else if (topic === config.mqtt.topics.anomaly) {
                    await StreamCore.publish(config.streams.anomalies, payload);
                } else if (topic === config.mqtt.topics.pumpStatus) {
                    await StreamCore.publish(config.streams.pump, payload);
                }

            } catch (err) {
                logger.error(`[MQTT] Message Parse Error: ${err.message} | Payload: ${message.toString()}`);
            }
        });
    },

    /**
     * Publish a message to MQTT
     * @param {string} topic - MQTT Topic
     * @param {object} data - Data to publish
     */
    publish(topic, data, options = { qos: 1 }) {
        mqttClient.publish(topic, JSON.stringify(data), options, (err) => {
            if (err) {
                logger.error(`[MQTT] Publish Error: ${err.message} on ${topic}`);
            } else {
                logger.debug(`[MQTT] Published to ${topic}`);
            }
        });
    },

    /**
     * Publish a message and wait for MQTT callback (ack/error).
     * @param {string} topic - MQTT Topic
     * @param {object} data - Data to publish
     * @param {object} options - MQTT publish options (qos, retain, etc.)
     * @returns {Promise<void>}
     */
    publishAsync(topic, data, options = { qos: 1 }) {
        return new Promise((resolve, reject) => {
            mqttClient.publish(topic, JSON.stringify(data), options, (err) => {
                if (err) {
                    logger.error(`[MQTT] Publish Error: ${err.message} on ${topic}`);
                    return reject(err);
                }
                if (topic === config.mqtt.topics.sowingDate) {
                    console.log(`[MQTT][SOWING][PUB] topic=${topic} payload=${JSON.stringify(data)} qos=${options?.qos ?? 0} retain=${options?.retain ?? false}`);
                }
                logger.info(`[MQTT] Published to ${topic}`);
                resolve();
            });
        });
    }
};

module.exports = MqttCore;
