import express from 'express';
import jwt from 'jsonwebtoken';
import DownloadToken from '../models/DownloadToken.js';
import Blog from '../models/Blog.js'; 

const router = express.Router();

router.get('/secure-claim', async (req, res) => {
  const { token } = req.query;

  if (!token) return res.status(400).json({ error: "Missing identity assertion token asset." });

  try {
    //  Verify token cryptographic integrity and expiration age 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Verify tracking footprint inside DB to catch replay attacks
    const tokenRecord = await DownloadToken.findOne({ token });

    if (!tokenRecord) {
      return res.status(410).json({ error: "Download link does not exist or has expired." });
    }

    if (tokenRecord.isUsed) {
      return res.status(403).json({ error: "This secure download link has already been used." });
    }

   
    tokenRecord.isUsed = true;
    await tokenRecord.save();

    
    const books = await Blog.find({ _id: { $in: tokenRecord.bookIds } });

    return res.status(200).json({
      message: "Access Authorized. Token burned successfully.",
      downloadTargets: books.map(b => b.liveUrl || b.coverImage) 
    });

  } catch (err) {
    return res.status(401).json({ error: "Invalid signature payload token context validation failed." });
  }
});

export default router;