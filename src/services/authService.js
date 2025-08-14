const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication service for user management
 */
class AuthService {
  /**
   * Generate JWT token for user
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Created user and token
   */
  static async registerUser(userData) {
    const { username, email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmailOrUsername(email);
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // Generate token
    const token = this.generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Authenticate user login
   * @param {string} identifier - Email or username
   * @param {string} password - User password
   * @returns {Object} User data and token
   */
  static async loginUser(identifier, password) {
    // Find user by email or username
    const user = await User.findByEmailOrUsername(identifier).select('+password');
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact support.');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        lastLogin: user.lastLogin
      },
      token
    };
  }
}

module.exports = AuthService; 