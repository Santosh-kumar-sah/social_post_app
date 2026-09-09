import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(
  cloudName &&
  apiKey &&
  apiSecret &&
  cloudName !== 'your_cloudinary_cloud_name' &&
  apiKey !== 'your_cloudinary_api_key'
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

/**
 * Upload an image buffer to Cloudinary, or return base64 Data URL fallback for local development.
 */
export const uploadImageBuffer = async (
  buffer: Buffer,
  mimetype: string
): Promise<string> => {
  if (!isConfigured) {
    // Graceful fallback for local development without credentials:
    // convert buffer to base64 Data URL so images still render perfectly
    const base64 = buffer.toString('base64');
    return `data:${mimetype};base64,${base64}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'pulse_posts',
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload error:', error);
          reject(error || new Error('Upload failed'));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

export default cloudinary;
