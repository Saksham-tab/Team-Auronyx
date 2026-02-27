const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    confidence: {
        type: Number,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    },
    metadata: {
        type: Map,
        of: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Anomaly', anomalySchema);
