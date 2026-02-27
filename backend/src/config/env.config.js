require('dotenv').config();

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5001,
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/irrigation_db'
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || null,
        streamName: 'iot:sensor:stream'
    },
    mqtt: {
        url: process.env.MQTT_URL || 'mqtt://localhost:1883',
        username: process.env.MQTT_USERNAME || null,
        password: process.env.MQTT_PASSWORD || null,
        clientId: `backend_${Math.random().toString(16).slice(3)}`,
        topics: {
            sensorData: process.env.MQTT_TOPIC_SENSOR || 'feild/live_dashboard',
            anomaly: process.env.MQTT_TOPIC_ANOMALY || 'farm/anomaly',
            pumpControl: process.env.MQTT_TOPIC_PUMP_CONTROL || 'farm/pump/control',
            pumpStatus: process.env.MQTT_TOPIC_PUMP_STATUS || 'farm/pump/status',
            sowingDate: process.env.MQTT_TOPIC_SOWING_DATE || 'feild/sowing_date'
        }
    },
    app: {
        publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5001}`
    },
    streams: {
        sensors: process.env.REDIS_STREAM_SENSORS || 'stream:sensors',
        anomalies: process.env.REDIS_STREAM_ANOMALIES || 'stream:anomalies',
        pump: process.env.REDIS_STREAM_PUMP || 'stream:pump'
    },
    groups: {
        reports: process.env.REDIS_GROUP_REPORTS || 'group:reports',
        anomalies: process.env.REDIS_GROUP_ANOMALIES || 'group:anomalies',
        pump: process.env.REDIS_GROUP_PUMP || 'group:pump'
    },
    storage: {
        imageDir: process.env.IMAGE_STORAGE_DIR || './storage/anomalies'
    }
};

module.exports = config;
