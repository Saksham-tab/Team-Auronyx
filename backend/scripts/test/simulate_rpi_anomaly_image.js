const mqtt = require('mqtt');
require('dotenv').config({ path: '../../.env' });

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const ANOMALY_TOPIC = process.env.MQTT_TOPIC_ANOMALY || 'farm/anomaly';
const TEST_IMAGE_BASE64 = process.env.TEST_IMAGE_BASE64;

if (!TEST_IMAGE_BASE64) {
  console.error('Missing TEST_IMAGE_BASE64 in environment.');
  process.exit(1);
}

const client = mqtt.connect(MQTT_URL);

client.on('connect', () => {
  const payload = {
    type: 'Pest Detection',
    severity: 'high',
    confidence: 0.92,
    imageBase64: TEST_IMAGE_BASE64,
    timestamp: new Date().toISOString(),
  };

  client.publish(ANOMALY_TOPIC, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error('Publish failed:', err.message);
      process.exit(1);
    }
    console.log(`Published anomaly image payload to ${ANOMALY_TOPIC}`);
    process.exit(0);
  });
});

client.on('error', (err) => {
  console.error('MQTT error:', err.message);
  process.exit(1);
});
