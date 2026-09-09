/**
 * ============================================================================
 * User Model — Collection 1 of 2: `users`
 * ============================================================================
 * Strictly adheres to the project non-negotiables:
 * - Exactly two MongoDB collections exist in the system (`users` and `posts`).
 * - Encapsulates account identity, unique credentials, and profile avatar.
 * - Password hashes are generated using bcryptjs (salt rounds 10) before storage.
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Explicitly enforce the 'users' collection name (Rule: exactly 2 collections)
    collection: 'users',
    timestamps: false,
  }
);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
