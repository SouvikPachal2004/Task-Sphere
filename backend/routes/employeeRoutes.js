const express = require('express');
const router = express.Router();
const {
    getMyProjects,
    createDailyTask,
    addHourlyUpdate,
    getTodayTask,
    getMyTasks,
    getTaskById,
    getMyStats,
    getMyInvitations,
    respondToInvitation,
    submitTaskForApproval
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only accessible by employees
router.use(protect);
router.use(authorize('employee', 'admin', 'superadmin'));

// Project routes
router.get('/projects', getMyProjects);

// Invitation routes
router.get('/invitations', getMyInvitations);
router.put('/invitation/:invitationId/respond', respondToInvitation);

// Task routes
router.post('/task', createDailyTask);
router.post('/task/:id/update', addHourlyUpdate);
router.post('/task/:id/submit', submitTaskForApproval);
router.get('/task/today', getTodayTask);
router.get('/tasks', getMyTasks);
router.get('/task/:id', getTaskById);

// Statistics
router.get('/stats', getMyStats);

module.exports = router;
