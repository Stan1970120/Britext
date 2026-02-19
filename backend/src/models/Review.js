import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PublishBook', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String 
  }
}, { timestamps: true });

// Prevent duplicate reviews from the same user on the same book
// This is critical for accurate average calculation
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);