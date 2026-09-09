const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  JWT_DEFAULT_SECRET,
  JWT_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} = require('../config/constants');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Format a User document for safe client transmission (excluding passwordHash)
 */
const formatUserResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt,
});

/**
 * Generates a signed JSON Web Token for authenticated sessions.
 * 
 * @param {string} userId - MongoDB ObjectId string of the user
 * @param {string} username - Unique handle of the user
 * @returns {string} Signed JWT token valid for 7 days
 */
const generateToken = (userId, username) => {
  const secret = process.env.JWT_SECRET || JWT_DEFAULT_SECRET;
  return jwt.sign({ userId, username }, secret, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user account with validated credentials
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { username, email, password, avatarUrl } = req.body;

    // 1. Input Validation
    if (!username || !email || !password) {
      return sendError(res, 'Username, email, and password are required.', 400);
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedUsername.length < USERNAME_MIN_LENGTH || trimmedUsername.length > USERNAME_MAX_LENGTH) {
      return sendError(res, `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters.`, 400);
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return sendError(res, 'Username can only contain letters, numbers, and underscores.', 400);
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return sendError(res, 'Please provide a valid email address.', 400);
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return sendError(res, `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`, 400);
    }

    // 2. Uniqueness check
    const existingUser = await User.findOne({
      $or: [{ email: trimmedEmail }, { username: trimmedUsername }],
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === trimmedUsername.toLowerCase()) {
        return sendError(res, 'Username is already taken. Please choose another.', 409);
      }
      return sendError(res, 'An account with this email already exists.', 409);
    }

    // 3. Password Hashing
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Default avatar fallback via DiceBear
    const resolvedAvatar =
      avatarUrl?.trim() ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        trimmedUsername
      )}&backgroundColor=FF5C5C`;

    // 5. Create user
    const newUser = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      passwordHash,
      avatarUrl: resolvedAvatar,
      createdAt: new Date(),
    });

    // 6. Generate JWT Token
    const token = generateToken(newUser._id.toString(), newUser.username);

    return sendSuccess(
      res,
      {
        token,
        user: formatUserResponse(newUser),
      },
      'Account created successfully.',
      201
    );
  } catch (error) {
    console.error('Signup error:', error);
    return sendError(res, 'Server error during signup. Please try again later.', 500);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials & issue JWT session token
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return sendError(res, 'Email/username and password are required.', 400);
    }

    const trimmedIdentifier = identifier.trim();

    // Support logging in via email OR username
    const user = await User.findOne({
      $or: [
        { email: trimmedIdentifier.toLowerCase() },
        { username: trimmedIdentifier },
      ],
    });

    if (!user) {
      return sendError(res, 'Invalid credentials. User not found.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials. Incorrect password.', 401);
    }

    const token = generateToken(user._id.toString(), user.username);

    return sendSuccess(
      res,
      {
        token,
        user: formatUserResponse(user),
      },
      'Logged in successfully.',
      200
    );
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Server error during login. Please try again later.', 500);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Fetch authenticated user's profile info
 * @access  Private (requires valid JWT in Authorization header)
 */
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Not authenticated.', 401);
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    return sendSuccess(
      res,
      {
        user: formatUserResponse(user),
      },
      '',
      200
    );
  } catch (error) {
    console.error('getMe error:', error);
    return sendError(res, 'Server error fetching user profile.', 500);
  }
};

module.exports = {
  signup,
  login,
  getMe,
};
