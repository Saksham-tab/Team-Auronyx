const { spawn } = require('child_process');
const path = require('path');
const logger = require('../utils/logger.util');
const redis = require('../config/redis.config');

/**
 * Service to execute AI models via Python child processes.
 */
class AiService {
    static _yieldQueue = Promise.resolve();

    /**
     * Run an AI model script
     * @param {string} scriptName - Name of the script in scripts/ai/
     * @param {object} inputData - JSON input data for the model
     * @returns {Promise<object>} - Parsed JSON result from stdout
     */
    static async runModel(scriptName, inputData) {
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(__dirname, '../../scripts/ai', scriptName);
            const pythonProcess = spawn('python', [scriptPath, JSON.stringify(inputData)]);

            let stdoutData = '';
            let stderrData = '';

            pythonProcess.stdout.on('data', (data) => {
                stdoutData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    logger.error(`[AI Service] ${scriptName} failed with code ${code}. Error: ${stderrData}`);
                    return reject(new Error(`AI Model ${scriptName} execution failed`));
                }

                try {
                    const result = JSON.parse(stdoutData);
                    resolve(result);
                } catch (err) {
                    logger.error(`[AI Service] Failed to parse JSON from ${scriptName}: ${stdoutData}`);
                    reject(new Error('Invalid output format from AI model'));
                }
            });
        });
    }

    /**
     * Run current yield model (scripts/ai/yeild/main.py) without changing its core code.
     * Flow:
     * 1) Write required input snapshot to Redis key: latest_farm_data
     * 2) Spawn yeild/main.py (it reads latest_farm_data and writes latest_yield_prediction)
     * 3) Read latest_yield_prediction from Redis and return normalized shape
     */
    static async runYieldModelFromRedis(inputData) {
        const run = async () => {
            const farmData = {
                Cumulative_Rainfall: Number(inputData.rainfall ?? 100.0),
                Average_Temperature: Number(inputData.temperature ?? 25.0),
                Average_Soil_Moisture: Number(inputData.moisture ?? 50.0),
                Average_Humidity: Number(inputData.humidity ?? 50.0),
                Average_Wind_Speed: Number(inputData.wind_speed ?? 10.0)
            };

            await redis.set('latest_farm_data', JSON.stringify(farmData));

            await new Promise((resolve, reject) => {
                const scriptPath = path.join(__dirname, '../../scripts/ai/yeild/main.py');
                const pythonProcess = spawn('python', [scriptPath]);

                let stderrData = '';
                let stdoutData = '';

                pythonProcess.stdout.on('data', (data) => {
                    stdoutData += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    stderrData += data.toString();
                });

                pythonProcess.on('close', (code) => {
                    if (code !== 0) {
                        logger.error(`[AI Service] yeild/main.py failed with code ${code}. Error: ${stderrData}`);
                        return reject(new Error('Yield model execution failed'));
                    }

                    if (stdoutData.trim()) {
                        logger.info(`[AI Service] Yield model output: ${stdoutData.trim()}`);
                    }
                    resolve();
                });
            });

            const predictionRaw = await redis.get('latest_yield_prediction');
            if (!predictionRaw) {
                throw new Error('Yield model did not write latest_yield_prediction');
            }

            const parsed = JSON.parse(predictionRaw);
            return {
                prediction: parsed.predicted_yield_ton_per_hectare ?? 0
            };
        };

        // Serialize yield runs to avoid race conditions on shared Redis keys.
        this._yieldQueue = this._yieldQueue.then(run, run);
        return this._yieldQueue;
    }

    /**
     * Process full sensor data through all AI modules
     */
    static async processSensorData(data) {
        try {
            logger.info('[AI Service] Processing sensor data');

            // Run models in parallel (or sequential if dependencies exist)
            const [dryness, yieldPred, health, advisory] = await Promise.all([
                this.runModel('dryness_prediction.py', data),
                this.runYieldModelFromRedis(data),
                this.runModel('health_index.py', data),
                this.runModel('advisory_adapter.py', data)
            ]);

            return {
                drynessPrediction: dryness.prediction,
                yieldPrediction: yieldPred.prediction,
                fieldHealthIndex: health.index,
                advisory: advisory
            };
        } catch (err) {
            logger.error(`[AI Service] Sensor processing failed: ${err.message}`);
            throw err;
        }
    }
}

module.exports = AiService;
