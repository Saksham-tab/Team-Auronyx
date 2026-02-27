const mqtt = require('mqtt');
require('dotenv').config({ path: '../../.env' });

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const STATUS = process.env.TEST_PUMP_STATUS || 'running';
const STATUS_TOPIC = process.env.MQTT_TOPIC_PUMP_STATUS || 'farm/pump/status';

const allowed = new Set(['running', 'stopped', 'error']);
if (!allowed.has(STATUS)) {
  console.error('TEST_PUMP_STATUS must be one of: running, stopped, error');
  process.exit(1);
}

const client = mqtt.connect(MQTT_URL);

client.on('connect', () => {
  const payload = {
    status: STATUS,
    timestamp: new Date().toISOString(),
  };

  client.publish(STATUS_TOPIC, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error('Publish failed:', err.message);
      process.exit(1);
    }
    console.log(`Published pump status payload to ${STATUS_TOPIC}`);
    process.exit(0);
  });
});

client.on('error', (err) => {
  console.error('MQTT error:', err.message);
  process.exit(1);
});
