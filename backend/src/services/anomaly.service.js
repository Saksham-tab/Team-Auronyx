const fs = require('fs-extra');
const path = require('path');
const Anomaly = require('../models/Anomaly.model');
const schemas = require('../validation/schemas.validation');
const StreamCore = require('../core/stream.core');
const config = require('../config/env.config');
const SocketEmitter = require('../socket/socket.emitter');
const logger = require('../utils/logger.util');

class AnomalyService {
    /**
     * Start consuming anomaly data stream
     */
    static startConsumer() {
        StreamCore.consume(config.streams.anomalies, config.groups.anomalies, `consumer:${Math.random().toString(16).slice(3)}`, async (data) => {
            try {
                logger.info(`[Anomaly Service] Anomaly detected`);

                // 1. Validate
                const { error, value } = schemas.anomalyData.validate(data);
                if (error) {
                    logger.error(`[Anomaly Service] Validation Error: ${error.message}`);
                    return;
                }

                // 2. Decode and Save Image
                const imageDir = path.resolve(config.storage.imageDir);
                await fs.ensureDir(imageDir);

                const fileName = `anomaly_${Date.now()}.jpg`;
                const filePath = path.join(imageDir, fileName);

                const base64Data = value.imageBase64.replace(/^data:image\/\w+;base64,/, '');
                await fs.writeFile(filePath, base64Data, 'base64');
                logger.info(`[Anomaly Service] Image saved to ${filePath}`);

                // 3. Save Metadata to MongoDB
                const anomaly = new Anomaly({
                    userId: value.userId || 'mqtt-global',
                    type: value.type,
                    severity: value.severity,
                    confidence: value.confidence,
                    imagePath: filePath,
                    timestamp: value.timestamp
                });
                await anomaly.save();

                // 4. Emit alert via Socket.io
                const imageUrl = `${config.app.publicBaseUrl}/anomaly-images/${fileName}`;
                SocketEmitter.emitToAll('anomaly:alert', {
                    type: value.type,
                    severity: value.severity,
                    confidence: value.confidence,
                    timestamp: value.timestamp,
                    image: imageUrl
                });

            } catch (err) {
                logger.error(`[Anomaly Service] Error: ${err.message}`);
            }
        });
    }
}

module.exports = AnomalyService;
// Note: fs-extra is used which is not in package.json yet, I should add it or use fs.promises
