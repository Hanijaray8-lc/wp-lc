const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadPath),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

module.exports = function (getClient) {
  const router = express.Router();

  function getClientFromSession(req, res) {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId || req.body.sessionId;
    if (!sessionId) {
      res.status(400).json({ error: 'Missing sessionId' });
      return null;
    }

    const client = getClient(sessionId);
    if (!client || !client.info) {
      res.status(401).json({ error: 'Invalid or unauthenticated session' });
      return null;
    }

    return client;
  }

  // ✅ Get Contacts
  router.get('/contacts', async (req, res) => {
    const client = getClientFromSession(req, res);
    if (!client) return;

    try {
      const contacts = await client.getContacts();
      const formatted = contacts
        .filter(c => c.isMyContact && c.number)
        .map(c => ({
          id: c.id._serialized,
          name: c.name || c.pushname || c.number,
          number: c.number
        }));
      res.json({ contacts: formatted });
    } catch (err) {
      console.error('❌ Error fetching contacts:', err.message);
      res.status(500).json({ error: 'Failed to fetch WhatsApp contacts' });
    }
  });

  // ✅ Send Text
  router.post('/send-message', async (req, res) => {
    const client = getClientFromSession(req, res);
    if (!client) return;

    const { ids, message } = req.body;
    if (!ids?.length || !message?.trim()) {
      return res.status(400).json({ error: 'Missing ids or message' });
    }

    try {
      for (const id of ids) {
        await client.sendMessage(id, message);
      }
      res.json({ success: true });
    } catch (err) {
      console.error('❌ Error sending message:', err.message);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // ✅ Upload Media
  router.post('/upload', (req, res) => {
    upload.single('media')(req, res, (err) => {
      if (err) {
        console.error('❌ Upload error:', err.message);
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      res.json({ fileName: req.file.filename });
    });
  });

  // ✅ Send Media
  router.post('/send-media', async (req, res) => {
    const client = getClientFromSession(req, res);
    if (!client) return;

    const { ids, fileName, caption } = req.body;
    if (!ids?.length || !fileName) {
      return res.status(400).json({ error: 'Missing ids or fileName' });
    }

    const filePath = path.join(uploadPath, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    try {
      for (const id of ids) {
        await client.sendMessage(id, fs.createReadStream(filePath), { caption });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('❌ Error sending media:', err.message);
      res.status(500).json({ error: 'Failed to send media' });
    }
  });

  return router;
};
