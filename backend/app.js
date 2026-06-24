const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const config = require('./src/config/env');

const connectDB = require('./src/config/db');
const apiRouter = require('./src/routes/index');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');
const { initSocket } = require('./src/socket');

const app = express();

// Middleware
app.use(logger('dev'));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin non autorisée par CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Reuse one MongoDB connection across warm serverless invocations.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// API routes
app.use('/api', apiRouter);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server, app);

module.exports = server;
module.exports.app = app;
