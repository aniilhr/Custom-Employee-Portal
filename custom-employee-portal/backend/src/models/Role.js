const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false, unique: true }, // Admin, HR, Sales, Support, Finance, Manager
  description: { type: DataTypes.STRING },
}, {
  tableName: 'Roles',
  timestamps: true,
});

module.exports = Role;
