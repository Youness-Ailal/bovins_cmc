const ApiError = require('../utils/ApiError');

/**
 * Minimal in-memory sliding-window rate limiter, keyed by authenticated user
 * (falls back to IP). No external dependency. Good enough for a single-process
 * deployment; swap for a Redis-backed limiter if the API is ever scaled out.
 */
function rateLimit({ windowMs = 60000, max = 20 } = {}) {
  const hits = new Map(); // key -> number[] (timestamps)

  return (req, res, next) => {
    const key = req.user ? String(req.user._id) : req.ip;
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      const retryMs = windowMs - (now - recent[0]);
      res.setHeader('Retry-After', Math.ceil(retryMs / 1000));
      return next(new ApiError(429, 'Trop de requêtes. Réessayez dans un instant.'));
    }

    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

module.exports = rateLimit;
