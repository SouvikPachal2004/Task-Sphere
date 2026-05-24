const express = require('express');
const router = express.Router();
const {
    createAdmin,
    generateSecurityCode,
    getAllAdmins,
    getAllEmployees,
    deleteAdmin,
    deleteEmployee,
    deleteUser,
    toggleAdminStatus,
    getSecurityCodes,
    getSystemStats,
    deleteSecurityCode,
    createProject
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only accessible by super admin
router.use(protect);
router.use(authorize('superadmin'));

router.post('/create-admin', createAdmin);
router.post('/generate-code', generateSecurityCode);
router.post('/project', createProject);
router.get('/admins', getAllAdmins);
router.get('/employees', getAllEmployees);
router.delete('/admin/:id', deleteAdmin);
router.delete('/employee/:id', deleteEmployee);
router.delete('/user/:id', deleteUser);
router.put('/admin/:id/toggle-status', toggleAdminStatus);
router.get('/security-codes', getSecurityCodes);
router.delete('/security-code/:id', deleteSecurityCode);
router.get('/stats', getSystemStats);

module.exports = router;
