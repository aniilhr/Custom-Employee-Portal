const { AuditLog } = require('../models');

async function logEvent({ userId, userEmail, action, details, ipAddress }) {
  try {
    await AuditLog.create({
      userId: userId || null,
      userEmail: userEmail || null,
      action,
      details: typeof details === 'string' ? details : JSON.stringify(details || {}),
      ipAddress: ipAddress || null,
    });
  } catch (err) {
    // Audit logging must never crash the main request flow.
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = { logEvent };
