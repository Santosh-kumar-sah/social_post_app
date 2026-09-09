/**
 * ============================================================================
 * Post Model — Collection 2 of 2: `posts`
 * ============================================================================
 * Architectural Constraint:
 * - Exactly two MongoDB collections (`users` and `posts`).
 * - No third collection for likes or comments.
 * - Likes and comments are embedded directly as arrays inside each post document:
 *     likes: [{ userId, username }]
 *     comments: [{ userId, username, text, createdAt }]
 *
 * Why this design choice?
 * 1. O(1) Single-Pass Feed Reads: Fetching the community feed requires zero
 *    $lookup joins or multi-table queries. A single index scan on `createdAt: -1`
 *    instantly delivers post text, images, liker names, and full discussion threads.
 * 2. Atomic Concurrency: Updates to likes and comments occur atomically within
 *    the parent post document using MongoDB array push/pull operators.
 */

const mongoose = require('mongoose');

/**
 * Subdocument Schema for Embedded Likes
 * Stores both the user's ObjectId reference AND their denormalized username
 * so the client can display the avatar stack and likers list without additional queries.
 */
const LikeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

/**
 * Subdocument Schema for Embedded Comments
 * Contains unique comment _id, author identity, text message, and creation timestamp.
 */
const CommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text cannot be empty'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/**
 * Parent Post Schema
 */
const PostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
      index: true,
    },
    authorUsername: {
      type: String,
      required: [true, 'Author username is required'],
      trim: true,
    },
    authorAvatarUrl: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      trim: true,
      maxlength: [1000, 'Post text cannot exceed 1000 characters'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    likes: {
      type: [LikeSchema],
      default: [],
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    // Explicitly enforce the 'posts' collection name (Rule: exactly 2 collections)
    collection: 'posts',
    timestamps: false,
  }
);

// High-performance compound/sort index for newest-first public feed queries
PostSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema);
