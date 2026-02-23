import jwt from 'jsonwebtoken';
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

// --- 1. S3 CONFIGURATION ---
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// --- 2. MULTER-S3 UPLOAD ENGINE ---
export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      // Organize into folders: covers/ for images, manuscripts/ for PDFs
      const folder = file.fieldname === "cover" ? "covers/" : "manuscripts/";
      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
      cb(null, folder + fileName);
    },
    // Amazon KDP Logic: Covers are public, Manuscripts are private
    acl: (req, file, cb) => {
      if (file.fieldname === "cover") {
        cb(null, "public-read"); // Everyone can view the cover
      } else {
        cb(null, "private"); // Manuscript is locked (needs Presigned URL to download)
      }
    },
  }),
});

// --- 3. EXISTING AUTH MIDDLEWARE ---
export const verifyAdmin = (req, res, next) => {
  const token = 
    req.cookies?.admin_token || 
    req.cookies?.token || 
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized: No admin token provided." 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Admin privileges required." 
      });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized: Session expired." 
    });
  }
};

export const verifyUser = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(); 
  }
};