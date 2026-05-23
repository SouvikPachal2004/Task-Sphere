const User = require('../models/User');
const SecurityCode = require('../models/SecurityCode');
const crypto = require('crypto');

// @desc    Create admin account
// @route   POST /api/superadmin/create-admin
// @access  Private (Super Admin only)
exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password, position } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create admin user
        const admin = await User.create({
            name,
            email,
            password,
            position,
            role: 'admin',
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Generate admin security code
// @route   POST /api/superadmin/generate-code
// @access  Private (Super Admin only)
exports.generateSecurityCode = async (req, res) => {
    try {
        const { expiryDays = 30 } = req.body;

        // Generate random code
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        // Create security code
        const securityCode = await SecurityCode.create({
            code,
            type: 'admin',
            createdBySuperAdmin: req.user.id,
            expiresAt
        });

        res.status(201).json({
            success: true,
            message: 'Security code generated successfully',
            data: securityCode
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all admins
// @route   GET /api/superadmin/admins
// @access  Private (Super Admin only)
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' })
            .select('-password')
            .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            count: admins.length,
            data: admins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all employees
// @route   GET /api/superadmin/employees
// @access  Private (Super Admin only)
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' })
            .select('-password');

        res.status(200).json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete admin
// @route   DELETE /api/superadmin/admin/:id
// @access  Private (Super Admin only)
exports.deleteAdmin = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (admin.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'User is not an admin'
            });
        }

        await admin.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Block/Unblock admin
// @route   PUT /api/superadmin/admin/:id/toggle-status
// @access  Private (Super Admin only)
exports.toggleAdminStatus = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (admin.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'User is not an admin'
            });
        }

        admin.isActive = !admin.isActive;
        await admin.save();

        res.status(200).json({
            success: true,
            message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all security codes
// @route   GET /api/superadmin/security-codes
// @access  Private (Super Admin only)
exports.getSecurityCodes = async (req, res) => {
    try {
        const codes = await SecurityCode.find()
            .populate('createdBySuperAdmin', 'name email')
            .populate('usedBy', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: codes.length,
            data: codes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get system statistics
// @route   GET /api/superadmin/stats
// @access  Private (Super Admin only)
exports.getSystemStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalAdmins,
            totalEmployees,
            totalSuperAdmins,
            activeAdmins,
            activeEmployees
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'employee' }),
            User.countDocuments({ role: 'superadmin' }),
            User.countDocuments({ role: 'admin', isActive: true }),
            User.countDocuments({ role: 'employee', isActive: true })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalAdmins,
                totalEmployees,
                totalSuperAdmins,
                activeAdmins,
                activeEmployees
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// @desc    Delete security code
// @route   DELETE /api/superadmin/security-code/:id
// @access  Private (Super Admin only)
exports.deleteSecurityCode = async (req, res) => {
    try {
        const code = await SecurityCode.findById(req.params.id);

        if (!code) {
            return res.status(404).json({
                success: false,
                message: 'Security code not found'
            });
        }

        // Check if code has been used
        if (code.used) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a security code that has already been used'
            });
        }

        await code.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Security code deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create project and assign to admin
// @route   POST /api/superadmin/project
// @access  Private (Super Admin only)
exports.createProject = async (req, res) => {
    try {
        const Project = require('../models/Project');
        const { projectSubject, projectCode, dailyProductionTarget, projectManagerId } = req.body;

        // Check if project code already exists
        const existingProject = await Project.findOne({ projectCode: projectCode.toUpperCase() });
        if (existingProject) {
            return res.status(400).json({
                success: false,
                message: 'Project code already exists'
            });
        }

        // Verify the project manager exists and is an admin
        const projectManager = await User.findById(projectManagerId);
        if (!projectManager) {
            return res.status(404).json({
                success: false,
                message: 'Project Manager not found'
            });
        }

        if (projectManager.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Selected user is not an admin'
            });
        }

        if (!projectManager.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Selected admin is not active'
            });
        }

        // Create project assigned to the admin
        const project = await Project.create({
            projectSubject,
            projectCode: projectCode.toUpperCase(),
            dailyProductionTarget,
            createdBy: projectManagerId, // Assign to the admin
            assignedUsers: []
        });

        await project.populate('createdBy', 'name email position');

        // Create notification for the admin
        const { createNotification } = require('./notificationController');
        await createNotification(
            projectManagerId,
            'project_assigned',
            'New Project Assigned',
            `Director has assigned you a new project: ${projectSubject} (${projectCode})`,
            { project: project._id, assignedBy: req.user.id }
        );

        res.status(201).json({
            success: true,
            message: 'Project created and assigned to Project Manager successfully',
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
