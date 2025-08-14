const redis = require('redis');
const crypto = require('crypto');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis successfully');
});

const cacheItinerary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `itinerary:${id}`;
    
    // Try to get data from cache
    const cachedData = await redisClient.get(cacheKey);
    console.log(`Cached ${cacheKey}`);
    if (cachedData) {
      console.log(`Cache hit for itinerary: ${id}`);
      const parsedData = JSON.parse(cachedData);
      return res.json(parsedData);
    }
    
    console.log(`Cache miss for itinerary: ${id}`);
    next();
  } catch (error) {
    console.error('Cache middleware error:', error);
    next();
  }
};

const setCache = async (key, data, ttl = 300) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    console.log(`Cached data for key: ${key} with TTL: ${ttl}s`);
  } catch (error) {
    console.error('Set cache error:', error);
  }
};

const invalidateCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated ${keys.length} cache keys: ${pattern}`);
    }
  } catch (error) {
    console.error('Invalidate cache error:', error);
  }
};


const generateShareableId = () => {
  return crypto.randomBytes(8).toString('hex');
};

const createShareableLink = async (itineraryId, shareableData, ttl = 86400) => {
  try {

    console.log('Redis not ready, skipping shareable link creation ', redisClient.isOpen);

    if (!redisClient.isOpen) {
      console.log('Redis not ready, skipping shareable link creation ');
      return null;
    }

    const shareableId = generateShareableId();
    const shareableKey = `shareable:${shareableId}`;

    await redisClient.setEx(shareableKey, ttl, JSON.stringify({
      itineraryId,
      data: shareableData,
      createdAt: new Date().toISOString()
    }));

    console.log(`🔗 Created shareable link: ${shareableId} for itinerary: ${itineraryId}`);
    return shareableId;
  } catch (error) {
    console.error('Create shareable link error:', error);
    return null;
  }
};

const getShareableData = async (shareableId) => {
  try {
    // Check if Redis is ready
    if (!redisClient.isOpen) {
      console.log('Redis not ready, skipping shareable data retrieval');
      return null;
    }

    const shareableKey = `shareable:${shareableId}`;
    console.log("shareableKey:: ",shareableKey)
    const shareableData = await redisClient.get(shareableKey);

    if (shareableData) {
      console.log(`📦 Retrieved shareable data for: ${shareableId}`);
      return JSON.parse(shareableData);
    }

    console.log(`Shareable data not found for: ${shareableId}`);
    return null;
  } catch (error) {
    console.error('Get shareable data error:', error);
    return null;
  }
};

module.exports = {
  cacheItinerary,
  setCache,
  invalidateCache,
  createShareableLink,
  getShareableData,
  generateShareableId,
  redisClient
};
