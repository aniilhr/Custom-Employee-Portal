const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');
const { signUserToken } = require('../services/tokenService');
const auditService = require('../services/auditService');

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  const ip = req.ip;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, as: 'roles', include: [{ association: 'permissions' }] }],
  });

  if (!user || !user.isActive) {
    await auditService.logEvent({ userEmail: email, action: 'LOGIN_FAILED', details: 'User not found or inactive', ipAddress: ip });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    await auditService.logEvent({ userId: user.id, userEmail: email, action: 'LOGIN_FAILED', details: 'Bad password', ipAddress: ip });
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const roleNames = user.roles.map((r) => r.name);
  const permissionNames = [
    ...new Set(user.roles.flatMap((r) => (r.permissions || []).map((p) => p.name))),
  ];

  const token = signUserToken(user, roleNames, permissionNames);

  await auditService.logEvent({ userId: user.id, userEmail: email, action: 'LOGIN_SUCCESS', ipAddress: ip });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: roleNames,
      permissions: permissionNames,
    },
  });
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, me };
