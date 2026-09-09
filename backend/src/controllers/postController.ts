import { Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';
import { uploadImageBuffer } from '../config/cloudinary';

// @route   POST /api/posts
// @desc    Create a new post (text OR image OR both required)
export const createPost = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required to post.' });
      return;
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
      res.status(400).json({
        success: false,
        message: 'A post must contain either text, an image, or both.',
      });
      return;
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

    res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      post: newPost,
    });
  } catch (error: any) {
    console.error('createPost error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating post.',
    });
  }
};

// @route   GET /api/posts
// @desc    Get all posts (newest first, public)
export const getPosts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 15, 1), 50);
    const before = req.query.before as string;

    const query: any = {};
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

    res.status(200).json({
      success: true,
      count: paginatedPosts.length,
      hasMore,
      posts: paginatedPosts,
    });
  } catch (error: any) {
    console.error('getPosts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching posts.',
    });
  }
};

// @route   POST /api/posts/:id/like
// @desc    Toggle like/unlike on a post (records userId & username)
export const toggleLike = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found.' });
      return;
    }

    const currentUserId = req.user.userId;
    const currentUsername = req.user.username;

    // Check if user has already liked
    const existingIndex = post.likes.findIndex(
      (like: any) =>
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
        userId: currentUserId as any,
        username: currentUsername,
      });
      liked = true;
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error: any) {
    console.error('toggleLike error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling like.',
    });
  }
};

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post (records userId, username, text, createdAt)
export const addComment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const { text } = req.body;

    const trimmedText = typeof text === 'string' ? text.trim() : '';
    if (!trimmedText) {
      res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.',
      });
      return;
    }

    if (trimmedText.length > 500) {
      res.status(400).json({
        success: false,
        message: 'Comment cannot exceed 500 characters.',
      });
      return;
    }

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found.' });
      return;
    }

    const newComment = {
      userId: req.user.userId as any,
      username: req.user.username,
      text: trimmedText,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const createdComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: createdComment,
      comments: post.comments,
      commentCount: post.comments.length,
    });
  } catch (error: any) {
    console.error('addComment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment.',
    });
  }
};
