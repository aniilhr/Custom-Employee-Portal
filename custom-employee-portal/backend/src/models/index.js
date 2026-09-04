const sequelize = require('../config/db');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const AuditLog = require('./AuditLog');

// --- Associations (join tables: UserRoles, RolePermissions) ---

// Users <-> Roles (many-to-many) => UserRoles join table
User.belongsToMany(Role, { through: 'UserRoles', as: 'roles', foreignKey: 'userId' });
Role.belongsToMany(User, { through: 'UserRoles', as: 'users', foreignKey: 'roleId' });

// Roles <-> Permissions (many-to-many) => RolePermissions join table
Role.belongsToMany(Permission, { through: 'RolePermissions', as: 'permissions', foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: 'RolePermissions', as: 'roles', foreignKey: 'permissionId' });

module.exports = { sequelize, User, Role, Permission, AuditLog };
