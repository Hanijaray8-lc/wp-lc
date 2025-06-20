const ResponseRule = require('../models/ResponseRule');

exports.addRule = async (req, res) => {
  const { keyword, response, sessionId, companyName } = req.body;
  if (!keyword || !response || !sessionId || !companyName)
    return res.status(400).json({ error: 'Keyword, response, sessionId, and companyName required' });
  const rule = new ResponseRule({ keyword, response, sessionId, companyName });
  await rule.save();
  res.json({ message: 'Rule added', rule });
};

exports.getRules = async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
  const rules = await ResponseRule.find({ sessionId });
  res.json({ rules });
};

exports.updateRule = async (req, res) => {
  const { id } = req.params;
  const { keyword, response, sessionId } = req.body;
  try {
    const updatedRule = await ResponseRule.findOneAndUpdate(
      { _id: id, sessionId },
      { keyword, response },
      { new: true }
    );
    res.json({ message: 'Rule updated', rule: updatedRule });
  } catch (error) {
    res.status(500).json({ error: 'Error updating rule' });
  }
};

exports.deleteRule = async (req, res) => {
  const { id } = req.params;
  const { sessionId } = req.query;
  try {
    await ResponseRule.findOneAndDelete({ _id: id, sessionId });
    res.json({ message: 'Rule deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting rule' });
  }
};