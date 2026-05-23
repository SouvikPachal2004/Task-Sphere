const User = require('../models/User');
const SecurityCode = require('../models/SecurityCode');
const generateToken = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, position, role, securityCode } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Validate role-specific requirements
        if (role === 'superadmin') {
            // Check super admin security code
            if (securityCode !== process.env.SUPER_ADMIN_CODE) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid Super Admin security code'
                });
            }
        } else if (role === 'admin') {
            // Check admin security code from database
            const validCode = await SecurityCode.findOne({
                code: securityCode,
                type: 'admin',
                used: false,
                expiresAt: { $gt: Date.now() }
            });

            if (!validCode) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired Admin security code'
                });
            }

            // Mark code as used and store who used it
            validCode.used = true;
            validCode.usedBy = null; // Will be updated after user creation
            await validCode.save();

            // Create user
            const user = await User.create({
                name,
                email,
                password,
                position,
                role: 'admin',
                adminCode: securityCode
            });

            // Update security code with user ID
            validCode.usedBy = user._id;
            await validCode.save();

            // Generate token
            const token = generateToken(user._id);

            return res.status(201).json({
                success: true,
                message: 'Admin registered successfully',
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        position: user.position,
                        role: user.role
                    },
                    token
                }
            });
        }

        // Create user (for superadmin or employee)
        const user = await User.create({
            name,
            email,
            password,
            position,
            role: role || 'employee'
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    position: user.position,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    position: user.position,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, position } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, position },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
