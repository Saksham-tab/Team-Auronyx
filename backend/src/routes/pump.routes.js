const express = require('express');
const router = express.Router();
const PumpService = require('../services/pump.service');
const schemas = require('../validation/schemas.validation');
const rateLimit = require('express-rate-limit');

// Rate limiting for pump control to avoid DOS/spamming physical hardware
const pumpLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each user to 5 requests per minute
    message: 'Too many pump control requests from this IP, please try again after a minute'
});

/**
 * @route POST /pump/control
 * @desc Control the pump motor (ON/OFF)
 */
router.post('/control', pumpLimiter, async (req, res, next) => {
    try {
        const { error, value } = schemas.pumpControl.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 'error', message: error.message });
        }

        const { action } = value;
        await PumpService.controlPump(action);

        res.json({
            status: 'success',
            message: `Command ${action} sent to pump`,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
