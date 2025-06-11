// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const { initializeWhatsAppClient, getClient } = require('./whatsapp/client');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://wp-lc.netlify.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'https://wp-lc.netlify.app' }));
app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// WhatsApp Client Init
initializeWhatsAppClient(io);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'running',
    whatsapp: getClient()?.info ? 'connected' : 'disconnected'
  });
});

// Routes
const whatsappRoutes = require('./routes/whatsapp');
app.use('/api/whatsapp', whatsappRoutes({
  client: getClient(),
  initClient: () => {} // placeholder if needed later
}));
app.use('/api', require('./routes/auth'));

const groupRoutes = require('./routes/groupRoutes');
app.use('/api/groups', groupRoutes(() => getClient())); // pass as a function


// Start Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('🔌 Shutting down...');
  const client = getClient();
  if (client) await client.destroy();
  mongoose.connection.close();
  process.exit();
});
