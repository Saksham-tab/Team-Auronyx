const mqtt = require('mqtt');
require('dotenv').config({ path: '../../.env' });

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const TOPIC = process.env.MQTT_TOPIC_SENSOR || 'feild/live_dashboard';

const client = mqtt.connect(MQTT_URL);

client.on('connect', () => {
    console.log(`✅ Connected to MQTT Broker at ${MQTT_URL}`);
    console.log(`📡 Starting continuous sensor data simulation for topic: ${TOPIC}`);

    setInterval(() => {
        const payload = {
            moisture: Math.floor(Math.random() * 60) + 20, // 20-80%
            temperature: Math.floor(Math.random() * 15) + 20, // 20-35 C
            humidity: Math.floor(Math.random() * 30) + 40, // 40-70%
            timestamp: new Date().toISOString()
        };

        client.publish(TOPIC, JSON.stringify(payload), { qos: 1 });
        console.log(`📤 [${new Date().toLocaleTimeString()}] Published:`, payload);
    }, 5000); // Send every 5 seconds
});

client.on('error', (err) => {
    console.error('❌ MQTT Error:', err.message);
});
