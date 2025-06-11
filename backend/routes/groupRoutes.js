const express = require('express');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = function (getClient) {
  const router = express.Router();

  // ✅ Get group list & members
  router.get('/my-groups', async (req, res) => {
    try {
      const client = getClient();
      if (!client || !client.info) {
        return res.status(400).json({ error: 'WhatsApp client not authenticated' });
      }

      const chats = await client.getChats();
      const groups = chats.filter(chat => chat.isGroup);

      const groupData = await Promise.all(groups.map(async (group) => {
        const participants = await Promise.all(
          group.participants.map(async p => {
            const contact = await client.getContactById(p.id._serialized);
            return {
              id: p.id._serialized,
              number: p.id.user,
              name: contact.pushname || contact.name || p.id.user,
              isAdmin: p.isAdmin
            };
          })
        );

        return {
          groupName: group.name,
          groupId: group.id._serialized,
          members: participants
        };
      }));

      res.json({ groups: groupData });
    } catch (err) {
      console.error('❌ Error fetching groups:', err.message);
      res.status(500).json({ error: 'Failed to fetch group list' });
    }
  });

  // ✅ Send to selected group members
  router.post('/send-to-members', async (req, res) => {
    const client = getClient();
    if (!client || !client.info) {
      return res.status(400).json({ error: 'WhatsApp client not authenticated' });
    }

    try {
      const { message } = req.body;
      const recipients = JSON.parse(req.body.recipients); // Expecting array of numbers like ['919876543210']

      if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: 'No recipients provided' });
      }

      const report = { total: recipients.length, success: 0, failed: 0, failedNumbers: [] };

      let mediaMsg = null;
      if (req.files?.file) {
        const media = req.files.file;
        mediaMsg = new MessageMedia(media.mimetype, media.data.toString('base64'), media.name);
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
        await new Promise(resolve => setTimeout(resolve, 1000)); // Respect rate limit
      }

      res.json({ message: 'Message sent to selected members', report });
    } catch (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({ error: 'Failed to send to members', details: err.message });
    }
  });

  return router;
};