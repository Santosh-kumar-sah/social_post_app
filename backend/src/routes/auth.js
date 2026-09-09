/**
 * Authentication Routes (/api/auth)
 * 
 * Endpoints:
 * - POST /api/auth/signup -> Register new user with username, email, password, optional avatarUrl
 * - POST /api/auth/login  -> Authenticate with email/username + password, issues JWT
 * - GET  /api/auth/me     -> Fetch authenticated user's profile (requires Bearer token)
 */

const { Router } = require('express');
const { signup, login, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireAuth, getMe);

module.exports = router;
