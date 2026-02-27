const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    moisture: {
        type: Number,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    },
    drynessPrediction: {
        type: String,
        required: true
    },
    yieldPrediction: {
        type: String,
        required: true
    },
    fieldHealthIndex: {
        type: Number,
        required: true
    },
    advisory: {
        recommendation: {
            type: String,
            required: true
        },
        reasons: [{
            type: String
        }],
        source: {
            type: String
        },
        meta: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
