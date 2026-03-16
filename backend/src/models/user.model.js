import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  history: [{
    model: { type: String, required: true },
    userInputs: mongoose.Schema.Types.Mixed,
    response: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
