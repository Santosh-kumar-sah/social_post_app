import { Router } from 'express';
import { createPost, getPosts } from '../controllers/postController';
import { requireAuth } from '../middleware/auth';
import { uploadSingleImage } from '../middleware/upload';

const router = Router();

// Public feed route
router.get('/', getPosts);

// Protected post creation route
router.post('/', requireAuth, uploadSingleImage, createPost);

export default router;
