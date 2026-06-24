// Socket.IO server singleton — real-time push for alerts.
//
// Initialized once from bin/www with the shared HTTP server. Any module can
// then require getIO()/emitAlerte() to push events without holding a reference.
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: config.clientOrigin || true, credentials: true },
  });

  // Authenticate every socket with the same JWT used for the REST API.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Token manquant'));
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || user.statut === 'Inactif') return next(new Error('Non autorisé'));
      socket.user = { id: user.id, role: user.role };
      next();
    } catch (err) {
      next(new Error('Session invalide ou expirée'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`); // personal room
    socket.join('all'); // farm-wide room
  });

  return io;
}

function getIO() {
  return io;
}

/** Push a newly-created alert to every connected user (farm-wide). */
function emitAlerte(alerte) {
  if (io) io.to('all').emit('alerte:new', alerte);
}

/** Push an event to a single user's room. */
function emitToUser(userId, event, payload) {
  if (io) io.to(`user:${userId}`).emit(event, payload);
}

module.exports = { initSocket, getIO, emitAlerte, emitToUser };
