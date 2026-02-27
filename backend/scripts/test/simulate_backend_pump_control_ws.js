const mqtt = require('mqtt');
require('dotenv').config({ path: '../../.env' });

const MQTT_WS_URL = process.env.MQTT_WS_URL || 'ws://localhost:9001/mqtt';
const CONTROL_TOPIC = process.env.MQTT_TOPIC_PUMP_CONTROL || 'farm/pump/control';
const STATUS_TOPIC = process.env.MQTT_TOPIC_PUMP_STATUS || 'farm/pump/status';
const ACTION = process.env.TEST_PUMP_ACTION || 'ON';
const SEND_ACK = (process.env.TEST_SEND_ACK || 'true').toLowerCase() === 'true';

if (!['ON', 'OFF'].includes(ACTION)) {
  console.error('TEST_PUMP_ACTION must be ON or OFF');
  process.exit(1);
}

const client = mqtt.connect(MQTT_WS_URL, {
  username: process.env.MQTT_USERNAME || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
});

client.on('connect', () => {
  console.log(`Connected via MQTT WebSocket: ${MQTT_WS_URL}`);

  client.subscribe(CONTROL_TOPIC, { qos: 1 }, (subErr) => {
    if (subErr) {
      console.error('Subscribe failed:', subErr.message);
      process.exit(1);
    }

    const command = {
      action: ACTION,
      timestamp: new Date().toISOString(),
    };

    client.publish(CONTROL_TOPIC, JSON.stringify(command), { qos: 1 }, (pubErr) => {
      if (pubErr) {
        console.error('Publish failed:', pubErr.message);
        process.exit(1);
      }
      console.log(`Published command to ${CONTROL_TOPIC}:`, command);
    });
  });
});

client.on('message', (topic, message) => {
  if (topic !== CONTROL_TOPIC) return;
  const cmd = JSON.parse(message.toString());
  console.log('Pi-side received command:', cmd);

  if (!SEND_ACK) {
    setTimeout(() => process.exit(0), 500);
    return;
  }

  const statusPayload = {
    status: cmd.action === 'ON' ? 'running' : 'stopped',
    timestamp: new Date().toISOString(),
  };

  client.publish(STATUS_TOPIC, JSON.stringify(statusPayload), { qos: 1 }, (err) => {
    if (err) {
      console.error('Ack publish failed:', err.message);
      process.exit(1);
    }
    console.log(`Published ACK to ${STATUS_TOPIC}:`, statusPayload);
    setTimeout(() => process.exit(0), 500);
  });
});

client.on('error', (err) => {
  console.error('MQTT WS error:', err.message);
  process.exit(1);
});
