const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const { requireRole } = require('../middlewares/rbac');
const admin = require('../controllers/adminController');

router.use(verifyToken, requireRole('Admin'));

// Users
router.get('/users', admin.listUsers);
router.post('/users', admin.createUser);
router.put('/users/:id', admin.updateUser);
router.delete('/users/:id', admin.deleteUser);

// Roles & Permissions
router.get('/roles', admin.listRoles);
router.post('/roles', admin.createRole);
router.put('/roles/:id/permissions', admin.assignPermissionsToRole);
router.get('/permissions', admin.listPermissions);

// Audit Logs
router.get('/audit-logs', admin.listAuditLogs);

module.exports = router;
