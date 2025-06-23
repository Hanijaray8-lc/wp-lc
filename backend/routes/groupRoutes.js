const express = require('express');
const { MessageMedia } = require('whatsapp-web.js');
const Campaign = require('../models/Campaign'); // Adjust path as needed

module.exports = function (getClient, getAllSessions) {
  const router = express.Router();

  const getDefaultSessionClient = async () => {
    const sessions = await getAllSessions();
    if (!sessions.length) throw new Error("No active sessions");
    const sessionId = sessions[0].id;
    const client = getClient(sessionId);
    if (!client || !client.info) throw new Error("Client not authenticated");
    return client;
  };

  router.get('/my-groups', async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) return res.status(400).json({ error: 'Session ID is missing in request' });

      const client = getClient(sessionId);
      if (!client || !client.info) return res.status(404).json({ error: 'Invalid or unauthenticated session' });

      const chats = await client.getChats();
      const groups = chats.filter(chat => chat.isGroup);

      const groupData = await Promise.all(groups.map(async (group) => {
        try {
          const metadata = await client.getChatById(group.id._serialized);
          const participants = await Promise.all(
            metadata.participants.map(async (p) => {
              const contact = await client.getContactById(p.id._serialized);
              return {
                id: p.id._serialized,
                number: p.id.user, // raw number only
                name: contact.pushname || contact.name || p.id.user,
                isAdmin: p.isAdmin
              };
            })
          );

          return {
            sessionId,
            groupName: metadata.name,
            groupId: metadata.id._serialized,
            members: participants
          };
        } catch (err) {
          console.warn(`⚠️ Failed metadata for ${group.name}:`, err.message);
          return null;
        }
      }));

      res.json({ groups: groupData.filter(Boolean) });
    } catch (err) {
      console.error('❌ Error fetching group list:', err.message);
      res.status(500).json({ error: 'Failed to fetch group list' });
    }
  });

  router.post('/send-to-members', async (req, res) => {
    try {
      const client = await getDefaultSessionClient();
      const { message, companyName } = req.body;
      let recipients = [];

      try {
        recipients = typeof req.body.recipients === 'string' ? JSON.parse(req.body.recipients) : req.body.recipients;
      } catch {
        return res.status(400).json({ error: 'Invalid recipients format' });
      }

      if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: 'No recipients provided' });
      }

      const report = {
        total: recipients.length,
        success: 0,
        failed: 0,
        failedNumbers: []
      };

      let mediaMsg = null;
      let mediaData = null;

      if (req.files?.file) {
        const media = req.files.file;
        mediaMsg = new MessageMedia(
          media.mimetype,
          media.data.toString('base64'),
          media.name
        );

        mediaData = {
          name: media.name,
          mimetype: media.mimetype,
          size: media.size
        };
      }

      for (const rawNumber of recipients) {
        const number = rawNumber.includes('@c.us') ? rawNumber : `${rawNumber}@c.us`;
        try {
          if (mediaMsg) {
            await client.sendMessage(number, mediaMsg, { caption: message });
          } else {
            await client.sendMessage(number, message);
          }
          report.success++;
        } catch (err) {
          report.failed++;
          report.failedNumbers.push(rawNumber);
          console.error(`❌ Failed to send to ${rawNumber}:`, err.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // throttle
      }

      const campaign = new Campaign({
        totalContacts: report.total,
        successful: report.success,
        failed: report.failed,
        failedNumbers: report.failedNumbers,
        message,
        media: mediaData,
        companyName: companyName || 'Default Company'
      });

      await campaign.save();

      res.json({ message: 'Message sent to selected members', report });
    } catch (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({ error: 'Failed to send to members', details: err.message });
    }
  });

  return router;
};
