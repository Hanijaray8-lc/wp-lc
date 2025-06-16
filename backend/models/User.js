const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String },
  companyName: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  accessPermissions: {
    homepage: { type: Boolean, default: false },
    history: { type: Boolean, default: false },
    report: { type: Boolean, default: false },
    manual: { type: Boolean, default: false },
    xl: { type: Boolean, default: false },
    dashboard: { type: Boolean, default: false },
    group: { type: Boolean, default: false },
     contact: { type: Boolean, default: false }
  }
});

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ companyName: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);