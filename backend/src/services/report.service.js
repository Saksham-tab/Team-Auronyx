const Report = require('../models/Report.model');
const AiService = require('../ai/ai.service');
const schemas = require('../validation/schemas.validation');
const StreamCore = require('../core/stream.core');
const SocketEmitter = require('../socket/socket.emitter');
const config = require('../config/env.config');
const logger = require('../utils/logger.util');

class ReportService {
    static getNoAiPredictions(sensorData) {
        const baseHealth = Math.max(0, Math.min(100, Math.round((sensorData.moisture + sensorData.humidity) / 2)));
        return {
            drynessPrediction: 'N/A',
            yieldPrediction: 'N/A',
            fieldHealthIndex: baseHealth,
            advisory: {
                recommendation: 'AI disabled. Manual monitoring mode is active.',
                reasons: ['Set DISABLE_AI=false to re-enable model inference']
            }
        };
    }

    /**
     * Start consuming sensor data stream
     */
    static startConsumer() {
        StreamCore.consume(config.streams.sensors, config.groups.reports, `consumer:${Math.random().toString(16).slice(3)}`, async (data) => {
            try {
                logger.info(`[Report Service] Processing sensor data`);

                // 1. Validate
                const { error, value } = schemas.sensorData.validate(data);
                if (error) {
                    logger.error(`[Report Service] Validation Error: ${error.message}`);
                    return;
                }

                const aiDisabled = ['true', '1', 'yes'].includes(String(process.env.DISABLE_AI || '').toLowerCase());
                const aiResults = aiDisabled
                    ? this.getNoAiPredictions(value)
                    : await AiService.processSensorData(value);

                // 3. Save Final Report to MongoDB
                const finalReport = new Report({
                    userId: value.userId || 'mqtt-global',
                    ...value,
                    ...aiResults
                });
                await finalReport.save();
                logger.info(`[Report Service] Report saved`);

                // 4. Emit real-time updates
                SocketEmitter.emitToAll('sensor:update', value);
                SocketEmitter.emitToAll('prediction:update', aiResults);

            } catch (err) {
                logger.error(`[Report Service] Error: ${err.message}`);
            }
        });
    }
}

module.exports = ReportService;
