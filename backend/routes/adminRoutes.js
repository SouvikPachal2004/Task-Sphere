const express = require('express');
const router = express.Router();
const {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    getAllUsers,
    getProjectStats,
    getAdminTasks,
    getCompletedTasks,
    removeEmployeeFromProject,
    getProjectInvitations,
    inviteEmployeesToProject,
    approveTask
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only accessible by admin and superadmin
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Project routes
router.post('/project', createProject);
router.get('/projects', getAllProjects);
router.get('/project/:id', getProjectById);
router.put('/project/:id', updateProject);
router.delete('/project/:id', deleteProject);
router.get('/project/:id/stats', getProjectStats);
router.get('/project/:projectId/invitations', getProjectInvitations);
router.post('/project/:projectId/invite-employees', inviteEmployeesToProject);
router.delete('/project/:projectId/employee/:userId', removeEmployeeFromProject);

// Task routes
router.get('/tasks', getAdminTasks);
router.get('/tasks/completed', getCompletedTasks);
router.put('/task/:taskId/approve', approveTask);

// User routes
router.get('/users', getAllUsers);

module.exports = router;
