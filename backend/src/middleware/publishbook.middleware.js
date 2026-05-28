import jwt from 'jsonwebtoken';
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";


const s3 = new S3Client({
  region: process.env.AWS_BOOK_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const upload = multer({
  storage: multerS3({
    s3: s3,
   
    bucket: process.env.AWS_BOOK_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // Logic to separate covers from illustrations in S3 folders
      let folder = "misc/";
      if (file.fieldname === 'cover') folder = "covers/";
      else if (file.fieldname.startsWith('chapterIllustration')) folder = "illustrations/";
      else if (file.fieldname === 'docFile' || file.fieldname === 'epubFile') folder = "manuscripts/";
      
      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
      cb(null, folder + fileName);
    },
    
  }),
});

export const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: "Forbidden" });
    req.user = decoded; // Standardizing to req.user
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Session expired" });
  }
};
/*
import jwt from 'jsonwebtoken';
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // Logic to separate covers from illustrations in S3 folders
      let folder = "misc/";
      if (file.fieldname === 'cover') folder = "covers/";
      else if (file.fieldname.startsWith('chapterIllustration')) folder = "illustrations/";
      else if (file.fieldname === 'docFile' || file.fieldname === 'epubFile') folder = "manuscripts/";
      
      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
      cb(null, folder + fileName);
    },
    
  }),
});


export const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: "Forbidden" });
    req.user = decoded; // Standardizing to req.user
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Session expired" });
  }
};
*/