const mongoose = require('mongoose');

/**
 * Database configuration and connection
 */
class DatabaseConfig {
  /**
   * Connect to MongoDB
   * @param {string} uri - MongoDB connection URI
   * @returns {Promise} Connection promise
   */
  static async connect(uri) {
    try {
      const connection = await mongoose.connect(uri);

      console.log('Connected to MongoDB successfully');
      return connection;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise} Disconnection promise
   */
  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   * @returns {string} Connection state
   */
  static getConnectionState() {
    return mongoose.connection.readyState;
  }

  /**
   * Check if connected
   * @returns {boolean} Connection status
   */
  static isConnected() {
    return this.getConnectionState() === 1;
  }
}

module.exports = DatabaseConfig; 