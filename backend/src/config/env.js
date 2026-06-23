// Centralized application configuration.
//
// Each value is read from an environment variable when present, otherwise it
// falls back to the baked-in default below — so the project runs out of the box
// for anyone who clones it, while still allowing overrides via a local `.env`.
//
// NOTE: the DB/JWT defaults include real credentials so the demo works without
// setup. Keep this repository private, or rotate the MongoDB password / JWT
// secret if it is ever made public. The Gemini key is intentionally NOT baked in
// (it is personal and billable) — it must be provided via GEMINI_API_KEY in .env.
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',

  mongoUri:
    process.env.MONGO_URI ||
    'mongodb://imyounessaylal_db_user:DoIIu1xCMKycUPqw@ac-tiphqxy-shard-00-00.zqndisq.mongodb.net:27017,ac-tiphqxy-shard-00-01.zqndisq.mongodb.net:27017,ac-tiphqxy-shard-00-02.zqndisq.mongodb.net:27017/bovitrack?ssl=true&replicaSet=atlas-14nqxv-shard-0&authSource=admin&appName=Cluster0',

  jwt: {
    secret:
      process.env.JWT_SECRET ||
      'c394341ac680ed3aa39228d64e3152557c2c66bb8f50605c4da938417c44d0e9a1013fc6578a7455612f277c15770df2',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Kept out of source on purpose — set GEMINI_API_KEY in backend/.env.
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
