/**
 * ============================================================================
 * Media Upload Middleware — Multer In-Memory Storage
 * ============================================================================
 * Architectural Constraint:
 * - Hosted services operate on ephemeral filesystems. Local disk storage is
 *   lost on server restart or redeploy.
 * - This middleware buffers uploads directly into RAM memory (`multer.memoryStorage()`)
 *   for seamless streaming into Cloudinary or base64 conversion without disk residues.
 * - Enforces a strict maximum file size and filters exclusively for image MIME types.
 */

const multer = require('multer');
const { MAX_FILE_SIZE_BYTES } = require('../config/constants');

// Store uploaded files in memory as Buffer objects
const storage = multer.memoryStorage();

// File filter: only permit standard image formats
const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed.'));
  }
};

const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
}).single('image');

module.exports = { uploadSingleImage };
