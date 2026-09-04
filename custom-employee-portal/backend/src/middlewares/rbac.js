// Role/permission enforcement middleware. Runs AFTER verifyToken so req.user is populated.

// Allow only specific roles (e.g. ['Admin'])
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const hasRole = userRoles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({ message: 'Access Denied: Insufficient role' });
    }
    next();
  };
}

// Allow only if the user has a specific permission (fine-grained, e.g. 'access:zoho_books')
function requirePermission(...allowedPermissions) {
  return (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    const hasPermission = allowedPermissions.some((p) => userPermissions.includes(p));
    if (!hasPermission) {
      return res.status(403).json({ message: 'Access Denied: Insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireRole, requirePermission };
