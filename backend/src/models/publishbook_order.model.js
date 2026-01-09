import mongoose from 'mongoose';

const publishBookOrderSchema = new mongoose.Schema({
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PublishBook', // Links to your book model
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Links to your customer/user model
    required: true 
  },
  amountPaid: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  paymentReference: { 
    type: String, 
    required: true, 
    unique: true // Prevents duplicate order records for the same transaction
  },
  purchasedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Ensure the model is exported as a default for your ES Module imports
const PublishBookOrder = mongoose.model('PublishBookOrder', publishBookOrderSchema);
export default PublishBookOrder;