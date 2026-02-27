const Joi = require('joi');

const schemas = {
    // Sensor data from MQTT
    sensorData: Joi.object({
        moisture: Joi.number().required(),
        temperature: Joi.number().required(),
        humidity: Joi.number().required(),
        timestamp: Joi.date().iso()
    }),

    // Anomaly data from MQTT
    anomalyData: Joi.object({
        type: Joi.string().required(),
        severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
        confidence: Joi.number().min(0).max(1).required(),
        imageBase64: Joi.string().required(),
        timestamp: Joi.date().iso()
    }),

    // Pump control from REST API
    pumpControl: Joi.object({
        action: Joi.string().valid('ON', 'OFF').required(),
        duration: Joi.number().min(0).optional()
    }),

    // Pump status from MQTT
    pumpStatus: Joi.object({
        status: Joi.string().valid('running', 'stopped', 'error').required(),
        timestamp: Joi.date().iso()
    }),

    // Sowing date publish via MQTT
    sowingDatePublish: Joi.object({
        cropType: Joi.string().valid('Wheat', 'Moong').required(),
        sowingDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
    }),

    chatbotQuery: Joi.object({
        question: Joi.string().min(2).max(1000).required(),
        sensor: Joi.object({
            moisture: Joi.number().optional(),
            temperature: Joi.number().optional(),
            humidity: Joi.number().optional()
        }).optional()
    })
};

module.exports = schemas;
