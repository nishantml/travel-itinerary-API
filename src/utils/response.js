const { HTTP_STATUS, ERROR_CODES } = require('../constants/statusCodes');

/**
 * Response utility for consistent API responses
 */

class ResponseHandler {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Success message
   * @param {*} data - Response data
   * @param {Object} meta - Additional metadata (pagination, etc.)
   */
  static success(res, statusCode = HTTP_STATUS.OK, message = 'Success', data = null, meta = null) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    if (meta !== null) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {*} errors - Validation errors or additional error details
   * @param {string} code - Error code for client handling
   */
  static error(res, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = 'Internal server error', errors = null, code = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors !== null) {
      response.errors = errors;
    }

    if (code !== null) {
      response.code = code;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {Array} errors - Validation errors array
   * @param {string} message - Custom error message
   */
  static validationError(res, errors, message = 'Validation failed') {
    return this.error(res, HTTP_STATUS.BAD_REQUEST, message, errors, ERROR_CODES.VALIDATION_ERROR);
  }

  /**
   * Send not found error response
   * @param {Object} res - Express response object
   * @param {string} message - Custom error message
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, HTTP_STATUS.NOT_FOUND, message, null, ERROR_CODES.NOT_FOUND);
  }

  /**
   * Send unauthorized error response
   * @param {Object} res - Express response object
   * @param {string} message - Custom error message
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, HTTP_STATUS.UNAUTHORIZED, message, null, ERROR_CODES.UNAUTHORIZED);
  }

  /**
   * Send forbidden error response
   * @param {Object} res - Express response object
   * @param {string} message - Custom error message
   */
  static forbidden(res, message = 'Access denied') {
    return this.error(res, HTTP_STATUS.FORBIDDEN, message, null, ERROR_CODES.FORBIDDEN);
  }

  /**
   * Send conflict error response
   * @param {Object} res - Express response object
   * @param {string} message - Custom error message
   */
  static conflict(res, message = 'Resource conflict') {
    return this.error(res, HTTP_STATUS.CONFLICT, message, null, ERROR_CODES.CONFLICT);
  }

  /**
   * Send too many requests error response
   * @param {Object} res - Express response object
   * @param {string} message - Custom error message
   */
  static tooManyRequests(res, message = 'Too many requests') {
    return this.error(res, HTTP_STATUS.TOO_MANY_REQUESTS, message, null, ERROR_CODES.RATE_LIMIT_EXCEEDED);
  }
}

module.exports = ResponseHandler; 