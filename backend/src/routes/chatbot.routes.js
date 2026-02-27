const express = require('express');
const router = express.Router();
const schemas = require('../validation/schemas.validation');
const AiService = require('../ai/ai.service');

/**
 * @route POST /chatbot/query
 * @desc General-purpose agriculture chatbot (no DB dependency)
 */
router.post('/query', async (req, res, next) => {
    try {
        const { error, value } = schemas.chatbotQuery.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 'error', message: error.message });
        }

        const sensor = value.sensor || {};

        const result = await AiService.runModel('chatbot_adapter.py', {
            question: value.question,
            sensor
        });

        res.json({
            status: 'success',
            answer: result.answer || 'No response generated',
            source: result.source || 'chatbot_adapter.py'
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
