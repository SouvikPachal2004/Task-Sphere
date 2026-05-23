const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalAdmins, totalEmployees, totalSuperAdmins] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'employee' }),
            User.countDocuments({ role: 'superadmin' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalAdmins,
                totalEmployees,
                totalSuperAdmins,
                updatedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to load platform statistics'
        });
    }
});

module.exports = router;
