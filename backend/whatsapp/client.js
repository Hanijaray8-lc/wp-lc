const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const chromium = require('chromium'); // 🆕 install this via `npm i chromium`

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
  }, 2000);
}

function initializeWhatsAppClient(io, sessionId) {
  if (clients.has(sessionId)) return;

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: sessionId }),
    puppeteer: {
      headless: true,
      executablePath: chromium.path, // ✅ Force using Chromium compatible with serverless
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
      ],
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
    }, 3000);
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
  getAllSessions
};
