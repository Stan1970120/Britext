const mongoose = require('mongoose');

const publishBookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, default: 'Admin' },
  summary: { type: String },
  category: { 
    type: String, 
    enum: ["Educational", "Fiction", "Non-Fiction", "Professional & Technical", "Faith Based", "Lifestyle", "Journal & Notes"],
    default: "Fiction"
  },
  price: { type: Number, default: 0 },
  coverImage: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  
  // Chapter logic: Note that we might want to keep content hidden from public lists
  chapters: [{
    title: { type: String },
    content: { type: String }, // This remains locked behind payment logic
    order: { type: Number }
  }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PublishBook', publishBookSchema);