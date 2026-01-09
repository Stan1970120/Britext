import mongoose from 'mongoose';

const publishBookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, default: 'Admin' },
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
  
  // Chapter logic
  chapters: [{
    title: { type: String },
    content: { type: String }, // Locked behind payment logic in the controller
    order: { type: Number }
  }],
  
}, { timestamps: true }); // Adding timestamps automatically handles createdAt and updatedAt

// ✨ The fix for Render: Use 'export default' instead of 'module.exports'
const PublishBook = mongoose.model('PublishBook', publishBookSchema);
export default PublishBook;