const { Router } = require('express');
const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
} = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');
const { uploadSingleImage } = require('../middleware/upload');

const router = Router();

// Public feed route
router.get('/', getPosts);

// Protected post creation route
router.post('/', requireAuth, uploadSingleImage, createPost);

// Protected like toggle route
router.post('/:id/like', requireAuth, toggleLike);

// Protected comment addition route
router.post('/:id/comment', requireAuth, addComment);

module.exports = router;
