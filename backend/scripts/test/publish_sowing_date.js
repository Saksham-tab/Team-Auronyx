const mqtt = require('mqtt');
require('dotenv').config({ path: '../../.env' });

const CROP_TYPE = process.env.TEST_CROP_TYPE || 'Wheat';
const SOWING_DATE = process.env.TEST_SOWING_DATE || new Date().toISOString().slice(0, 10);
const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const SOWING_TOPIC = process.env.MQTT_TOPIC_SOWING_DATE || 'feild/sowing_date';

const validDate = /^\d{4}-\d{2}-\d{2}$/.test(SOWING_DATE);
if (!validDate) {
  console.error('TEST_SOWING_DATE must be in YYYY-MM-DD format');
  process.exit(1);
}

const client = mqtt.connect(MQTT_URL);

client.on('connect', () => {
  const payload = {
    cropType: CROP_TYPE,
    sowingDate: SOWING_DATE,
    timestamp: new Date().toISOString(),
  };

  client.publish(SOWING_TOPIC, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error('Publish failed:', err.message);
      process.exit(1);
    }
    console.log(`Published sowing date payload to ${SOWING_TOPIC}:`, payload);
    process.exit(0);
  });
});

client.on('error', (err) => {
  console.error('MQTT error:', err.message);
  process.exit(1);
});
