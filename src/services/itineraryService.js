const Itinerary = require('../models/Itinerary');
const { createShareableLink, getShareableData } = require('../middleware/cache');

/**
 * Itinerary service for business logic
 */
class ItineraryService {
  /**
   * Create a new itinerary
   * @param {Object} itineraryData - Itinerary data
   * @param {string} userId - User ID
   * @returns {Object} Created itinerary
   */
  static async createItinerary(itineraryData, userId) {
    const { title, destination, startDate, endDate, activities } = itineraryData;

    const itinerary = new Itinerary({
      userId,
      title,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      activities: activities || []
    });

    await itinerary.save();

    // Populate user info
    await itinerary.populate('userId', 'username firstName lastName');

    return itinerary;
  }

  /**
   * Get itineraries with filtering, sorting, and pagination
   * @param {Object} filters - Query filters
   * @param {string} sort - Sort field
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Object} Itineraries and pagination info
   */
  static async getItineraries(filters = {}, sort = 'createdAt', page = 1, limit = 10) {
    const itineraries = await Itinerary.getItineraries(filters, sort, page, limit);
    const total = await Itinerary.countDocuments(filters);

    return {
      itineraries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get itinerary by ID
   * @param {string} id - Itinerary ID
   * @param {string} userId - User ID for ownership check
   * @returns {Object} Itinerary data
   */
  static async getItineraryById(id, userId) {
    const itinerary = await Itinerary.findById(id);
    
    if (!itinerary) {
      throw new Error('Itinerary not found');
    }

    // Check if user owns the itinerary
    if (itinerary.userId.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    // Populate user info
    await itinerary.populate('userId', 'username firstName lastName');

    return itinerary;
  }

  /**
   * Update itinerary
   * @param {string} id - Itinerary ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID for ownership check
   * @returns {Object} Updated itinerary
   */
  static async updateItinerary(id, updateData, userId) {
    const itinerary = await Itinerary.findById(id);
    
    if (!itinerary) {
      throw new Error('Itinerary not found');
    }

    // Check if user owns the itinerary
    if (itinerary.userId.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    // Update itinerary
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'username firstName lastName');

    return updatedItinerary;
  }

  /**
   * Delete itinerary
   * @param {string} id - Itinerary ID
   * @param {string} userId - User ID for ownership check
   */
  static async deleteItinerary(id, userId) {
    const itinerary = await Itinerary.findById(id);
    
    if (!itinerary) {
      throw new Error('Itinerary not found');
    }

    // Check if user owns the itinerary
    if (itinerary.userId.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    await Itinerary.findByIdAndDelete(id);
  }

  /**
   * Create shareable link for itinerary
   * @param {string} id - Itinerary ID
   * @param {string} userId - User ID for ownership check
   * @param {string} baseUrl - Base URL for shareable link
   * @returns {Object} Shareable link info
   */
  static async createShareableLink(id, userId, baseUrl) {
    const itinerary = await Itinerary.findById(id);
    
    if (!itinerary) {
      throw new Error('Itinerary not found');
    }

    // Check if user owns the itinerary
    if (itinerary.userId.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    // Exclude sensitive information
    const { __v, _id, userId: ownerId, ...publicData } = itinerary.toObject();

    // Create shareable link in Redis
    const shareableId = await createShareableLink(id, publicData);

    if (!shareableId) {
      throw new Error('Failed to create shareable link');
    }

    const shareableUrl = `${baseUrl}/api/itineraries/share/${shareableId}`;

    return {
      shareableId,
      shareableUrl,
      expiresIn: '24 hours'
    };
  }

  /**
   * Get public shareable itinerary
   * @param {string} shareableId - Shareable ID
   * @returns {Object} Shareable itinerary data
   */
  static async getShareableItinerary(shareableId) {
    const shareableData = await getShareableData(shareableId);

    if (!shareableData) {
      throw new Error('Shareable link not found or expired');
    }

    return {
      itinerary: shareableData.data,
      sharedAt: shareableData.createdAt
    };
  }
}

module.exports = ItineraryService; 