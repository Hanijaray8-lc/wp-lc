const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const Campaign = require('../models/Campaign');

const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadPath),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/', 'audio/', 'video/', 'application/pdf'];
    if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

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

    return { client, sessionId };
  }

  // Get Contacts
  router.get('/contacts', async (req, res) => {
    const session = getClientFromSession(req, res);
    if (!session) return;

    const { client } = session;

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

  // Upload Media
  router.post('/upload', upload.single('media'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({ fileName: req.file.filename });
  });

  // Send Text Message
  router.post('/send-message', async (req, res) => {
    const session = getClientFromSession(req, res);
    if (!session) return;

    const { client } = session;
    const { ids, message, companyName } = req.body;

    if (!ids?.length || !message?.trim()) {
      return res.status(400).json({ error: 'Missing ids or message' });
    }

    let failedNumbers = [];

    try {
      for (const id of ids) {
        try {
          await client.sendMessage(id, message);
        } catch (err) {
          console.error(`Failed to send to ${id}:`, err.message);
          failedNumbers.push(id);
        }
      }

      await Campaign.create({
        totalContacts: ids.length,
        successful: ids.length - failedNumbers.length,
        failed: failedNumbers.length,
        failedNumbers,
        message,
        companyName
      });

      res.json({ success: true, failedNumbers });
    } catch (err) {
      console.error('❌ Error sending message:', err.message);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Send Media
  router.post('/send-media', async (req, res) => {
    const session = getClientFromSession(req, res);
    if (!session) return;

    const { client } = session;
    const { ids, fileName, caption, companyName } = req.body;

    if (!ids?.length || !fileName) {
      return res.status(400).json({ error: 'Missing ids or fileName' });
    }

    const filePath = path.join(uploadPath, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    let failedNumbers = [];

    try {
      const media = MessageMedia.fromFilePath(filePath);

      for (const id of ids) {
        try {
          await client.sendMessage(id, media, { caption });
        } catch (err) {
          console.error(`Failed to send to ${id}:`, err.message);
          failedNumbers.push(id);
        }
      }

      const fileStats = fs.statSync(filePath);

      await Campaign.create({
        totalContacts: ids.length,
        successful: ids.length - failedNumbers.length,
        failed: failedNumbers.length,
        failedNumbers,
        message: caption,
        companyName,
        media: {
          name: fileName,
          mimetype: path.extname(fileName).slice(1),
          size: fileStats.size
        }
      });

      res.json({ success: true, failedNumbers });
    } catch (err) {
      console.error('❌ Error sending media:', err.message);
      res.status(500).json({ error: 'Failed to send media' });
    }
  });


  // Send Text Message
router.post('/message', async (req, res) => {
  const session = getClientFromSession(req, res);
  if (!session) return;

  const { client } = session;
  const { ids, message, companyName } = req.body;

  if (!ids?.length || !message?.trim()) {
    return res.status(400).json({ error: 'Missing ids or message' });
  }

  let failedNumbers = [];
  let sentCount = 0;

  try {
    for (const rawId of ids) {
      const id = rawId.replace('+', '').replace(/\D/g, '') + '@c.us';

      try {
        const isValid = await client.isRegisteredUser(id);
        if (!isValid) {
          console.warn(`🚫 Skipped: ${id} is not a registered WhatsApp user`);
          failedNumbers.push(rawId);
          continue;
        }

        await client.sendMessage(id, message);
        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${id}:`, err.message);
        failedNumbers.push(rawId);
      }
    }

    await Campaign.create({
      totalContacts: ids.length,
      successful: sentCount,
      failed: failedNumbers.length,
      failedNumbers,
      message,
      companyName
    });

    res.json({ success: true, failedNumbers });
  } catch (err) {
    console.error('❌ Error sending message:', err.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});



router.post('/google-message', async (req, res) => {
  const session = getClientFromSession(req, res);
  if (!session) return;

  const { client } = session;
  const { ids, message, companyName } = req.body;

  if (!ids?.length || !message?.trim()) {
    return res.status(400).json({ error: 'Missing ids or message' });
  }

  let failedNumbers = [];
  let sentCount = 0;

  const normalized = ids.map(num => {
    let digits = num.replace(/\D/g, '').replace(/^0+/, ''); // Remove non-digits and leading zeros
    if (!digits.startsWith('91')) digits = '91' + digits; // Assuming default country code
    return {
      raw: num,
      waId: `${digits}@c.us`,
    };
  });

  try {
    for (const { raw, waId } of normalized) {
      try {
        const isValid = await client.isRegisteredUser(waId);
        if (!isValid) {
          console.warn(`🚫 Skipped: ${waId} is not a registered WhatsApp user`);
          failedNumbers.push(raw);
          continue;
        }

        await client.sendMessage(waId, message);
        sentCount++;
      } catch (err) {
        console.error(`❌ Failed to send to ${waId}:`, err.message);
        failedNumbers.push(raw);
      }
    }

    await Campaign.create({
      totalContacts: ids.length,
      successful: sentCount,
      failed: failedNumbers.length,
      failedNumbers,
      message,
      companyName,
      timestamp: new Date(),
    });

    const results = ids.map(num => ({
      number: num,
      status: failedNumbers.includes(num) ? 'failed' : 'sent',
    }));

    res.json({ success: true, results });
  } catch (err) {
    console.error('❌ Error sending message:', err.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});




  return router;
};