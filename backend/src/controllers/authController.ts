import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';

const generateToken = (userId: string, username: string): string => {
  const secret = process.env.JWT_SECRET || 'pulse_super_secret_jwt_key_change_in_production';
  return jwt.sign({ userId, username }, secret, { expiresIn: '7d' });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, avatarUrl } = req.body;

    // 1. Validation
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Username, email, and password are required.',
      });
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 30 characters.',
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      res.status(400).json({
        success: false,
        message: 'Username can only contain letters, numbers, and underscores.',
      });
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    // 2. Uniqueness check
    const existingUser = await User.findOne({
      $or: [{ email: trimmedEmail }, { username: trimmedUsername }],
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === trimmedUsername.toLowerCase()) {
        res.status(409).json({
          success: false,
          message: 'Username is already taken. Please choose another.',
        });
        return;
      }
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
      return;
    }

    // 3. Password Hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Default avatar fallback
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

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup. Please try again later.',
    });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: 'Email/username and password are required.',
      });
      return;
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
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.username);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later.',
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('getMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile.',
    });
  }
};
