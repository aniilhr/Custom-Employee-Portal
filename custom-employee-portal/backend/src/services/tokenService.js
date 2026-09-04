const jwt = require('jsonwebtoken');

function signUserToken(user, roles, permissions) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      roles,        // e.g. ['Finance']
      permissions,  // e.g. ['access:zoho_books']
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

module.exports = { signUserToken };
