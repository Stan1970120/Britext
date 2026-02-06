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
  coverImage: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  
  // ✨ ADDED: Rating Fields for Persistence
  rating: { 
    type: Number, 
    default: 0 
  },
  numReviews: { 
    type: Number, 
    default: 0 
  },

  // Chapter logic
  chapters: [{
    title: { type: String },
    content: { type: String }, 
    order: { type: Number }
  }],
  
}, { timestamps: true });

const PublishBook = mongoose.model('PublishBook', publishBookSchema);
export default PublishBook;