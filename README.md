
## Submission Guidelines

* Push code to a **public GitHub repository**.
* Include a **README** with:

  * Setup & installation steps
  * How to run the project
  * API documentation link or instructions
* **Deployment (optional):** Extra points for working demo on Render/Heroku/Vercel.

---



## Rate Limit
- RATE_LIMIT_MAX_REQUESTS -> set this value to check rate limit in give time window
  - Right now in env api 100 request is set every -> 15 minutes

## Docker composer -> application setup and run
- To run whole api setup run this command -> `docker compose up -d `
  - Make sure docker is installed in your system
- To closed and end running apis -> run this command -> `docker composer down`


## Unit Tests -> Test Structure

- `setup.js` - Test environment setup with MongoDB memory server and essential environment variables
- `auth.test.js` - Minimal authentication endpoint tests
- `itinerary.test.js` - Minimal itinerary CRUD operation tests

## Running Tests

### Run all tests (minimal unit tests)
```bash
npm test
```

### Run specific test file
```bash
npm test -- auth.test.js
npm test -- itinerary.test.js
```

## Environment Variables

Tests automatically set only essential environment variables:
- `NODE_ENV=test`
- `JWT_SECRET=test-secret-key-for-jwt-tokens`
