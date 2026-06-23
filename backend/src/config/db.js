const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connect to MongoDB. Exits the process on failure so the server never
 * runs in a half-broken state.
 */
async function connectDB() {
  const uri = config.mongoUri;
  if (!uri) {
    console.error('MONGO_URI is not defined');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
