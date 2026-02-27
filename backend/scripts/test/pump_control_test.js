const axios = require('axios');
const mqtt = require('mqtt');
const { io } = require('socket.io-client');
require('dotenv').config({ path: '../../.env' });

/**
 * PUMP CONTROL END-TO-END TEST
 * ----------------------------
 * 1. Listen for MQTT command (replicate Pi)
 * 2. Connect via Socket.io (replicate Frontend)
 * 3. Send Control Command via API (replicate Frontend)
 * 4. Respond with Status via MQTT (replicate Pi)
 */

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const API_URL = process.env.API_URL || 'http://localhost:5001/api';
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:5001';

const CONTROL_TOPIC = process.env.MQTT_TOPIC_PUMP_CONTROL || 'farm/pump/control';
const STATUS_TOPIC = process.env.MQTT_TOPIC_PUMP_STATUS || 'farm/pump/status';

async function runPumpTest() {
    console.log('🚀 Starting Motor/Pump Control Cycle Test...');

    // A. Replicate Raspberry Pi (MQTT Listener)
    const piClient = mqtt.connect(MQTT_URL);
    piClient.on('connect', () => {
        console.log('📱 [Pi Mock] Connected to MQTT');
        piClient.subscribe(CONTROL_TOPIC);
    });

    piClient.on('message', (topic, message) => {
        if (topic === CONTROL_TOPIC) {
            const cmd = JSON.parse(message.toString());
            console.log(`📥 [Pi Mock] Received MQTT Command: ${cmd.action}`);

            // Replicate hardware delay and ACK
            setTimeout(() => {
                const status = cmd.action === 'ON' ? 'running' : 'stopped';
                piClient.publish(STATUS_TOPIC, JSON.stringify({
                    status: status,
                    timestamp: new Date().toISOString()
                }));
                console.log(`📤 [Pi Mock] Sent Status Ack: ${status}`);
            }, 1000);
        }
    });

    // B. Replicate Frontend Socket Listener
    const socket = io(SOCKET_URL);
    socket.on('connect', () => console.log('🌐 [Frontend Mock] Socket connected'));
    socket.on('pump:update', (data) => {
        console.log('🔔 [Frontend Mock] RECEIVED SOCKET ALERT:', data);
        console.log('✅ Cycle Complete!');
    });

    // Wait for setup
    await new Promise(r => setTimeout(r, 2000));

    // C. Trigger Cycle (Turn ON)
    console.log('\n--- Action: Turning Pump ON ---');
    try {
        await axios.post(`${API_URL}/pump/control`, { action: 'ON' });
        console.log('📡 [Frontend Mock] API Call Sent: ON');
    } catch (err) {
        console.error('❌ API Error:', err.message);
    }

    // Wait some time
    await new Promise(r => setTimeout(r, 5000));

    // D. Trigger Cycle (Turn OFF)
    console.log('\n--- Action: Turning Pump OFF ---');
    try {
        await axios.post(`${API_URL}/pump/control`, { action: 'OFF' });
        console.log('📡 [Frontend Mock] API Call Sent: OFF');
    } catch (err) {
        console.error('❌ API Error:', err.message);
    }

    setTimeout(() => {
        console.log('\n🏁 Motor Test Sequence Finished.');
        process.exit(0);
    }, 5000);
}

runPumpTest().catch(console.error);
