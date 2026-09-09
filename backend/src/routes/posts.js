/**
 * Post & Social Interaction Routes (/api/posts)
 * 
 * Endpoints:
 * - GET  /api/posts           -> Public paginated feed (supports ?limit=15&before=<ISO_DATE>)
 * - POST /api/posts           -> Create post (requires auth + multipart/form-data or json)
 * - POST /api/posts/:id/like  -> Toggle like/unlike (requires auth)
 * - POST /api/posts/:id/comment -> Add comment to post (requires auth + body { text })
 */

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

// Public feed route: newest first, cursor paginated
router.get('/', getPosts);

// Protected post creation route: accepts optional file attachment or imageUrl
router.post('/', requireAuth, uploadSingleImage, createPost);

// Protected like toggle route: records both userId and username in embedded array
router.post('/:id/like', requireAuth, toggleLike);

// Protected comment route: pushes comment subdocument with author details
router.post('/:id/comment', requireAuth, addComment);

module.exports = router;
