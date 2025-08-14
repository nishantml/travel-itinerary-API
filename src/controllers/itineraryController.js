const { validationResult } = require('express-validator');
const ItineraryService = require('../services/itineraryService');
const ResponseHandler = require('../utils/response');
const { setCache, invalidateCache } = require('../middleware/cache');
const { HTTP_STATUS, CACHE_TTL } = require('../constants/statusCodes');

/**
 * Itinerary controller
 */
class ItineraryController {
  /**
   * Get public shareable itinerary (no authentication required)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getShareableItinerary(req, res) {
    try {
      const { shareableId } = req.params;
      const result = await ItineraryService.getShareableItinerary(shareableId);

      return ResponseHandler.success(
        res, 
        HTTP_STATUS.OK, 
        'Shareable itinerary retrieved successfully', 
        result
      );
    } catch (error) {
      console.error('Get shareable itinerary error:', error);
      
      if (error.message.includes('not found') || error.message.includes('expired')) {
        return ResponseHandler.notFound(res, error.message);
      }

      return ResponseHandler.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to get shareable itinerary');
    }
  }

  /**
   * Create a new itinerary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createItinerary(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validationError(res, errors.array());
      }

      const itineraryData = req.body;
      const userId = req.user._id;
      
      const itinerary = await ItineraryService.createItinerary(itineraryData, userId);

      return ResponseHandler.success(
        res, 
        HTTP_STATUS.CREATED, 
        'Itinerary created successfully', 
        { itinerary }
      );
    } catch (error) {
      console.error('Create itinerary error:', error);

      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        return ResponseHandler.validationError(res, validationErrors);
      }

      return ResponseHandler.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create itinerary');
    }
  }

  /**
   * Get all itineraries with filtering, sorting, and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getItineraries(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validationError(res, errors.array());
      }

      const { page = 1, limit = 10, sort = 'createdAt', destination } = req.query;
      const userId = req.user._id;

      let filters = { userId };

      // Apply destination filter if provided
      if (destination) {
        filters.destination = { $regex: destination, $options: 'i' };
      }

      const result = await ItineraryService.getItineraries(filters, sort, page, limit);
      // console.log("getItineraries result:: ",result)
      return ResponseHandler.success(
        res, 
        HTTP_STATUS.OK, 
        'Itineraries retrieved successfully', 
        result.itineraries,
        result.pagination
      );
    } catch (error) {
      console.error('Get itineraries error:', error);
      return ResponseHandler.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to get itineraries');
    }
  }

  /**
   * Get itinerary by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getItineraryById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const itinerary = await ItineraryService.getItineraryById(id, userId);

      const responseData = {
        itinerary
      };

      // Cache the response data with 5 minutes TTL
      const cacheKey = `itinerary:${id}`;
      await setCache(cacheKey, responseData, CACHE_TTL.ITINERARY);

      return ResponseHandler.success(
        res, 
        HTTP_STATUS.OK, 
        'Itinerary retrieved successfully', 
        responseData
      );
    } catch (error) {
      console.error('Get itinerary error:', error);
      
      if (error.message === 'Itinerary not found') {
        return ResponseHandler.notFound(res, error.message);
      }

      if (error.message === 'Access denied') {
        return ResponseHandler.forbidden(res, error.message);
      }

      return ResponseHandler.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to get itinerary');
    }
  }

  /**
   * Update itinerary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateItinerary(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseHandler.validationError(res, errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user._id;

      const updatedItinerary = await ItineraryService.updateItinerary(id, updateData, userId);

      // Invalidate cache for this itinerary
      await invalidateCache(`itinerary:${id}`);

      return ResponseHandler.success(
        res, 
        HTTP_STATUS.OK, 
        'Itinerary updated successfully', 
        { itinerary: updatedItinerary }
      );
    } catch (error) {
      console.error('Update itinerary error:', error);

      if (error.message === 'Itinerary not found') {
        return ResponseHandler.notFound(res, error.message);
      }

      if (error.message === 'Access denied') {
        return ResponseHandler.forbidden(res, error.message);
      }

      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        return ResponseHandler.validationError(res, validationErrors);
      }

      return ResponseHandler.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update itinerary');
    }
  }

  /**
   * Delete itinerary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteItinerary(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      await ItineraryService.deleteItinerary(id, userId);

      // Invalidate cache for this itinerary
      await invalidateCache(`itinerary:${id}`);

      return ResponseHandler.success(
        res, 
        HTTP_STATUS.OK, 
        'Itinerary deleted successfully'
      );
    } catch (error) {
      console.error('Delete itinerary error:', error);
      
      if (error.message === 'Itinerary not found') {
        return ResponseHandler.notFound(res, error.message);
      }

      if (error.message === 'Access denied') {
        return ResponseHandler.forbidden(res, error.message);
      }

      return ResponseHandler.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete itinerary');
    }
  }

  /**
   * Create a shareable link for an itinerary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createShareableLink(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const result = await ItineraryService.createShareableLink(id, userId, baseUrl);

      return ResponseHandler.success(
        res, 
        HTTP_STATUS.OK, 
        'Shareable link created successfully', 
        result
      );
    } catch (error) {
      console.error('Create shareable link error:', error);
      
      if (error.message === 'Itinerary not found') {
        return ResponseHandler.notFound(res, error.message);
      }

      if (error.message === 'Access denied') {
        return ResponseHandler.forbidden(res, error.message);
      }

      if (error.message.includes('Failed to create')) {
        return ResponseHandler.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
      }

      return ResponseHandler.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create shareable link');
    }
  }
}

module.exports = ItineraryController; 