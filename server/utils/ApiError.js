/**
 * ApiError — Custom App Error Class
 * 
 * WHAT: A specialized class that extends the standard JavaScript `Error` object
 *       to include HTTP-specific metadata (statusCode, detailed error arrays).
 * WHY: Standard JavaScript errors only carry a text message. In REST APIs,
 *      we need to convey HTTP status codes (like 400 Bad Request, 404 Not Found)
 *      alongside the error message. Having a custom class allows us to cleanly 
 *      throw errors in controllers and catch them centrally in our global middleware.
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    // Captures the call stack trace so we can see exactly where the error originated
    // in our server logs (useful for backend debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
