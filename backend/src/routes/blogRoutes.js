import express from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3, upload } from '../config/S3.js'; 
import Blog from '../models/Blog.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/admin/upload-s3', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing asset payload resource." });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFilename = `enjoyreads-blogs/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueFilename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    await s3.send(new PutObjectCommand(uploadParams));
    
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
    
    return res.status(200).json({ coverImage: publicUrl });
  } catch (err) {
    console.error("S3 Engine Stream Error: ", err);
    return res.status(500).json({ error: "Storage execution layer drop failure." });
  }
});

// SECURED: Creation entry remains safely gated
router.post('/admin/create', protect, adminOnly, async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, category, liveUrl } = req.body;
    
    const newBlog = new Blog({
      title,
      excerpt,
      content,
      coverImage,
      category,
      liveUrl
    });

    await newBlog.save();
    return res.status(201).json({ success: true, blog: newBlog });
  } catch (err) {
    console.error("Create Block Error: ", err);
    return res.status(500).json({ error: "Failed to persist dynamic article content entry." });
  }
});

// SECURED: Administration feed management index
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).select('title category slug liveUrl');
    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(500).json({ error: "Index synchronization failed." });
  }
});

// SECURED: Purge controls
router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const targetBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!targetBlog) return res.status(404).json({ error: "Document mismatch error." });
    return res.status(200).json({ success: true, message: "Article safely removed." });
  } catch (err) {
    return res.status(500).json({ error: "Purging logic error." });
  }
});

// SECURED: Dashboard analytics aggregation engine
router.get('/admin/metrics', protect, adminOnly, async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    
    const aggregates = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalClicks: { $sum: "$linkClicks" }
        }
      }
    ]);

    const metricsData = aggregates[0] || { totalViews: 0, totalClicks: 0 };
    const computedOutreach = metricsData.totalViews;
    const rawVisitRate = computedOutreach > 0 ? (metricsData.totalClicks / computedOutreach) * 100 : 0;

    return res.status(200).json({
      publishedCount: totalBlogs,
      outreach: computedOutreach,
      visitPercentage: parseFloat(rawVisitRate.toFixed(1))
    });
  } catch (err) {
    return res.status(500).json({ error: "Aggregation analytics calculation dropped." });
  }
});

// PUBLIC: Global client data read stream
router.get('/public/feed', async (req, res) => {
  try {
    const feed = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json(feed);
  } catch (err) {
    return res.status(500).json({ error: "Public timeline extraction fault." });
  }
});

export default router; 
/*
import express from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3, upload } from '../config/S3.js'; 
import Blog from '../models/Blog.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/admin/upload-s3', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing asset payload resource." });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFilename = `enjoyreads-blogs/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueFilename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    await s3.send(new PutObjectCommand(uploadParams));
    
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
    
    return res.status(200).json({ coverImage: publicUrl });
  } catch (err) {
    console.error("S3 Engine Stream Error: ", err);
    return res.status(500).json({ error: "Storage execution layer drop failure." });
  }
});

router.post('/admin/create', protect, adminOnly, async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, category, liveUrl } = req.body;
    
    const newBlog = new Blog({
      title,
      excerpt,
      content,
      coverImage,
      category,
      liveUrl
    });

    await newBlog.save();
    return res.status(201).json({ success: true, blog: newBlog });
  } catch (err) {
    console.error("Create Block Error: ", err);
    return res.status(500).json({ error: "Failed to persist dynamic article content entry." });
  }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).select('title category slug liveUrl');
    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(500).json({ error: "Index synchronization failed." });
  }
});

router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const targetBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!targetBlog) return res.status(404).json({ error: "Document mismatch error." });
    return res.status(200).json({ success: true, message: "Article safely removed." });
  } catch (err) {
    return res.status(500).json({ error: "Purging logic error." });
  }
});

router.get('/admin/metrics', protect, adminOnly, async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    
    const aggregates = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalClicks: { $sum: "$linkClicks" }
        }
      }
    ]);

    const metricsData = aggregates[0] || { totalViews: 0, totalClicks: 0 };
    const computedOutreach = metricsData.totalViews;
    const rawVisitRate = computedOutreach > 0 ? (metricsData.totalClicks / computedOutreach) * 100 : 0;

    return res.status(200).json({
      publishedCount: totalBlogs,
      outreach: computedOutreach,
      visitPercentage: parseFloat(rawVisitRate.toFixed(1))
    });
  } catch (err) {
    return res.status(500).json({ error: "Aggregation analytics calculation dropped." });
  }
});

router.get('/public/feed', async (req, res) => {
  try {
    const feed = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json(feed);
  } catch (err) {
    return res.status(500).json({ error: "Public timeline extraction fault." });
  }
});

export default router;
*/


/*
import express from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3, upload } from '../config/S3.js'; 
import Blog from '../models/Blog.js';
import verifyAdmin from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/admin/upload-s3', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing asset payload resource." });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFilename = `enjoyreads-blogs/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueFilename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    await s3.send(new PutObjectCommand(uploadParams));
    
    // Construct public access file URL target Location
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
    
    // Returns coverImage key to match frontend state expectations smoothly
    return res.status(200).json({ coverImage: publicUrl });
  } catch (err) {
    console.error("S3 Engine Stream Error: ", err);
    return res.status(500).json({ error: "Storage execution layer drop failure." });
  }
});

router.post('/admin/create', verifyAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, category, liveUrl } = req.body;
    
    const newBlog = new Blog({
      title,
      excerpt,
      content,
      coverImage,
      category,
      liveUrl
    });

    await newBlog.save();
    return res.status(201).json({ success: true, blog: newBlog });
  } catch (err) {
    console.error("Create Block Error: ", err);
    return res.status(500).json({ error: "Failed to persist dynamic article content entry." });
  }
});

router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).select('title category slug liveUrl');
    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(500).json({ error: "Index synchronization failed." });
  }
});

router.delete('/admin/:id', verifyAdmin, async (req, res) => {
  try {
    const targetBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!targetBlog) return res.status(404).json({ error: "Document mismatch error." });
    return res.status(200).json({ success: true, message: "Article safely removed." });
  } catch (err) {
    return res.status(500).json({ error: "Purging logic error." });
  }
});

router.get('/admin/metrics', verifyAdmin, async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    
    const aggregates = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalClicks: { $sum: "$linkClicks" }
        }
      }
    ]);

    const metricsData = aggregates[0] || { totalViews: 0, totalClicks: 0 };
    
    // Total views + clicks context
    const computedOutreach = metricsData.totalViews;
    
    //  Ratio of redirection conversion click behaviors
    const rawVisitRate = computedOutreach > 0 ? (metricsData.totalClicks / computedOutreach) * 100 : 0;

    return res.status(200).json({
      publishedCount: totalBlogs,
      outreach: computedOutreach,
      visitPercentage: parseFloat(rawVisitRate.toFixed(1))
    });
  } catch (err) {
    return res.status(500).json({ error: "Aggregation analytics calculation dropped." });
  }
});

router.get('/public/feed', async (req, res) => {
  try {
    const feed = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json(feed);
  } catch (err) {
    return res.status(500).json({ error: "Public timeline extraction fault." });
  }
});

export default router;
*/
/*
const express = require('express');
const router = express.Router();
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3, upload } = require('../config/s3');
const Blog = require('../models/Blog');
const verifyAdmin = require('../middleware/authMiddleware'); 
router.post('/admin/upload-s3', verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing asset payload resource." });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFilename = `enjoyreads-blogs/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueFilename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    await s3.send(new PutObjectCommand(uploadParams));
    
    // Construct public access file URL target Location
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
    
    return res.status(200).json({ url: publicUrl });
  } catch (err) {
    console.error("S3 Engine Stream Error: ", err);
    return res.status(500).json({ error: "Storage execution layer drop failure." });
  }
});


router.post('/admin/create', verifyAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, category, liveUrl } = req.body;
    
    const newBlog = new Blog({
      title,
      excerpt,
      content,
      coverImage,
      category,
      liveUrl
    });

    await newBlog.save();
    return res.status(201).json({ success: true, blog: newBlog });
  } catch (err) {
    console.error("Create Block Error: ", err);
    return res.status(500).json({ error: "Failed to persist dynamic article content entry." });
  }
});


router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).select('title category slug liveUrl');
    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(500).json({ error: "Index synchronization failed." });
  }
});


router.delete('/admin/:id', verifyAdmin, async (req, res) => {
  try {
    const targetBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!targetBlog) return res.status(404).json({ error: "Document mismatch error." });
    return res.status(200).json({ success: true, message: "Article safely removed." });
  } catch (err) {
    return res.status(500).json({ error: "Purging logic error." });
  }
});


router.get('/admin/metrics', verifyAdmin, async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    
    const aggregates = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalClicks: { $sum: "$linkClicks" }
        }
      }
    ]);

    const metricsData = aggregates[0] || { totalViews: 0, totalClicks: 0 };
    
    // Total views + clicks context
    const computedOutreach = metricsData.totalViews;
    
    //  Ratio of redirection conversion click behaviors
    const rawVisitRate = computedOutreach > 0 ? (metricsData.totalClicks / computedOutreach) * 100 : 0;

    return res.status(200).json({
      publishedCount: totalBlogs,
      outreach: computedOutreach,
      visitPercentage: parseFloat(rawVisitRate.toFixed(1))
    });
  } catch (err) {
    return res.status(500).json({ error: "Aggregation analytics calculation dropped." });
  }
});


router.get('/public/feed', async (req, res) => {
  try {
    const feed = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json(feed);
  } catch (err) {
    return res.status(500).json({ error: "Public timeline extraction fault." });
  }
});

module.exports = router;
*/