const mongoose = require('mongoose');

const projectInvitationSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    respondedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
projectInvitationSchema.index({ userId: 1, status: 1 });
projectInvitationSchema.index({ projectId: 1 });

module.exports = mongoose.model('ProjectInvitation', projectInvitationSchema);
