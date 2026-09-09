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
