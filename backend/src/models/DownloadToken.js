import mongoose from 'mongoose';

const DownloadTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 
  bookIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true }],
  isUsed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });


DownloadTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const DownloadToken = mongoose.model('DownloadToken', DownloadTokenSchema);
export default DownloadToken;