const Post = require('../models/Post');
const User = require('../models/User');
const { uploadImageBuffer } = require('../config/cloudinary');
const {
  MAX_POST_TEXT_LENGTH,
  MAX_COMMENT_LENGTH,
  DEFAULT_FEED_LIMIT,
  MAX_FEED_LIMIT,
} = require('../config/constants');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   POST /api/posts
 * @desc    Create a new social post (text OR image OR both required)
 * @access  Private (requires valid JWT)
 */
const createPost = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to post.', 401);
    }

    const { text, imageUrl: directImageUrl } = req.body;
    let finalImageUrl = directImageUrl ? directImageUrl.trim() : '';

    // Handle image file upload if uploaded via multer
    if (req.file) {
      finalImageUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype);
    }

    const trimmedText = typeof text === 'string' ? text.trim() : '';

    // Hard constraint: At least one of text or image must be present
    if (!trimmedText && !finalImageUrl) {
      return sendError(res, 'A post must contain either text, an image, or both.', 400);
    }

    if (trimmedText.length > MAX_POST_TEXT_LENGTH) {
      return sendError(res, `Post text cannot exceed ${MAX_POST_TEXT_LENGTH} characters.`, 400);
    }

    // Fetch author's current avatar for denormalized fast feed rendering
    const author = await User.findById(req.user.userId).select('avatarUrl');

    const newPost = await Post.create({
      authorId: req.user.userId,
      authorUsername: req.user.username,
      authorAvatarUrl: author?.avatarUrl || '',
      text: trimmedText || undefined,
      imageUrl: finalImageUrl || undefined,
      likes: [],
      comments: [],
      createdAt: new Date(),
    });

    return sendSuccess(res, { post: newPost }, 'Post created successfully.', 201);
  } catch (error) {
    console.error('createPost error:', error);
    return sendError(res, error.message || 'Server error creating post.', 500);
  }
};

/**
 * @route   GET /api/posts
 * @desc    Fetch paginated post feed (cursor-based, newest first)
 * @access  Public
 */
const getPosts = async (req, res) => {
  try {
    const rawLimit = parseInt(req.query.limit, 10) || DEFAULT_FEED_LIMIT;
    const limit = Math.min(Math.max(rawLimit, 1), MAX_FEED_LIMIT);
    const before = req.query.before;

    const query = {};
    if (before) {
      const beforeDate = new Date(before);
      if (!isNaN(beforeDate.getTime())) {
        query.createdAt = { $lt: beforeDate };
      }
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = posts.length > limit;
    const paginatedPosts = hasMore ? posts.slice(0, limit) : posts;

    return sendSuccess(res, {
      count: paginatedPosts.length,
      hasMore,
      posts: paginatedPosts,
    });
  } catch (error) {
    console.error('getPosts error:', error);
    return sendError(res, 'Server error fetching posts.', 500);
  }
};

/**
 * @route   POST /api/posts/:id/like
 * @desc    Toggle like/unlike on a post
 * @access  Private (requires valid JWT)
 */
const toggleLike = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return sendError(res, 'Post not found.', 404);
    }

    const currentUserId = req.user.userId.toString();
    const currentUsername = req.user.username.trim();

    // Check if user has already liked
    const existingIndex = post.likes.findIndex(
      (like) =>
        (like.userId && like.userId.toString() === currentUserId) ||
        (like.username && like.username.toLowerCase() === currentUsername.toLowerCase())
    );

    let liked = false;
    if (existingIndex > -1) {
      // Remove like (unlike)
      post.likes.splice(existingIndex, 1);
      liked = false;
    } else {
      // Add like
      post.likes.push({
        userId: currentUserId,
        username: currentUsername,
      });
      liked = true;
    }

    await post.save();

    return sendSuccess(res, {
      liked,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    console.error('toggleLike error:', error);
    return sendError(res, 'Server error toggling like.', 500);
  }
};

/**
 * @route   POST /api/posts/:id/comment
 * @desc    Add a comment to an existing post
 * @access  Private (requires valid JWT)
 */
const addComment = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    const { id } = req.params;
    const { text } = req.body;

    const trimmedText = typeof text === 'string' ? text.trim() : '';
    if (!trimmedText) {
      return sendError(res, 'Comment text cannot be empty.', 400);
    }

    if (trimmedText.length > MAX_COMMENT_LENGTH) {
      return sendError(res, `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`, 400);
    }

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 'Post not found.', 404);
    }

    const newComment = {
      userId: req.user.userId,
      username: req.user.username,
      text: trimmedText,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const createdComment = post.comments[post.comments.length - 1];

    return sendSuccess(
      res,
      {
        comment: createdComment,
        comments: post.comments,
        commentCount: post.comments.length,
      },
      'Comment added successfully.',
      201
    );
  } catch (error) {
    console.error('addComment error:', error);
    return sendError(res, 'Server error adding comment.', 500);
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLike,
  addComment,
};
