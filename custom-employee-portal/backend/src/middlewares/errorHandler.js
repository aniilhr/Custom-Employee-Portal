// Centralized error handler - keeps error shapes consistent across the API.
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;
