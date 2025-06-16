const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/signup', async (req, res) => {
  const { username, email, password, companyName } = req.body;

  if (!username || !email || !password || !companyName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newUser = new User({ username, email, password, companyName });
    await newUser.save();
    return res.status(201).json({ message: 'User created successfully' });

  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.username) {
        return res.status(400).json({ error: 'Username already exists. Please choose a different one.' });
      }
      if (err.keyPattern?.companyName) {
        return res.status(400).json({ error: 'Company name already exists. Please use another.' });
      }
    }
    return res.status(500).json({ error: 'Server error. Try again later.' });
  }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password for security
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username, password }); // In production, use hashed passwords

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account is disabled. Please contact admin.' });
    }

    // Generate a sessionId for WhatsApp client (use companyName or username for uniqueness)
    const sessionId = user.companyName || user.username;

    // Initialize WhatsApp client for this sessionId
    const { initializeWhatsAppClient } = require('../whatsapp/client');
    const io = req.app.get('io'); // Make sure to set io in app.js/server.js
    initializeWhatsAppClient(io, sessionId);

    res.status(200).json({ 
      message: 'Login successful',
      companyName: user.companyName,
      username: user.username,
      sessionId // send sessionId to frontend
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/:id/activate', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: true });
    res.json({ message: 'User activated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to activate user' });
  }
});
// Update user permissions
router.patch('/users/:id/permissions', async (req, res) => {
  try {
    const { accessPermissions } = req.body;
    await User.findByIdAndUpdate(req.params.id, { accessPermissions });
    res.json({ message: 'Permissions updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});
router.get('/users/:username/permissions', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }, 'accessPermissions');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ accessPermissions: user.accessPermissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

router.patch('/users/:id/deactivate', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

module.exports = router;