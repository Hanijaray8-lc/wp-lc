const express = require('express');
<<<<<<< HEAD
=======
const User = require('../models/User'); // Add at the top
>>>>>>> 1074a2a (secc)

module.exports = function({ getClient, io }) {
  const router = express.Router();

  router.post('/logout', async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Missing sessionId' });
    }

    try {
      const { logoutClient } = require('../whatsapp/client');
      await logoutClient(sessionId);

<<<<<<< HEAD
=======
      // Update User: set isWhatsAppAuthenticated false
      await User.findOneAndUpdate(
        { sessionId },
        { isWhatsAppAuthenticated: false }
      );

>>>>>>> 1074a2a (secc)
      io.to(sessionId).emit('disconnected', 'logout');
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};
