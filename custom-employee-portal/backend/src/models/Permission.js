const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g. 'access:zoho_books', 'manage:users'
  description: { type: DataTypes.STRING },
}, {
  tableName: 'Permissions',
  timestamps: true,
});

module.exports = Permission;
