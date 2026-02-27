const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db.config');
const config = require('./config/env.config');
const logger = require('./utils/logger.util');
const MqttCore = require('./core/mqtt.core');
const SocketEmitter = require('./socket/socket.emitter');
const errorMiddleware = require('./middleware/error.middleware');

// Services (Consumers)
const ReportService = require('./services/report.service');
const AnomalyService = require('./services/anomaly.service');
const PumpService = require('./services/pump.service');

// Routes
const pumpRoutes = require('./routes/pump.routes');
const sowingRoutes = require('./routes/sowing.routes');
const chatbotRoutes = require('./routes/chatbot.routes');

async function bootstrap() {
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: { origin: '*' }
    });

    // 1. Config Middleware
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use('/anomaly-images', express.static(path.resolve(config.storage.imageDir)));

    // 2. Initialize Core Modules
    try {
        await connectDB();
    } catch (err) {
        logger.warn(`[Startup] Continuing without MongoDB connection. Reason: ${err.message}`);
    }

    MqttCore.init();
    SocketEmitter.setIo(io);

    // 3. Socket.io Connection Logic
    io.on('connection', (socket) => {
        const { userId } = socket.handshake.query;
        if (userId) {
            const normalizedUserId = String(userId).replace(/^user_/, '');
            socket.join(`user_${normalizedUserId}`);
            logger.info(`[Socket] User ${normalizedUserId} connected and joined room: user_${normalizedUserId}`);
        }

        socket.on('disconnect', () => {
            logger.info('[Socket] Client disconnected');
        });
    });

    // 4. API Routes
    app.use('/api/pump', pumpRoutes);
    app.use('/api/sowing', sowingRoutes);
    app.use('/api/chatbot', chatbotRoutes);

    // Health check
    app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

    // 5. Start Background Workers (Redis Stream Consumers)
    ReportService.startConsumer();
    AnomalyService.startConsumer();
    PumpService.startConsumer();

    // 6. Error Handling
    app.use(errorMiddleware);

    // 7. Graceful Shutdown
    const gracefulShutdown = () => {
        logger.info('[Startup] Shutting down gracefully...');
        server.close(() => {
            logger.info('[Startup] HTTP server closed.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    // 8. Listen
    const PORT = config.port;

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            logger.error(`[Startup] Port ${PORT} is already in use. Stop the existing process or change PORT in backend/.env.`);
            return;
        }
        logger.error(`[Startup] Server error: ${err.message}`);
    });

    server.listen(PORT, () => {
        logger.info(`[Startup] Server running on port ${PORT} in ${config.env} mode`);
    });
}

bootstrap().catch(err => {
    logger.error(`[Bootstrap Error] ${err.message}`);
    process.exit(1);
});
