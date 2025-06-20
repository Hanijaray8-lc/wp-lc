const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const ResponseRule = require('../models/ResponseRule'); // Add this at the top

const clients = new Map();

function getClient(sessionId) {
  return clients.get(sessionId);
}

function getAllSessions() {
  const sessions = [];
  for (const [id, client] of clients.entries()) {
    sessions.push({ id, client });
  }
  return sessions;
}

// whatsappClient.js
function getDefaultSessionId() {
  const sessions = Object.keys(sessionStore); // your in-memory or DB session store
  return sessions.length > 0 ? sessions[0] : null;
}

async function logoutClient(sessionId) {
  const client = clients.get(sessionId);
  if (!client) return;

  try {
    await client.logout();
    await client.destroy();
    console.log(`👋 Logged out: ${sessionId}`);
  } catch (err) {
    console.warn(`⚠️ Error on logout/destroy: ${err.message}`);
  }

  clients.delete(sessionId);

  const sessionPath = path.join(__dirname, '..', '.wwebjs_auth', `session-${sessionId}`);
  setTimeout(() => {
    try {
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`🗑️ Deleted session data for: ${sessionId}`);
      }
    } catch (err) {
      console.warn(`⚠️ Could not delete session folder for ${sessionId}: ${err.message}`);
    }
  }, 2000); // Give Chromium time to release locked files
}

function initializeWhatsAppClient(io, sessionId) {
  if (clients.has(sessionId)) return;

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: sessionId }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    }
  });

  client.on('qr', async (qr) => {
    const qrImage = await qrcode.toDataURL(qr);
    io.to(sessionId).emit('qr', qrImage);
  });

  client.on('authenticated', () => {
    io.to(sessionId).emit('authenticated');
  });

  client.on('ready', () => {
    io.to(sessionId).emit('ready');
    console.log(`✅ WhatsApp client ready for: ${sessionId}`);
  });

  // --- Add this block for auto-responder ---
  client.on('message', async (msg) => {
    try {
      const rules = await ResponseRule.find({ sessionId }); // <-- Only fetch rules for this session
      for (const rule of rules) {
        if (msg.body.toLowerCase().includes(rule.keyword.toLowerCase())) {
          await msg.reply(rule.response);
          break;
        }
      }
    } catch (err) {
      console.error('Auto-responder error:', err.message);
    }
  });
  // --- End auto-responder block ---

  client.on('disconnected', async (reason) => {
    console.log(`❌ Disconnected [${sessionId}]: ${reason}`);
    io.to(sessionId).emit('disconnected', reason);
    clients.delete(sessionId);

    const sessionPath = path.join(__dirname, '..', '.wwebjs_auth', `session-${sessionId}`);
    setTimeout(() => {
      try {
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
          console.log(`🗑️ Deleted session folder for: ${sessionId}`);
        }
      } catch (err) {
        console.warn(`⚠️ Could not delete session folder for ${sessionId}: ${err.message}`);
      }
    }, 2000);

    setTimeout(() => {
      initializeWhatsAppClient(io, sessionId);
    }, 3000); // auto-reinit after disconnect
  });

  client.initialize()
    .then(() => {
      clients.set(sessionId, client);
      console.log(`✅ Initialized WhatsApp client: ${sessionId}`);
    })
    .catch(err => {
      console.error(`❌ Init failed [${sessionId}]:`, err);
    });
}

module.exports = {
  initializeWhatsAppClient,
  getClient,
  logoutClient,
  getAllSessions,
  getDefaultSessionId
};