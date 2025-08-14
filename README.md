
## 📋 Prerequisites

- **Node.js** (v18.0.0 or higher) - for direct setup
- **MongoDB** (v5.0 or higher) - for direct setup
- **Redis** (v6.0 or higher) - for direct setup
- **Docker** (v20.0 or higher) - for containerized setup
- **Docker Compose** (v2.0 or higher) - for containerized setup

## 🛠️ Setup & Installation

### Option 1: Direct Setup (Recommended for Development)

#### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd imtc
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Configuration
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tmtc_assignment

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```


#### 4. Run the Application
```bash
# Development mode with auto-reload
npm run dev
```

### Option 2: Docker Compose Setup

**No environment file needed!** All configuration is built into the Docker Compose file.

#### 1. Prerequisites
- Docker installed and running
- Docker Compose installed

#### 2. Start All Services
```bash
# Start all services in background
docker compose up -d

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

#### 3. Access Your Application
- **API Server**: http://localhost:3000

#### 4. Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes (data will be lost)
docker compose down -v
```


## Rate Limit
- RATE_LIMIT_MAX_REQUESTS -> set this value to check rate limit in give time window 
  - Right now in env api 100 request is set every -> 15 minutes

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


## 📁 POSTMAN SETUP -> Files Included

1. **`TMTC_API_Collection.postman_collection.json`** - Main Postman collection
2. **`TMTC_API_Environment.postman_environment.json`** - Environment variables

## 🚀 Quick Setup

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Drag and drop `TMTC_API_Collection.postman_collection.json` or click to browse and select the file
4. Click **Import**

### Step 2: Import Environment
1. In Postman, click **Import** again
2. Select `TMTC_API_Environment.postman_environment.json`
3. Click **Import**

### Step 3: Select Environment
1. In the top-right corner of Postman, click the environment dropdown
2. Select **"TMTC API Environment"**

## 🔧 Environment Variables

The collection uses these environment variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `base_url` | API server base URL | `http://localhost:3000` |
| `auth_token` | JWT authentication token | Auto-filled after login |
| `user_id` | User ID | Auto-filled after login |
| `itinerary_id` | Itinerary ID for testing | Manual input required |
| `shareable_id` | Shareable link ID | Manual input required |
| `save_token` | Internal flag for token saving | `false` |

