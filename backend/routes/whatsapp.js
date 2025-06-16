const express = require('express');
const Campaign = require('../models/Campaign');
const { parseContactsFile } = require('../utils/parseContactsFile');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = function (whatsappClient) {
  const router = express.Router();

  const getSessionId = (req) => {
    return req.body.sessionId || whatsappClient.getDefaultSessionId?.() || null;
  };

  const getClient = (sessionId) => {
    return whatsappClient.getClient(sessionId);
  };

  // 🔹 Init WhatsApp Client
  router.post('/init', async (req, res) => {
    if (!whatsappClient.initClient) {
      return res.status(500).json({ error: 'WhatsApp client not available' });
    }
    whatsappClient.initClient(res);
  });

  // 🔹 Send Bulk Messages
  router.post('/send-bulk', async (req, res) => {
    const sessionId = getSessionId(req);
    if (!sessionId) return res.status(400).json({ error: 'No session ID found' });

    const client = getClient(sessionId);
    if (!client || !client.info) {
      return res.status(400).json({ error: 'Invalid or unauthenticated session: ' + sessionId });
    }

    try {
      const message = req.body.message;
      if (!message) return res.status(400).json({ error: 'Message is required' });

      let contacts = [];

      if (req.files?.contacts) {
        const parsed = await parseContactsFile(req.files.contacts);
        contacts.push(...parsed);
      }

      if (req.body.phoneNumbers) {
        const manual = req.body.phoneNumbers
          .split(',')
          .map(p => p.trim())
          .filter(p => /^\d{10,15}$/.test(p))
          .map(phone => ({ phone }));
        contacts.push(...manual);
      }

      const uniquePhones = [...new Set(contacts.map(c => c.phone))];
      if (uniquePhones.length === 0) return res.status(400).json({ error: 'No valid phone numbers' });

      const report = { total: uniquePhones.length, success: 0, failed: 0, failedNumbers: [] };

      let mediaMsg = null;
      if (req.files?.media) {
        const media = req.files.media;
        mediaMsg = new MessageMedia(media.mimetype, media.data.toString('base64'), media.name);
      }

      for (const phone of uniquePhones) {
        const number = phone.includes('@c.us') ? phone : `${phone}@c.us`;
        try {
          if (mediaMsg) {
            await client.sendMessage(number, mediaMsg, { caption: message });
          } else {
            await client.sendMessage(number, message);
          }
          report.success++;
        } catch (err) {
          report.failed++;
          report.failedNumbers.push(phone);
          console.error(`❌ Failed to send to ${phone}:`, err.message);
        }
        await new Promise(res => setTimeout(res, 1000));
      }

      await new Campaign({
        date: new Date(),
        totalContacts: report.total,
        successful: report.success,
        failed: report.failed,
        message,
        failedNumbers: report.failedNumbers,
        media: req.files?.media ? {
          name: req.files.media.name,
          mimetype: req.files.media.mimetype,
          size: req.files.media.size
        } : null,
        companyName: req.body.companyName
      }).save();

      res.json({ message: 'Bulk message sending complete', report });
    } catch (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({ error: 'Failed to send messages', details: err.message });
    }
  });

  // 🔹 Schedule Messages
  router.post('/schedule', async (req, res) => {
    const sessionId = getSessionId(req);
    if (!sessionId) return res.status(400).json({ error: 'No session ID found' });

    const client = getClient(sessionId);
    if (!client || !client.info) {
      return res.status(400).json({ error: 'Invalid or unauthenticated session: ' + sessionId });
    }

    try {
      const message = req.body.message;
      const scheduleTime = req.body.scheduleTime;
      if (!scheduleTime || !message) return res.status(400).json({ error: 'Missing schedule time or message' });

      let contacts = [];

      if (req.files?.contacts) {
        contacts = await parseContactsFile(req.files.contacts);
      }

      if (req.body.phoneNumbers) {
        const manual = req.body.phoneNumbers
          .split(',')
          .map(p => p.trim())
          .filter(p => /^\d{10,15}$/.test(p))
          .map(phone => ({ phone }));
        contacts = contacts.concat(manual);
      }

      const uniquePhones = [...new Set(contacts.map(c => c.phone))];
      if (uniquePhones.length === 0) return res.status(400).json({ error: 'No valid phone numbers' });

      const dateObj = new Date(scheduleTime);
      if (isNaN(dateObj)) return res.status(400).json({ error: 'Invalid schedule time format' });

      const delayMs = dateObj.getTime() - Date.now();
      if (delayMs <= 0) return res.status(400).json({ error: 'Schedule time must be in the future' });

      let mediaMsg = null;
      let mediaInfo = null;
      if (req.files?.media) {
        const media = req.files.media;
        mediaMsg = new MessageMedia(media.mimetype, media.data.toString('base64'), media.name);
        mediaInfo = {
          name: media.name,
          mimetype: media.mimetype,
          size: media.size
        };
      }

      setTimeout(async () => {
        const report = { total: uniquePhones.length, success: 0, failed: 0, failedNumbers: [] };

        for (const phone of uniquePhones) {
          const number = phone.includes('@c.us') ? phone : `${phone}@c.us`;
          try {
            if (mediaMsg) {
              await client.sendMessage(number, mediaMsg, { caption: message });
            } else {
              await client.sendMessage(number, message);
            }
            report.success++;
          } catch (err) {
            report.failed++;
            report.failedNumbers.push(phone);
            console.error(`❌ Scheduled send failed to ${phone}:`, err.message);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await new Campaign({
          date: new Date(),
          totalContacts: report.total,
          successful: report.success,
          failed: report.failed,
          message,
          failedNumbers: report.failedNumbers,
          media: mediaInfo,
          companyName: req.body.companyName
        }).save();

        console.log(`📤 Scheduled campaign completed at ${new Date().toLocaleTimeString()}`);
      }, delayMs);

      res.json({ message: 'Message scheduled successfully for ' + new Date(scheduleTime).toLocaleString() });
    } catch (err) {
      console.error('❌ Scheduling error:', err.message);
      res.status(500).json({ error: 'Failed to schedule message', details: err.message });
    }
  });

  // 🔹 Get Latest Campaign
  router.get('/latest-campaign', async (req, res) => {
    try {
      const { companyName } = req.query;
      const filter = companyName ? { companyName } : {};
      const latest = await Campaign.findOne(filter).sort({ date: -1 });
      if (!latest) return res.status(404).json({ error: 'No campaigns found' });
      res.json({
        report: {
          total: latest.totalContacts,
          success: latest.successful,
          failed: latest.failed,
          failedNumbers: latest.failedNumbers || []
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch report' });
    }
  });

  // 🔹 Get Campaign History
  router.get('/campaign-history', async (req, res) => {
    try {
      const { companyName } = req.query;
      const filter = companyName ? { companyName } : {};
      const campaigns = await Campaign.find(filter).sort({ date: -1 });
      res.json({ campaigns });
    } catch (err) {
      console.error('❌ Error fetching campaign history:', err.message);
      res.status(500).json({ error: 'Failed to fetch campaign history' });
    }
  });

  return router;
};
