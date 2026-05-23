const Task = require('../models/Task');
const Project = require('../models/Project');
const { createNotification } = require('./notificationController');

// @desc    Get my assigned projects
// @route   GET /api/employee/projects
// @access  Private (Employee)
exports.getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            assignedUsers: req.user.id,
            status: 'active'
        })
        .populate('createdBy', 'name email position')
        .select('projectSubject projectCode dailyProductionTarget status createdAt');

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create daily task
// @route   POST /api/employee/task
// @access  Private (Employee)
exports.createDailyTask = async (req, res) => {
    try {
        const { projectId } = req.body;

        // Check if project exists and user is assigned
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (!project.assignedUsers.includes(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this project'
            });
        }

        // Check if task already exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingTask = await Task.findOne({
            projectId,
            userId: req.user.id,
            date: { $gte: today }
        });

        if (existingTask) {
            return res.status(400).json({
                success: false,
                message: 'Task already created for today',
                data: existingTask
            });
        }

        // Create new task
        const task = await Task.create({
            projectId,
            userId: req.user.id,
            date: new Date(),
            dailyTarget: project.dailyProductionTarget,
            hourlyUpdates: [],
            totalProduction: 0,
            completionPercentage: 0,
            remainingHours: 8,
            status: 'in-progress'
        });

        await task.populate('projectId', 'projectSubject projectCode dailyProductionTarget');

        res.status(201).json({
            success: true,
            message: 'Daily task created successfully',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add hourly production update
// @route   POST /api/employee/task/:id/update
// @access  Private (Employee)
exports.addHourlyUpdate = async (req, res) => {
    try {
        const { production, hourNumber } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check if task belongs to user
        if (task.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this task'
            });
        }

        // Check if task is already completed
        if (task.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Task is already completed'
            });
        }

        // Validate hour number
        if (hourNumber && (hourNumber < 1 || hourNumber > 8)) {
            return res.status(400).json({
                success: false,
                message: 'Hour number must be between 1 and 8'
            });
        }

        // Check if this hour already exists
        const existingHour = task.hourlyUpdates.find(update => update.hour === hourNumber);
        if (existingHour) {
            return res.status(400).json({
                success: false,
                message: `Hour ${hourNumber} has already been updated`
            });
        }

        // Calculate cumulative total
        const previousTotal = task.totalProduction || 0;
        const cumulativeTotal = previousTotal + production;
        
        // Calculate completion percentage based on cumulative total
        const completionPercentage = Math.min(Math.round((cumulativeTotal / task.dailyTarget) * 100), 100);

        // Add hourly update
        const hour = hourNumber || (task.hourlyUpdates.length + 1);
        task.hourlyUpdates.push({
            hour: hour,
            production: production,
            cumulativeTotal: cumulativeTotal,
            completionPercentage: completionPercentage,
            timestamp: new Date()
        });

        // Update task totals
        task.totalProduction = cumulativeTotal;
        task.completionPercentage = completionPercentage;
        
        // Calculate remaining hours based on unique hours completed
        const completedHourNumbers = task.hourlyUpdates.map(u => u.hour);
        const uniqueHours = [...new Set(completedHourNumbers)];
        
        // Special case: If only hour 8 is entered, treat it as all 8 hours complete
        if (uniqueHours.length === 1 && uniqueHours[0] === 8) {
            task.remainingHours = 0;
        } else {
            task.remainingHours = 8 - uniqueHours.length;
        }

        // Keep status as in-progress - employee must manually submit
        if (task.status !== 'pending-approval' && task.status !== 'completed') {
            task.status = 'in-progress';
        }

        await task.save();
        await task.populate('projectId', 'projectSubject projectCode dailyProductionTarget');

        res.status(200).json({
            success: true,
            message: `Hour ${hour} updated successfully`,
            data: {
                task: task,
                summary: {
                    hourNumber: hour,
                    thisHourProduction: production,
                    cumulativeTotal: cumulativeTotal,
                    dailyTarget: task.dailyTarget,
                    completionPercentage: completionPercentage,
                    remainingHours: task.remainingHours,
                    status: task.status
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get today's task
// @route   GET /api/employee/task/today
// @access  Private (Employee)
exports.getTodayTask = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const task = await Task.findOne({
            userId: req.user.id,
            date: { $gte: today }
        })
        .populate('projectId', 'projectSubject projectCode dailyProductionTarget')
        .sort('-createdAt');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'No task found for today'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all my tasks
// @route   GET /api/employee/tasks
// @access  Private (Employee)
exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id })
            .populate('projectId', 'projectSubject projectCode dailyProductionTarget')
            .sort('-date');

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get task by ID
// @route   GET /api/employee/task/:id
// @access  Private (Employee)
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('projectId', 'projectSubject projectCode dailyProductionTarget');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check if task belongs to user
        if (task.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this task'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get my statistics
// @route   GET /api/employee/stats
// @access  Private (Employee)
exports.getMyStats = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
        const totalProduction = tasks.reduce((sum, t) => sum + t.totalProduction, 0);
        const averageCompletion = tasks.length > 0 
            ? Math.round(tasks.reduce((sum, t) => sum + t.completionPercentage, 0) / tasks.length)
            : 0;

        // Get today's task
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTask = await Task.findOne({
            userId: req.user.id,
            date: { $gte: today }
        });

        res.status(200).json({
            success: true,
            data: {
                totalTasks,
                completedTasks,
                inProgressTasks,
                totalProduction,
                averageCompletion,
                todayTask: todayTask ? {
                    remainingHours: todayTask.remainingHours,
                    completionPercentage: todayTask.completionPercentage,
                    totalProduction: todayTask.totalProduction
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// @desc    Get my project invitations
// @route   GET /api/employee/invitations
// @access  Private (Employee)
exports.getMyInvitations = async (req, res) => {
    try {
        const ProjectInvitation = require('../models/ProjectInvitation');
        
        const invitations = await ProjectInvitation.find({
            userId: req.user.id,
            status: 'pending'
        })
            .populate('projectId', 'projectSubject projectCode dailyProductionTarget')
            .populate('invitedBy', 'name email position')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: invitations.length,
            data: invitations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Respond to project invitation
// @route   PUT /api/employee/invitation/:invitationId/respond
// @access  Private (Employee)
exports.respondToInvitation = async (req, res) => {
    try {
        const ProjectInvitation = require('../models/ProjectInvitation');
        const { invitationId } = req.params;
        const { response } = req.body; // 'accept' or 'reject'

        const invitation = await ProjectInvitation.findById(invitationId)
            .populate('projectId')
            .populate('invitedBy', 'name email');

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        // Check if invitation belongs to user
        if (invitation.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to respond to this invitation'
            });
        }

        // Check if already responded
        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Invitation already responded to'
            });
        }

        // Update invitation status
        invitation.status = response === 'accept' ? 'accepted' : 'rejected';
        invitation.respondedAt = new Date();
        await invitation.save();

        // If accepted, add user to project
        if (response === 'accept') {
            const project = invitation.projectId;
            if (!project.assignedUsers.includes(req.user.id)) {
                project.assignedUsers.push(req.user.id);
                await project.save();
            }

            // Notify admin
            await createNotification(
                invitation.invitedBy._id,
                'invitation_accepted',
                'Invitation Accepted',
                `${req.user.name} accepted your invitation to join ${project.projectSubject} (${project.projectCode})`,
                { project: project._id, user: req.user.id }
            );
        } else {
            // Notify admin of rejection
            await createNotification(
                invitation.invitedBy._id,
                'invitation_rejected',
                'Invitation Rejected',
                `${req.user.name} rejected your invitation to join ${invitation.projectId.projectSubject} (${invitation.projectId.projectCode})`,
                { project: invitation.projectId._id, user: req.user.id }
            );
        }

        res.status(200).json({
            success: true,
            message: `Invitation ${response === 'accept' ? 'accepted' : 'rejected'} successfully`,
            data: invitation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get task by ID
// @route   GET /api/employee/task/:id
// @access  Private (Employee)
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('projectId', 'projectSubject projectCode dailyProductionTarget')
            .populate('userId', 'name email position');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check if task belongs to user
        if (task.userId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this task'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Submit task for approval
// @route   POST /api/employee/task/:id/submit
// @access  Private (Employee)
exports.submitTaskForApproval = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('projectId')
            .populate('userId', 'name email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check if task belongs to user
        if (task.userId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to submit this task'
            });
        }

        // Check if all 8 hours are completed
        // Either: 8 unique hours (1-8) OR only hour 8 (special case) OR remainingHours === 0
        const completedHourNumbers = task.hourlyUpdates.map(u => u.hour);
        const uniqueHours = [...new Set(completedHourNumbers)];
        const allHoursCompleted = (uniqueHours.length === 8 && uniqueHours.every(h => h >= 1 && h <= 8)) ||
                                 (uniqueHours.length === 1 && uniqueHours[0] === 8) ||
                                 task.remainingHours === 0;
        
        if (!allHoursCompleted) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all 8 hours before submitting'
            });
        }

        // Check if already submitted
        if (task.status === 'pending-approval' || task.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Task already submitted'
            });
        }

        // Update task status
        task.status = 'pending-approval';
        task.submittedAt = new Date();
        await task.save();

        // Get project and notify admin
        const Project = require('../models/Project');
        const project = await Project.findById(task.projectId).populate('createdBy');

        if (project && project.createdBy) {
            await createNotification(
                project.createdBy._id,
                'task_completed',
                'Task Submitted for Approval',
                `${task.userId.name} submitted a task for ${project.projectSubject} (${project.projectCode}) - ${task.completionPercentage}% completion`,
                { task: task._id, project: project._id, user: task.userId._id }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Task submitted for approval successfully',
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
