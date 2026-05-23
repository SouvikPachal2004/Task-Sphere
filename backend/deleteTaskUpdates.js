// Script to delete all hourly updates from today's tasks
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./models/Task');

async function deleteTaskUpdates() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database');

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find today's tasks
        const tasks = await Task.find({
            date: { $gte: today }
        });

        console.log(`Found ${tasks.length} task(s) from today`);

        // Reset each task
        for (const task of tasks) {
            task.hourlyUpdates = [];
            task.totalProduction = 0;
            task.completionPercentage = 0;
            task.remainingHours = 8;
            task.status = 'in-progress';
            task.submittedAt = null;
            task.approvedBy = null;
            task.approvedAt = null;
            task.feedback = null;
            await task.save();
            console.log(`Reset task ${task._id}`);
        }

        console.log('All tasks reset successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deleteTaskUpdates();
