const { validationResult } = require('express-validator');
const AuthService = require('../services/authService');
const ResponseHandler = require('../utils/response');
const { HTTP_STATUS } = require('../constants/statusCodes');

/**
 * Authentication controller
 */
class AuthController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async register(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validationError(res, errors.array());
      }

      const userData = req.body;
      const result = await AuthService.registerUser(userData);

      return ResponseHandler.success(
        res, 
        HTTP_STATUS.CREATED, 
        'User registered successfully', 
        result
      );
    } catch (error) {
      console.error('Registration error:', error);


      if (error.message.includes('already exists')) {
        return ResponseHandler.conflict(res, error.message);
      }

      return ResponseHandler.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Registration failed');
    }
  }

  /**
   * Authenticate user login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async login(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validationError(res, errors.array());
      }

      const { identifier, password } = req.body;
      const result = await AuthService.loginUser(identifier, password);

      return ResponseHandler.success(
        res, 
        HTTP_STATUS.OK, 
        'Login successful', 
        result
      );
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message === 'Invalid credentials') {
        return ResponseHandler.unauthorized(res, error.message);
      }

      if (error.message.includes('deactivated')) {
        return ResponseHandler.unauthorized(res, error.message);
      }

      return ResponseHandler.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Login failed');
    }
  }
}

module.exports = AuthController; 