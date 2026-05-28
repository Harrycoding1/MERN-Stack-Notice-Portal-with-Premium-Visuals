import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  }
}, {
  timestamps: true
});

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Notice content is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Notice category is required'],
    enum: {
      values: ['URGENT', 'GENERAL', 'EVENT'],
      message: '{VALUE} is not a valid notice category'
    },
    default: 'GENERAL'
  },
  department: {
    type: String,
    required: [true, 'Department targeting is required'],
    enum: {
      values: ['All', 'BBA', 'IT', 'Engineering', 'Science'],
      message: '{VALUE} is not a valid department'
    },
    default: 'All'
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);
export const Notice = mongoose.model('Notice', noticeSchema);
