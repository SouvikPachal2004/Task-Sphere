const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectSubject: {
        type: String,
        required: [true, 'Please provide a project subject'],
        trim: true,
        maxlength: [200, 'Project subject cannot be more than 200 characters']
    },
    projectCode: {
        type: String,
        required: [true, 'Please provide a project code'],
        unique: true,
        trim: true,
        uppercase: true,
        maxlength: [20, 'Project code cannot be more than 20 characters']
    },
    dailyProductionTarget: {
        type: Number,
        required: [true, 'Please provide daily production target'],
        min: [1, 'Daily production target must be at least 1']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['active', 'completed', 'on-hold', 'cancelled'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
projectSchema.index({ projectCode: 1 });
projectSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Project', projectSchema);
