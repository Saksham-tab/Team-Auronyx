const mqtt = require('mqtt');
const axios = require('axios');
const { io } = require('socket.io-client');

/**
 * PRODUCTION-GRADE TEST SUITE
 * This script simulates:
 * 1. Sensor Data Publish (MQTT)
 * 2. Anomaly Alert with Image (MQTT)
 * 3. Pump Control Trigger (REST API)
 * 4. Real-time Feedback (Socket.io)
 */

require('dotenv').config({ path: '../../.env' });

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const API_URL = process.env.API_URL || 'http://localhost:5001/api';
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:5001';
const TEST_IMAGE_BASE64 = process.env.TEST_IMAGE_BASE64;

async function runTest() {
    console.log('🚀 Starting End-to-End IoT Backend Test...');

    // 1. Connect MQTT (Agent simulator)
    const mqttClient = mqtt.connect(MQTT_URL);

    // 2. Connect Socket.io (Frontend simulator)
    const socket = io(SOCKET_URL);

    socket.on('connect', () => console.log('✅ Socket connected'));
    socket.on('sensor:update', (data) => console.log('📈 [Socket] Received sensor update:', data));
    socket.on('prediction:update', (data) => console.log('🔮 [Socket] Received AI prediction:', data));
    socket.on('anomaly:alert', (data) => console.log('🚨 [Socket] Received ANOMALY ALERT:', data));
    socket.on('pump:update', (data) => console.log('💧 [Socket] Pump status updated:', data));

    // Wait for connections
    await new Promise(r => setTimeout(r, 2000));

    // --- STEP 1: Simulate Sensor Data ---
    console.log('\n--- Step 1: Simulating Sensor Data ---');
    const sensorPayload = {
        moisture: 25.5,
        temperature: 31.0,
        humidity: 45.0,
        timestamp: new Date().toISOString()
    };
    mqttClient.publish(process.env.MQTT_TOPIC_SENSOR || 'feild/live_dashboard', JSON.stringify(sensorPayload));
    console.log('📤 Published sensor data to MQTT');

    // --- STEP 2: Simulate Anomaly with Real Base64 Image from env ---
    if (TEST_IMAGE_BASE64) {
        console.log('\n--- Step 2: Simulating Anomaly Event ---');
        const anomalyPayload = {
            type: 'Pest Detection',
            severity: 'high',
            confidence: 0.92,
            imageBase64: TEST_IMAGE_BASE64,
            timestamp: new Date().toISOString()
        };
        mqttClient.publish(process.env.MQTT_TOPIC_ANOMALY || 'farm/anomaly', JSON.stringify(anomalyPayload));
        console.log('📤 Published anomaly data to MQTT');
    } else {
        console.log('\n--- Step 2: Skipped (TEST_IMAGE_BASE64 not set) ---');
    }

    // --- STEP 3: Test Pump Control API ---
    console.log('\n--- Step 3: Testing Pump Control REST API ---');
    try {
        const res = await axios.post(`${API_URL}/pump/control`, {
            action: 'ON'
        });
        console.log('✅ API Response:', res.data);
    } catch (err) {
        console.error('❌ API Error:', err.response ? err.response.data : err.message);
    }

    // --- STEP 4: Simulate Pi Ack for Pump ---
    console.log('\n--- Step 4: Simulating Pi Pump Status Ack ---');
    const pumpStatusPayload = {
        status: 'running',
        timestamp: new Date().toISOString()
    };
    mqttClient.publish(process.env.MQTT_TOPIC_PUMP_STATUS || 'farm/pump/status', JSON.stringify(pumpStatusPayload));
    console.log('📤 Published pump status ack to MQTT');

    console.log('\n⌛ Waiting for workers to process events...');
    setTimeout(() => {
        console.log('\n🏁 Test complete. Check backend logs for processing details.');
        process.exit(0);
    }, 5000);
}

runTest().catch(console.error);
