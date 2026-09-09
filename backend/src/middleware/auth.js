/**
 * ============================================================================
 * Authentication Middleware — requireAuth
 * ============================================================================
 * Intercepts incoming HTTP requests to protected endpoints:
 * 1. Verifies the presence of the `Authorization: Bearer <token>` header.
 * 2. Cryptographically validates the JWT against the server's `JWT_SECRET`.
 * 3. Populates `req.user` with `{ userId, username }` for subsequent handlers.
 * 4. Yields a structured 401 response on missing, invalid, or expired tokens.
 */

const jwt = require('jsonwebtoken');
const { JWT_DEFAULT_SECRET } = require('../config/constants');
const { sendError } = require('../utils/response');

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || JWT_DEFAULT_SECRET;

    // Verify token validity and signature
    const decoded = jwt.verify(token, secret);

    // Attach authenticated identity to request context
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };

    next();
  } catch {
    return sendError(res, 'Invalid or expired token. Please log in again.', 401);
  }
};

module.exports = { requireAuth };
