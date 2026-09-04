const bcrypt = require('bcryptjs');
const { User, Role, Permission, AuditLog } = require('../models');
const auditService = require('../services/auditService');

// ---- Users ----

async function listUsers(req, res) {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'isActive', 'createdAt'],
    include: [{ model: Role, as: 'roles', attributes: ['id', 'name'] }],
  });
  res.json({ users });
}

async function createUser(req, res) {
  const { name, email, password, roleIds = [] } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ message: 'A user with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  if (roleIds.length) {
    const roles = await Role.findAll({ where: { id: roleIds } });
    await user.setRoles(roles);
  }

  await auditService.logEvent({ userId: req.user.id, userEmail: req.user.email, action: 'USER_CREATED', details: { newUserEmail: email } });

  res.status(201).json({ id: user.id, name: user.name, email: user.email });
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { name, isActive, roleIds } = req.body;

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (name !== undefined) user.name = name;
  if (isActive !== undefined) user.isActive = isActive;
  await user.save();

  if (roleIds) {
    const roles = await Role.findAll({ where: { id: roleIds } });
    await user.setRoles(roles);
  }

  await auditService.logEvent({ userId: req.user.id, userEmail: req.user.email, action: 'USER_UPDATED', details: { targetUserId: id } });

  res.json({ message: 'User updated' });
}

async function deleteUser(req, res) {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await user.destroy();

  await auditService.logEvent({ userId: req.user.id, userEmail: req.user.email, action: 'USER_DELETED', details: { targetUserId: id } });

  res.json({ message: 'User deleted' });
}

// ---- Roles & Permissions ----

async function listRoles(req, res) {
  const roles = await Role.findAll({ include: [{ model: Permission, as: 'permissions' }] });
  res.json({ roles });
}

async function createRole(req, res) {
  const { name, description, permissionIds = [] } = req.body;
  if (!name) return res.status(400).json({ message: 'Role name is required' });

  const role = await Role.create({ name, description });
  if (permissionIds.length) {
    const permissions = await Permission.findAll({ where: { id: permissionIds } });
    await role.setPermissions(permissions);
  }

  await auditService.logEvent({ userId: req.user.id, userEmail: req.user.email, action: 'ROLE_CREATED', details: { name } });

  res.status(201).json({ id: role.id, name: role.name });
}

async function assignPermissionsToRole(req, res) {
  const { id } = req.params;
  const { permissionIds = [] } = req.body;

  const role = await Role.findByPk(id);
  if (!role) return res.status(404).json({ message: 'Role not found' });

  const permissions = await Permission.findAll({ where: { id: permissionIds } });
  await role.setPermissions(permissions);

  await auditService.logEvent({ userId: req.user.id, userEmail: req.user.email, action: 'ROLE_PERMISSIONS_UPDATED', details: { roleId: id } });

  res.json({ message: 'Permissions updated for role' });
}

async function listPermissions(req, res) {
  const permissions = await Permission.findAll();
  res.json({ permissions });
}

// ---- Audit Logs ----

async function listAuditLogs(req, res) {
  const logs = await AuditLog.findAll({
    order: [['createdAt', 'DESC']],
    limit: 200,
  });
  res.json({ logs });
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listRoles,
  createRole,
  assignPermissionsToRole,
  listPermissions,
  listAuditLogs,
};
