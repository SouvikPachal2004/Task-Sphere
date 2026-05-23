const mongoose = require('mongoose');

const securityCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['admin', 'superadmin'],
        required: true
    },
    createdBySuperAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
securityCodeSchema.index({ code: 1 });
securityCodeSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('SecurityCode', securityCodeSchema);
