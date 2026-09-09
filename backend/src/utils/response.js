/**
 * Standardized API Response Helpers
 * Ensures consistent JSON payload structure: { success: boolean, message?: string, ...data }
 */

const sendSuccess = (res, data = {}, message = '', statusCode = 200) => {
  const payload = {
    success: true,
    ...(message ? { message } : {}),
    ...data,
  };
  return res.status(statusCode).json(payload);
};

const sendError = (res, message = 'Internal server error occurred.', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
