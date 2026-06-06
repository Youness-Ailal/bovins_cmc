const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

const connectDB = require('./src/config/db');
const apiRouter = require('./src/routes/index');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(logger('dev'));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api', apiRouter);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
