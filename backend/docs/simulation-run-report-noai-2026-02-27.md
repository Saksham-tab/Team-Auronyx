# Simulation Run Report (No-AI Mode)

Date: 2026-02-27  
Backend instance: `PORT=5006`, `DISABLE_AI=true`  
Test user: `qa_noai_003`

## Objective
- Run MQTT/API simulation scripts.
- Confirm end-to-end flow.
- Persist report records in MongoDB **without AI model execution**.

## Scripts Executed
1. `node scripts/test/simulate_rpi_anomaly_image.js`  
Result: Success  
Output: Published anomaly image payload to `farm/qa_noai_003/anomaly`

2. `node scripts/test/simulate_rpi_pump_status.js`  
Result: Success  
Output: Published pump status payload to `farm/qa_noai_003/pump/status`

3. `node scripts/test/publish_sowing_date.js`  
Result: Success  
Output: Published sowing date payload to `farm/qa_noai_003/sowing-date`

4. `node scripts/test/simulate_backend_pump_control_ws.js`  
Result: Failed  
Output: `MQTT WS error:`  
Note: MQTT WebSocket endpoint (`ws://localhost:9001/mqtt`) is not available/reachable in this run.

5. `node scripts/test/simulate_iot.js` with:
- `API_URL=http://localhost:5006/api`
- `SOCKET_URL=http://localhost:5006`
- `TEST_IMAGE_BASE64` set
  
Result: Success (core flow)  
Verified from output:
- Socket connected
- Sensor published
- Anomaly published
- Pump control API returned success
- Pump status updates received on socket
- Prediction payload received with no-AI fallback values

## MongoDB Verification
Query target: user `qa_noai_003`

- `reportCount`: **1**
- `anomalyCount`: **4**

Latest `Report` document:
- `drynessPrediction: "N/A"`
- `yieldPrediction: "N/A"`
- `fieldHealthIndex: 35`
- `advisory.recommendation: "AI disabled. Manual monitoring mode is active."`

This confirms reports are saved while bypassing AI model inference.

## Backend Log Evidence
From `backend/noai-run.log`:
- `Server running on port 5006`
- `Report Service Processing data for user: qa_noai_003`
- `Report Service Report saved for qa_noai_003`
- No AI model error lines for this run.

## Conclusion
- End-to-end simulation flow worked.
- MongoDB persistence worked for report and anomaly data.
- No-AI mode for report generation is active and verified.
- Only remaining non-passing path is MQTT-over-WebSocket pump script due unavailable WS broker endpoint.

