const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    dailyTarget: {
        type: Number,
        required: true
    },
    hourlyUpdates: [{
        hour: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },
        production: {
            type: Number,
            required: true,
            min: 0
        },
        cumulativeTotal: {
            type: Number,
            required: true
        },
        completionPercentage: {
            type: Number,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    totalProduction: {
        type: Number,
        default: 0
    },
    completionPercentage: {
        type: Number,
        default: 0
    },
    remainingHours: {
        type: Number,
        default: 8
    },
    status: {
        type: String,
        enum: ['in-progress', 'pending-approval', 'completed', 'rejected'],
        default: 'in-progress'
    },
    submittedAt: {
        type: Date,
        default: null
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    feedback: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Calculate total production and percentage before saving
taskSchema.pre('save', function(next) {
    if (this.hourlyUpdates.length > 0) {
        // Get the last hourly update which has the cumulative total
        const lastUpdate = this.hourlyUpdates[this.hourlyUpdates.length - 1];
        this.totalProduction = lastUpdate.cumulativeTotal;
        this.completionPercentage = lastUpdate.completionPercentage;
    } else {
        this.totalProduction = 0;
        this.completionPercentage = 0;
    }
    
    // Calculate remaining hours based on unique hours completed
    const completedHourNumbers = this.hourlyUpdates.map(u => u.hour);
    const uniqueHours = [...new Set(completedHourNumbers)];
    
    // Special case: If only hour 8 is entered, treat it as all 8 hours complete
    if (uniqueHours.length === 1 && uniqueHours[0] === 8) {
        this.remainingHours = 0;
    } else {
        this.remainingHours = 8 - uniqueHours.length;
    }
    
    // Don't auto-complete - let employee submit for approval
    // Status is managed manually through submit and approve endpoints
    
    next();
});

// Index for faster queries
taskSchema.index({ userId: 1, date: 1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ status: 1 });

module.exports = mongoose.model('Task', taskSchema);
