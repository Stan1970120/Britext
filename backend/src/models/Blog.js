const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: 160
  },
  content: {
    type: String,
    required: true
  },
  coverImage: {
    type: String, 
    required: true
  },
  category: {
    type: String,
    default: 'Trending',
    enum: ['Trending', 'Reviews', 'Productivity', 'Authors']
  },
  liveUrl: {
    type: String,
    trim: true
  },
  views: {
    type: Number,
    default: 0
  },
  linkClicks: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Auto-generate slug before validation checks run
BlogSchema.pre('validate', function(next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);