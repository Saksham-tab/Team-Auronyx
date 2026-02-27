const logger = require('../utils/logger.util');

const errorMiddleware = (err, req, res, next) => {
    logger.error(`[Error Middleware] ${err.stack}`);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        status: 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorMiddleware;
