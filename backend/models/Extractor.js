const mongoose = require('mongoose');

const extractorSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  emails: [String],
  phones: [String],
  companyName: { // ✅ Add this field
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('extractor', extractorSchema);