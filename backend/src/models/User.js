import mongoose from "mongoose";

const purchasedBookSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PublishBook",
    required: true,
  },
  lastDownloadedAt: {
    type: Date,
    default: null, 
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  provider: { type: String, default: "local" },

  // OTP & Email Verification Fields
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },

  // Support download tracking
  purchasedBooks: [purchasedBookSchema],
}, { timestamps: true });

export default mongoose.model("User", userSchema);


/*
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  provider: { type: String, default: "local" },

  // OTP & Email Verification Fields
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },

  purchasedBooks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "PublishBook" 
  }],
}, { timestamps: true });

export default mongoose.model("User", userSchema);


/*
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  provider: { type: String, default: "local" },
 
  purchasedBooks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Book" 
  }],
}, { timestamps: true });

export default mongoose.model("User", userSchema);

/*
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional if using OAuth
  role: { type: String, enum: ["user", "admin"], default: "user" },
  provider: { type: String, default: "local" }, // "local", "google", "apple"
}, { timestamps: true });

export default mongoose.model("User", userSchema);
*/