import mongoose from 'mongoose';

const publishBookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, default: 'Admin' }, 
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  summary: { type: String },
  category: { 
    type: String, 
    enum: [
      "Educational", 
      "Fiction", 
      "Non-Fiction", 
      "Professional & Technical", 
      "Faith Based", 
      "Lifestyle", 
      "Journal & Notes"
    ],
    default: "Fiction"
  },
  price: { type: Number, default: 0 },
  coverImage: { type: String }, // Stores the Public S3 URL
  
  // ✨ NEW: Stores the path to the private PDF in S3
  manuscriptKey: { type: String }, 

  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },

  estimatedPages: { type: Number, default: 1 },

  chapters: [{
    title: { type: String }, 
    heading: { type: String }, 
    content: { type: String }, 
    order: { type: Number }
  }],
  
}, { timestamps: true });

const PublishBook = mongoose.model('PublishBook', publishBookSchema);
export default PublishBook;