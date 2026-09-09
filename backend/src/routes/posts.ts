import { Router } from 'express';
import {
  createPost,
  getPosts,
  toggleLike,
  addComment,
} from '../controllers/postController';
import { requireAuth } from '../middleware/auth';
import { uploadSingleImage } from '../middleware/upload';

const router = Router();

// Public feed route
router.get('/', getPosts);

// Protected post creation route
router.post('/', requireAuth, uploadSingleImage, createPost);

// Protected like toggle route
router.post('/:id/like', requireAuth, toggleLike);

// Protected comment addition route
router.post('/:id/comment', requireAuth, addComment);

export default router;
