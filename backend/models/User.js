const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String },
  companyName: { type: String, required: true, unique: true },
});

// Ensure both fields are unique (optional — Mongoose already handles it)
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ companyName: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
