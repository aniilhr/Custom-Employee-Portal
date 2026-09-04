const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: { type: DataTypes.UUID, allowNull: true },
  userEmail: { type: DataTypes.STRING, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: false }, // LOGIN_SUCCESS, LOGIN_FAILED, ZOHO_ACCESS, ROLE_ASSIGNED, etc.
  details: { type: DataTypes.TEXT },
  ipAddress: { type: DataTypes.STRING },
}, {
  tableName: 'AuditLogs',
  timestamps: true,
});

module.exports = AuditLog;
