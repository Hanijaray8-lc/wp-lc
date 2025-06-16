const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  totalContacts: Number,
  successful: Number,
  failed: Number,
  message: String,
  failedNumbers: [String],
  media: {
    name: String,
    mimetype: String,
    size: Number,
  },
  companyName: String // Add this line
});

module.exports = mongoose.model('Campaign', campaignSchema);
