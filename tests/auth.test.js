const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('Authentication Endpoints', () => {
    let testUser;

    beforeEach(async () => {
        testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'TestPass123',
            firstName: 'Test',
            lastName: 'User'
        });
        await testUser.save();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'NewPass123',
                firstName: 'New',
                lastName: 'User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.username).toBe(userData.username);
            expect(response.body.data.token).toBeDefined();
        });

        it('should return 400 for invalid email', async () => {
            const userData = {
                username: 'testuser',
                email: 'invalid-email',
                password: 'TestPass123',
                firstName: 'Test',
                lastName: 'User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for weak password', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'weak',
                firstName: 'Test',
                lastName: 'User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login user with valid credentials', async () => {
            const loginData = {
                identifier: 'test@example.com',
                password: 'TestPass123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
        });

        it('should return 401 for invalid password', async () => {
            const loginData = {
                identifier: 'test@example.com',
                password: 'WrongPassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing identifier', async () => {
            const loginData = {
                password: 'TestPass123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
