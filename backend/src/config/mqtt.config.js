const mqtt = require('mqtt');
const config = require('./env.config');
const logger = require('../utils/logger.util');

const client = mqtt.connect(config.mqtt.url, {
    clean: true,
    reconnectPeriod: 1000,
});

client.on('connect', () => {
    logger.info('[MQTT] Connected');
    console.log(`[MQTT] Connected to broker: ${config.mqtt.url}`);
    // Subscribing to wildcards will be handled in the core layer
});

client.on('error', (err) => {
    logger.error(`[MQTT] Error: ${err.message}`);
});

client.on('reconnect', () => {
    logger.info('[MQTT] Reconnecting...');
});

module.exports = client;
