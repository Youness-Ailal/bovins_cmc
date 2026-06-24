const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const config = require('./config/env');
const connectDB = require('./config/db');

let io = null;

function initSocket(httpServer, app) {
  io = new Server(httpServer, {
    cors: {
      origin: config.clientOrigins,
      credentials: true,
    },
    transports: ['websocket'],
  });

  io.use(async (socket, next) => {
    try {
      await connectDB();
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Token manquant'));
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Utilisateur introuvable'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);
    socket.join('all');
  });

  app.set('io', io);
  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
