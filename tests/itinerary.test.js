const request = require('supertest');
const app = require('../server');
const Itinerary = require('../src/models/Itinerary');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('Itinerary CRUD Operations', () => {
    let testUser;
    let authToken;
    let testItinerary;

    beforeEach(async () => {
        // Create test user
        testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'TestPass123',
            firstName: 'Test',
            lastName: 'User'
        });
        await testUser.save();

        // Generate simple JWT token
        authToken = jwt.sign(
            { userId: testUser._id },
            process.env.JWT_SECRET || 'test-secret-key',
            { expiresIn: '1h' }
        );
    });

    describe('POST /api/itineraries', () => {
        it('should create a new itinerary successfully', async () => {
            const itineraryData = {
                title: 'Test Trip',
                destination: 'Paris',
                startDate: '2024-06-01',
                endDate: '2024-06-05',
                activities: [
                    {
                        time: '09:00',
                        description: 'Morning breakfast',
                        location: 'hotel'
                    }
                ]
            };

            const response = await request(app)
                .post('/api/itineraries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(itineraryData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.itinerary.title).toBe(itineraryData.title);
        });

        it('should return 401 without authentication token', async () => {
            const itineraryData = {
                title: 'Test Trip',
                destination: 'Paris',
                startDate: '2024-06-01',
                endDate: '2024-06-05'
            };

            const response = await request(app)
                .post('/api/itineraries')
                .send(itineraryData)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing title', async () => {
            const itineraryData = {
                destination: 'Paris',
                startDate: '2024-06-01',
                endDate: '2024-06-05'
            };

            const response = await request(app)
                .post('/api/itineraries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(itineraryData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/itineraries', () => {
        beforeEach(async () => {
            // Create test itineraries
            await Itinerary.create([
                {
                    title: 'Trip 1',
                    destination: 'Paris',
                    startDate: '2024-06-01',
                    endDate: '2024-06-05',
                    userId: testUser._id
                },
                {
                    title: 'Trip 2',
                    destination: 'London',
                    startDate: '2024-07-01',
                    endDate: '2024-07-05',
                    userId: testUser._id
                }
            ]);
        });

        it('should get all itineraries for authenticated user', async () => {
            const response = await request(app)
                .get('/api/itineraries')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
        });

        it('should return 401 without authentication token', async () => {
            const response = await request(app)
                .get('/api/itineraries')
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should filter itineraries by destination', async () => {
            const response = await request(app)
                .get('/api/itineraries?destination=Paris')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
        });
    });

    describe('GET /api/itineraries/:id', () => {
        beforeEach(async () => {
            testItinerary = await Itinerary.create({
                title: 'Test Trip',
                destination: 'Paris',
                startDate: '2024-06-01',
                endDate: '2024-06-05',
                userId: testUser._id
            });
        });

        it('should get itinerary by ID for authenticated owner', async () => {
            const response = await request(app)
                .get(`/api/itineraries/${testItinerary._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.itinerary.title).toBe(testItinerary.title);
        });

        it('should return 401 without authentication token', async () => {
            const response = await request(app)
                .get(`/api/itineraries/${testItinerary._id}`)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should return 404 for non-existent itinerary', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/itineraries/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/itineraries/:id', () => {
        beforeEach(async () => {
            testItinerary = await Itinerary.create({
                title: 'Test Trip',
                destination: 'Paris',
                startDate: '2024-06-01',
                endDate: '2024-06-05',
                userId: testUser._id
            });
        });

        it('should update itinerary successfully', async () => {
            const updateData = {
                title: 'Updated Trip Title',
                destination: 'Updated Destination'
            };

            const response = await request(app)
                .put(`/api/itineraries/${testItinerary._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.itinerary.title).toBe(updateData.title);
        });

        it('should return 401 without authentication token', async () => {
            const updateData = { title: 'Updated Title' };

            const response = await request(app)
                .put(`/api/itineraries/${testItinerary._id}`)
                .send(updateData)
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/itineraries/:id', () => {
        beforeEach(async () => {
            testItinerary = await Itinerary.create({
                title: 'Test Trip',
                destination: 'Paris',
                startDate: '2024-06-01',
                endDate: '2024-06-05',
                userId: testUser._id
            });
        });

        it('should delete itinerary successfully', async () => {
            const response = await request(app)
                .delete(`/api/itineraries/${testItinerary._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            const deletedItinerary = await Itinerary.findById(testItinerary._id);
            expect(deletedItinerary).toBeNull();
        });

        it('should return 401 without authentication token', async () => {
            const response = await request(app)
                .delete(`/api/itineraries/${testItinerary._id}`)
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });
});
