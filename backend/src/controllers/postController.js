const Post = require('../models/Post');
const User = require('../models/User');
const { uploadImageBuffer } = require('../config/cloudinary');

// @route   POST /api/posts
// @desc    Create a new post (text OR image OR both required)
const createPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to post.' });
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
      return res.status(400).json({
        success: false,
        message: 'A post must contain either text, an image, or both.',
      });
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

    return res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      post: newPost,
    });
  } catch (error) {
    console.error('createPost error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating post.',
    });
  }
};

// @route   GET /api/posts
// @desc    Get all posts (newest first, public, cursor paginated)
const getPosts = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 50);
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

    return res.status(200).json({
      success: true,
      count: paginatedPosts.length,
      hasMore,
      posts: paginatedPosts,
    });
  } catch (error) {
    console.error('getPosts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching posts.',
    });
  }
};

// @route   POST /api/posts/:id/like
// @desc    Toggle like/unlike on a post (records userId & username)
const toggleLike = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
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

    return res.status(200).json({
      success: true,
      liked,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    console.error('toggleLike error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error toggling like.',
    });
  }
};

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post (records userId, username, text, createdAt)
const addComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { id } = req.params;
    const { text } = req.body;

    const trimmedText = typeof text === 'string' ? text.trim() : '';
    if (!trimmedText) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.',
      });
    }

    if (trimmedText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot exceed 500 characters.',
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
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

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: createdComment,
      comments: post.comments,
      commentCount: post.comments.length,
    });
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding comment.',
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLike,
  addComment,
};
