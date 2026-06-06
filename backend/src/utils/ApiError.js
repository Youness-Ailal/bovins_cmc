/**
 * Operational error with an HTTP status code. Thrown by controllers and
 * caught by the global error handler to produce a consistent envelope.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg) { return new ApiError(400, msg); }
  static unauthorized(msg = 'Non authentifié') { return new ApiError(401, msg); }
  static forbidden(msg = 'Accès refusé') { return new ApiError(403, msg); }
  static notFound(msg = 'Ressource introuvable') { return new ApiError(404, msg); }
  static conflict(msg) { return new ApiError(409, msg); }
}

module.exports = ApiError;
