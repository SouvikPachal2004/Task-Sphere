const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const ProjectInvitation = require('../models/ProjectInvitation');
const { createNotification } = require('./notificationController');

// @desc    Create project
// @route   POST /api/admin/project
// @access  Private (Admin, Super Admin)
exports.createProject = async (req, res) => {
    try {
        const { projectSubject, projectCode, dailyProductionTarget, userEmails } = req.body;

        // Check if project code already exists
        const existingProject = await Project.findOne({ projectCode: projectCode.toUpperCase() });
        if (existingProject) {
            return res.status(400).json({
                success: false,
                message: 'Project code already exists'
            });
        }

        // Create project without assigned users initially
        const project = await Project.create({
            projectSubject,
            projectCode: projectCode.toUpperCase(),
            dailyProductionTarget,
            createdBy: req.user.id,
            assignedUsers: []
        });

        // If userEmails provided, create invitations
        if (userEmails && userEmails.length > 0) {
            const emailArray = Array.isArray(userEmails) ? userEmails : [userEmails];
            
            for (const email of emailArray) {
                // Find user by email
                const user = await User.findOne({ email: email.trim(), role: 'employee' });
                
                if (user) {
                    // Create invitation
                    await ProjectInvitation.create({
                        projectId: project._id,
                        userId: user._id,
                        invitedBy: req.user.id,
                        status: 'pending'
                    });
                    
                    // Create notification
                    await createNotification(
                        user._id,
                        'project_invitation',
                        'New Project Invitation',
                        `${req.user.name} invited you to join project: ${projectSubject} (${projectCode})`,
                        { project: project._id, invitedBy: req.user.id }
                    );
                }
            }
        }

        await project.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Project created and invitations sent successfully',
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all projects (only created by this admin)
// @route   GET /api/admin/projects
// @access  Private (Admin, Super Admin)
exports.getAllProjects = async (req, res) => {
    try {
        // Super Admin can see all projects, Admin only sees their own
        const query = req.user.role === 'superadmin' ? {} : { createdBy: req.user.id };
        
        const projects = await Project.find(query)
            .populate('createdBy', 'name email position')
            .populate('assignedUsers', 'name email position')
            .sort('-createdAt');

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

// @desc    Get project by ID
// @route   GET /api/admin/project/:id
// @access  Private (Admin, Super Admin)
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('createdBy', 'name email position')
            .populate('assignedUsers', 'name email position');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update project
// @route   PUT /api/admin/project/:id
// @access  Private (Admin, Super Admin)
exports.updateProject = async (req, res) => {
    try {
        const { projectSubject, dailyProductionTarget, assignedUsers, status } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Update fields
        if (projectSubject) project.projectSubject = projectSubject;
        if (dailyProductionTarget) project.dailyProductionTarget = dailyProductionTarget;
        if (assignedUsers) project.assignedUsers = assignedUsers;
        if (status) project.status = status;

        await project.save();
        await project.populate('assignedUsers', 'name email position');
        await project.populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete project
// @route   DELETE /api/admin/project/:id
// @access  Private (Admin, Super Admin)
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all users (for assignment)
// @route   GET /api/admin/users
// @access  Private (Admin, Super Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['employee', 'admin'] }, isActive: true })
            .select('name email position role')
            .sort('name');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get project statistics
// @route   GET /api/admin/project/:id/stats
// @access  Private (Admin, Super Admin)
exports.getProjectStats = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Get all tasks for this project
        const tasks = await Task.find({ projectId: req.params.id });

        // Calculate statistics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
        const totalProduction = tasks.reduce((sum, t) => sum + t.totalProduction, 0);
        const averageCompletion = tasks.length > 0 
            ? Math.round(tasks.reduce((sum, t) => sum + t.completionPercentage, 0) / tasks.length)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                project: {
                    projectSubject: project.projectSubject,
                    projectCode: project.projectCode,
                    dailyProductionTarget: project.dailyProductionTarget
                },
                statistics: {
                    totalTasks,
                    completedTasks,
                    inProgressTasks,
                    totalProduction,
                    averageCompletion
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

// @desc    Get all tasks for admin's projects
// @route   GET /api/admin/tasks
// @access  Private (Admin, Super Admin)
exports.getAdminTasks = async (req, res) => {
    try {
        // Get all projects created by this admin
        const query = req.user.role === 'superadmin' ? {} : { createdBy: req.user.id };
        const projects = await Project.find(query).select('_id');
        const projectIds = projects.map(p => p._id);

        // Get all tasks for these projects
        const tasks = await Task.find({ projectId: { $in: projectIds } })
            .populate('projectId', 'projectSubject projectCode dailyProductionTarget')
            .populate('userId', 'name email position')
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

// @desc    Get completed tasks for admin's projects
// @route   GET /api/admin/tasks/completed
// @access  Private (Admin, Super Admin)
exports.getCompletedTasks = async (req, res) => {
    try {
        // Get all projects created by this admin
        const query = req.user.role === 'superadmin' ? {} : { createdBy: req.user.id };
        const projects = await Project.find(query).select('_id');
        const projectIds = projects.map(p => p._id);

        // Get completed tasks for these projects
        const tasks = await Task.find({ 
            projectId: { $in: projectIds },
            status: 'completed'
        })
            .populate('projectId', 'projectSubject projectCode dailyProductionTarget')
            .populate('userId', 'name email position')
            .sort('-date')
            .limit(50);

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


// @desc    Remove employee from project
// @route   DELETE /api/admin/project/:projectId/employee/:userId
// @access  Private (Admin, Super Admin)
exports.removeEmployeeFromProject = async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if admin owns this project (unless superadmin)
        if (req.user.role !== 'superadmin' && project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this project'
            });
        }

        // Remove user from assignedUsers
        project.assignedUsers = project.assignedUsers.filter(
            id => id.toString() !== userId
        );
        await project.save();

        // Get user details
        const user = await User.findById(userId);

        // Create notification for removed employee
        if (user) {
            await createNotification(
                userId,
                'project_removed',
                'Removed from Project',
                `You have been removed from project: ${project.projectSubject} (${project.projectCode})`,
                { project: projectId, removedBy: req.user.id }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Employee removed from project successfully',
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get project invitations for admin
// @route   GET /api/admin/project/:projectId/invitations
// @access  Private (Admin, Super Admin)
exports.getProjectInvitations = async (req, res) => {
    try {
        const { projectId } = req.params;

        const invitations = await ProjectInvitation.find({ projectId })
            .populate('userId', 'name email position')
            .populate('invitedBy', 'name email')
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

// @desc    Invite employees to existing project
// @route   POST /api/admin/project/:projectId/invite-employees
// @access  Private (Admin, Super Admin)
exports.inviteEmployeesToProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userEmails } = req.body;

        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if admin owns this project (unless superadmin)
        if (req.user.role !== 'superadmin' && project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to invite employees to this project'
            });
        }

        if (!userEmails || userEmails.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one employee email'
            });
        }

        const emailArray = Array.isArray(userEmails) ? userEmails : [userEmails];
        let invitedCount = 0;
        let alreadyInvitedCount = 0;
        let notFoundCount = 0;

        for (const email of emailArray) {
            // Find user by email
            const user = await User.findOne({ email: email.trim(), role: 'employee' });
            
            if (!user) {
                notFoundCount++;
                continue;
            }

            // Check if already invited or assigned
            const existingInvitation = await ProjectInvitation.findOne({
                projectId: project._id,
                userId: user._id
            });

            if (existingInvitation) {
                alreadyInvitedCount++;
                continue;
            }

            // Create invitation
            await ProjectInvitation.create({
                projectId: project._id,
                userId: user._id,
                invitedBy: req.user.id,
                status: 'pending'
            });
            
            // Create notification
            await createNotification(
                user._id,
                'project_invitation',
                'New Project Invitation',
                `${req.user.name} invited you to join project: ${project.projectSubject} (${project.projectCode})`,
                { project: project._id, invitedBy: req.user.id }
            );

            invitedCount++;
        }

        let message = `Invitations sent to ${invitedCount} employee(s)`;
        if (alreadyInvitedCount > 0) {
            message += `. ${alreadyInvitedCount} already invited`;
        }
        if (notFoundCount > 0) {
            message += `. ${notFoundCount} email(s) not found`;
        }

        res.status(200).json({
            success: true,
            message,
            data: {
                invited: invitedCount,
                alreadyInvited: alreadyInvitedCount,
                notFound: notFoundCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve/Reject task
// @route   PUT /api/admin/task/:taskId/approve
// @access  Private (Admin, Super Admin)
exports.approveTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { approved, feedback } = req.body; // approved: true/false

        const task = await Task.findById(taskId)
            .populate('projectId')
            .populate('userId', 'name email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check if admin owns this project (unless superadmin)
        if (req.user.role !== 'superadmin' && task.projectId.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to approve this task'
            });
        }

        // Check if task is pending approval
        if (task.status !== 'pending-approval') {
            return res.status(400).json({
                success: false,
                message: 'Task is not pending approval'
            });
        }

        // Update task status
        task.status = approved ? 'completed' : 'rejected';
        task.approvedBy = req.user.id;
        task.approvedAt = new Date();
        if (feedback) {
            task.feedback = feedback;
        }

        await task.save();

        // Notify employee
        const notificationTitle = approved ? 'Task Approved' : 'Task Rejected';
        const notificationMessage = approved 
            ? `Your task for ${task.projectId.projectSubject} has been approved by ${req.user.name}`
            : `Your task for ${task.projectId.projectSubject} was rejected by ${req.user.name}. ${feedback ? 'Feedback: ' + feedback : ''}`;

        await createNotification(
            task.userId._id,
            approved ? 'task_approved' : 'task_rejected',
            notificationTitle,
            notificationMessage,
            { task: task._id, project: task.projectId._id, approvedBy: req.user.id }
        );

        res.status(200).json({
            success: true,
            message: `Task ${approved ? 'approved' : 'rejected'} successfully`,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
