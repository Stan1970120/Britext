import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';

// Initialize S3 Client
export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Cache image data allocations direct to memory stream buffers
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid asset parameter. Upload images only.'), false);
    }
  }
});