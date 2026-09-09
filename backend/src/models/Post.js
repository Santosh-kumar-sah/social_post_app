const mongoose = require('mongoose');

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
    collection: 'posts',
    timestamps: false,
  }
);

PostSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema);
