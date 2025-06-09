// whatsapp/client.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

let client = null;
let isInitializing = false;

function getClient() {
  return client;
}

function initializeWhatsAppClient(io) {
  if (isInitializing || client) return;
  isInitializing = true;

  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bulk-sender' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process'],
    },
    takeoverOnConflict: true
  });

  client.on('qr', async (qr) => {
    const qrImage = await qrcode.toDataURL(qr);
    io.emit('qr', qrImage);
  });

  client.on('authenticated', () => io.emit('authenticated'));
  client.on('ready', () => io.emit('ready'));
  client.on('disconnected', reason => io.emit('disconnected', reason));
  client.on('auth_failure', msg => io.emit('auth_failure', msg));

  client.initialize()
    .then(() => {
      console.log('✅ WhatsApp client initialized');
      isInitializing = false;
    })
    .catch(err => {
      console.error('❌ WhatsApp init error:', err);
      isInitializing = false;
    });
}

module.exports = {
  initializeWhatsAppClient,
  getClient
};
