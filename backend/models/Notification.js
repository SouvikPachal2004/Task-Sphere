const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['task_completed', 'task_created', 'project_assigned', 'admin_created', 'security_code_generated', 'project_invitation', 'invitation_accepted', 'invitation_rejected', 'project_removed', 'task_approved', 'task_rejected'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default: null
    },
    relatedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
