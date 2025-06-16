const express = require('express');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = function (getClient, getAllSessions) {
  const router = express.Router();

  // Get default session automatically
  const getDefaultSessionClient = async () => {
    const sessions = await getAllSessions();
    if (!sessions.length) throw new Error("No active sessions");
    const sessionId = sessions[0].id; // pick first session
    const client = getClient(sessionId);
    if (!client || !client.info) throw new Error("Client not authenticated");
    return client;
  };

  // ✅ FIXED: Get all group info with metadata
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
              number: p.id.user,
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


  // ✅ Send message/media to selected group members
  router.post('/send-to-members', async (req, res) => {
    try {
      const client = await getDefaultSessionClient();
      const { message } = req.body;
      const recipients = JSON.parse(req.body.recipients); // Array of numbers

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

        await new Promise(resolve => setTimeout(resolve, 1000)); // throttle
      }

      res.json({ message: 'Message sent to selected members', report });
    } catch (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({ error: 'Failed to send to members', details: err.message });
    }
  });

  return router;
};