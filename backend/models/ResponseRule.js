const mongoose = require('mongoose');

const responseRuleSchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  response: { type: String, required: true },
  sessionId: { type: String, required: true }, // <-- Add this line
  companyName: { type: String, required: true }
});

module.exports = mongoose.model('ResponseRule', responseRuleSchema);