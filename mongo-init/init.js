// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('tmtc_assignment');

// Create a user for the application
db.createUser({
  user: 'tmtc_user',
  pwd: 'tmtc_password',
  roles: [
    {
      role: 'readWrite',
      db: 'tmtc_assignment'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password', 'firstName', 'lastName'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 6
        },
        firstName: {
          bsonType: 'string',
          maxLength: 50
        },
        lastName: {
          bsonType: 'string',
          maxLength: 50
        }
      }
    }
  }
});

db.createCollection('itineraries', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'title', 'destination', 'startDate', 'endDate'],
      properties: {
        userId: {
          bsonType: 'objectId'
        },
        title: {
          bsonType: 'string',
          maxLength: 100
        },
        destination: {
          bsonType: 'string'
        },
        startDate: { bsonType: 'date' },
        endDate: { bsonType: 'date' },
        activities: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['time', 'description', 'location'],
            properties: {
              time: { bsonType: 'string' },
              description: { bsonType: 'string' },
              location: { bsonType: 'string' }
            }
          }
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'username': 1 }, { unique: true });
db.users.createIndex({ 'createdAt': -1 });

db.itineraries.createIndex({ 'userId': 1 });
db.itineraries.createIndex({ 'destination': 1 });
db.itineraries.createIndex({ 'startDate': 1, 'endDate': 1 });
db.itineraries.createIndex({ 'createdAt': -1 });

print('MongoDB initialization completed successfully!');
print('Database: tmtc_assignment');
print('Application user: tmtc_user');
print('Collections: users, itineraries');
print('Indexes created for optimal performance');