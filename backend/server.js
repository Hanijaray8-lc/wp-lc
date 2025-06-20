require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const { initializeWhatsAppClient, getClient, getAllSessions } = require('./whatsapp/client');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://railway.railway.internal',
    methods: ['GET', 'POST', 'OPTIONS'],
   
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

app.set('io', io);

app.use(cors({
  origin: 'https:/railway.railway.internal', // your frontend
  credentials: true,
}));

app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Socket Connection
io.on('connection', (socket) => {
  const sessionId = socket.handshake.query.sessionId;
  if (!sessionId) return socket.disconnect();

  socket.join(sessionId);
  initializeWhatsAppClient(io, sessionId);
});

// Routes
const whatsappRoutes = require('./routes/whatsappRoutes');
app.use('/api/whatsapp', whatsappRoutes({
  getClient,
  io
}));
app.use('/api', require('./routes/auth'));

const logoutRoutes = require('./routes/logoutRoutes');
app.use('/api/logout', logoutRoutes({
  getClient,
  io
}));

const contactsRoutes = require('./routes/contactsRoutes');
app.use('/api/contacts', contactsRoutes(getClient));

const groupRoutes = require('./routes/groupRoutes');
app.use('/api/groups', groupRoutes(getClient, getAllSessions));

const extractRoute = require('./routes/extractorRoutes'); 
app.use('/api/extract', extractRoute);

const autoResponderRoutes = require('./routes/autoResponderRoutes');
app.use('/api/autoresponder', autoResponderRoutes);


// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
