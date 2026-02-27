const express = require('express');
const router = express.Router();
const schemas = require('../validation/schemas.validation');
const SowingService = require('../services/sowing.service');
const config = require('../config/env.config');

/**
 * @route POST /sowing/publish
 * @desc Publish sowing date to MQTT topic
 */
router.post('/publish', async (req, res, next) => {
    try {
        console.log(`[SOWING][API][IN] body=${JSON.stringify(req.body)}`);
        const { error, value } = schemas.sowingDatePublish.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 'error', message: error.message });
        }

        console.log(`[SOWING][API] publishing cropType=${value.cropType} sowingDate=${value.sowingDate}`);
        const payload = await SowingService.publishSowingDate(value.cropType, value.sowingDate);
        console.log(`[SOWING][API][DONE] published payload=${JSON.stringify(payload)}`);
        res.json({
            status: 'success',
            message: `Sowing date published`,
            topic: config.mqtt.topics.sowingDate,
            payload
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
