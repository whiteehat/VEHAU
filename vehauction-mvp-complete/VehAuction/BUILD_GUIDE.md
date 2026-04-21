# VehAuction - Complete Build & Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Database Management](#database-management)
3. [Running the Application](#running-the-application)
4. [Testing Features](#testing-features)
5. [Docker Deployment](#docker-deployment)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 12+ ([Download](https://www.postgresql.org/))
- Git ([Download](https://git-scm.com/))
- Docker & Docker Compose (optional, for containerized setup)

### Step 1: Clone and Install Dependencies

```bash
# Clone the project
git clone <repository-url>
cd vehauction

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (in another terminal)
cd frontend
npm install
```

### Step 2: Setup Environment Variables

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
```
DATABASE_URL=postgresql://vehauction:vehauction123@localhost:5432/vehauction_db
JWT_SECRET=your_super_secret_key_min_32_chars_long_change_this
PAYSTACK_SECRET=sk_test_your_paystack_test_key
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
API_PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```bash
cd ../frontend
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=VehAuction
```

---

## Database Management

### Setup PostgreSQL

#### Option 1: Using Docker
```bash
# Start PostgreSQL container
docker-compose up postgres

# Wait for container to be healthy, then in another terminal:
cd backend
npx prisma migrate deploy
```

#### Option 2: Local PostgreSQL
```bash
# Create database and user
createdb vehauction_db
createuser vehauction -P  # Password: vehauction123

# Grant privileges
psql -d vehauction_db -c "GRANT ALL PRIVILEGES ON DATABASE vehauction_db TO vehauction;"

# Navigate to backend and run migrations
cd backend
npx prisma migrate deploy
```

### Running Migrations

```bash
cd backend

# Create new migration (after schema changes)
npx prisma migrate dev --name migration_name

# Deploy migrations to database
npx prisma migrate deploy

# View database schema in browser GUI
npx prisma studio
```

### Seeding Database

```bash
cd backend

# Load test data for all user roles and features
npm run seed

# Output:
# ✨ Database seeded successfully!
# 
# 📋 Test Accounts:
#   Admin: admin@vehauction.ng / Admin@123456
#   Buyer: buyer@example.com / Buyer@123456
#   Seller: seller@example.com / Seller@123456
#   Vendor: vendor@example.com / Vendor@123456
#   Inspector: inspector@example.com / Inspector@123456
```

---

## Running the Application

### Development Mode (3 Terminal Windows)

**Terminal 1: PostgreSQL**
```bash
# If using Docker
docker-compose up postgres

# If using local PostgreSQL, skip this step
```

**Terminal 2: Backend**
```bash
cd backend
npm run start:dev
# Output: ✅ VehAuction API running on http://localhost:3001
# 📚 Swagger docs available at http://localhost:3001/api
```

**Terminal 3: Frontend**
```bash
cd frontend
npm run dev
# Output: - ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Full Stack with Docker Compose

```bash
# From project root
docker-compose up --build

# Then visit:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/api
```

---

## Testing Features

### 1. **Test User Authentication**

```bash
# Login as Admin
Email: admin@vehauction.ng
Password: Admin@123456

# Login as Buyer
Email: buyer@example.com
Password: Buyer@123456

# Login as Seller
Email: seller@example.com
Password: Seller@123456

# Login as Vendor
Email: vendor@example.com
Password: Vendor@123456

# Login as Inspector
Email: inspector@example.com
Password: Inspector@123456
```

### 2. **Test Vehicle Auction Flow**

**As Seller:**
1. Navigate to Dashboard → My Vehicles
2. Click "Add Vehicle"
3. Fill in vehicle details (Toyota Camry, 2018, etc.)
4. Submit → Status changes to DRAFT
5. Click vehicle → "Request Inspection"
6. Pay ₦10,000 inspection fee
7. Status changes to PENDING_INSPECTION

**As Inspector:**
1. Navigate to Dashboard → Inspection Queue
2. Click vehicle to inspect
3. Start Inspection
4. Upload inspection report with:
   - Mechanical Grade (A-D)
   - Engine Status
   - Transmission Status
   - Overall Notes
   - Photos
5. Submit

**As Admin:**
1. Navigate to Admin Dashboard
2. Go to "Review Inspections"
3. Approve inspection report
4. Vehicle status changes to READY_FOR_AUCTION
5. Go to "Manage Auctions"
6. Create auction with:
   - Starting Price: ₦4,000,000
   - Reserve Price: ₦5,000,000
   - Duration: 24 hours
   - Min. Increment: ₦100,000

**As Buyer:**
1. Fund wallet: Min ₦100,000 required
   - Click "My Wallet" → Fund Wallet
   - Enter amount and submit (test payment)
2. Navigate to Browse Auctions
3. Click auction
4. Enter bid amount (must meet minimum increment)
5. Click "Place Bid"
6. See real-time bid updates via WebSocket
7. If highest bidder when auction ends:
   - Complete payment within 6 hours
   - ₦100,000 commission fee deducted

### 3. **Test Parts Marketplace**

**As Vendor:**
1. Navigate to Dashboard → My Shop
2. Click "Add Part"
3. Fill in part details:
   - Name: Engine Oil Filter
   - Category: ENGINE
   - Condition: NEW
   - Brand: Toyota OEM
   - Price: ₦3,500
   - Quantity: 50
   - Add Compatibility: Toyota Corolla 2010-2020
4. Submit
5. Part appears in shop inventory

**As Buyer:**
1. Navigate to Parts Marketplace
2. Search by vehicle (Make: Toyota, Model: Corolla, Year: 2015)
3. Filter by category or condition
4. Click part
5. Add to Cart → Specify quantity
6. Go to Cart → Checkout
7. Review order and pay
8. Order status updates as vendor processes

### 4. **Test Real-time Bidding (WebSocket)**

**Setup 2 Browser Windows:**
- Window 1: Logged in as buyer@example.com
- Window 2: Logged in as buyer2@example.com

**Test Steps:**
1. Both open same auction
2. Window 1 places bid: ₦4,200,000
3. Window 2 sees real-time update instantly (no page refresh)
4. Window 2 places higher bid: ₦4,300,000
5. Window 1 sees update immediately
6. Watch bid history update in real-time
7. View "Online Users" count in bottom right

### 5. **Test Admin Dashboard**

**As Admin:**
1. Navigate to Admin Dashboard
2. View KPIs: Total Users, Active Auctions, Revenue
3. Recent Activities feed
4. Manage Users → Approve/Reject registrations
5. Manage Auctions → Monitor active auctions
6. Review Inspections → Approve/Reject reports
7. Manage Disputes → Handle refunds
8. View Audit Logs → Track admin actions

---

## Docker Deployment

### Build Docker Images

```bash
# From project root
docker-compose build

# List images
docker images | grep vehauction
```

### Run Full Stack

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production Deployment

#### Environment Variables (Production)

**.env (Backend)**
```
DATABASE_URL=postgresql://user:password@prod-db-host:5432/vehauction_prod
JWT_SECRET=use_a_strong_random_string_min_32_chars
PAYSTACK_SECRET=sk_live_your_production_paystack_key
CLOUDINARY_NAME=your_production_cloudinary_name
CLOUDINARY_API_KEY=production_key
CLOUDINARY_API_SECRET=production_secret
NODE_ENV=production
API_PORT=3001
FRONTEND_URL=https://your-domain.com
```

**.env.production (Frontend)**
```
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_APP_NAME=VehAuction
```

#### Deploy to Cloud (Example: Heroku)

```bash
# Backend (Heroku)
heroku create vehauction-backend
heroku config:set -a vehauction-backend DATABASE_URL=<production-db-url>
heroku config:set -a vehauction-backend JWT_SECRET=<your-secret>
heroku config:set -a vehauction-backend PAYSTACK_SECRET=<paystack-live-key>
git push heroku main

# Frontend (Vercel)
cd frontend
vercel --prod
```

---

## API Documentation

### Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://your-domain.com/api`

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

### Core Endpoints

#### Auth
```
POST   /auth/register                    # Create new account
POST   /auth/login                       # Login & get JWT
GET    /auth/profile                     # Get current user (Protected)
```

#### Auctions
```
GET    /auctions                         # Browse active auctions
GET    /auctions/:id                     # Get auction details
GET    /auctions/:id/bids                # Get all bids for auction
POST   /auctions                         # Create auction (Admin)
POST   /auctions/:id/payment-complete    # Mark payment done (Protected)
```

#### WebSocket (Real-time Bidding)
```
Event: join_auction
Emit: { auctionId: "..." }

Event: place_bid
Emit: { auctionId: "...", bidderId: "...", amount: 420000000 }

Event: new_bid (Listen)
Receive: { bidId, amount, timestamp, status }

Event: auction_ended (Listen)
Receive: { winnerId, winningBid, timestamp }
```

#### Vehicles
```
POST   /vehicles                         # Create vehicle (Seller)
GET    /vehicles                         # Get seller's vehicles (Seller)
PUT    /vehicles/:id                     # Update vehicle (Seller)
POST   /vehicles/:id/request-inspection  # Request inspection (Seller)
```

#### Inspections
```
GET    /inspections/queue                # Get inspection queue (Inspector)
POST   /inspections/start/:vehicleId     # Start inspection (Inspector)
PATCH  /inspections/:id/submit           # Submit report (Inspector)
PATCH  /inspections/:id/approve          # Approve report (Admin)
PATCH  /inspections/:id/reject           # Reject report (Admin)
```

#### Parts
```
GET    /parts                            # List all parts
GET    /parts/search                     # Search with filters (make/model/year)
GET    /parts/:id                        # Get part details
POST   /parts                            # Create part (Vendor)
PUT    /parts/:id                        # Update part (Vendor)
DELETE /parts/:id                        # Delete part (Vendor)
GET    /parts/categories                 # Get all categories
```

#### Cart & Orders
```
GET    /cart                             # Get user's cart (Protected)
POST   /cart/add                         # Add to cart (Protected)
DELETE /cart/items/:itemId               # Remove from cart (Protected)
PATCH  /cart/items/:itemId/quantity      # Update quantity (Protected)
POST   /orders                           # Create order (Protected)
GET    /orders                           # Get user's orders (Protected)
PATCH  /orders/:orderId/items/:itemId/status  # Update order status (Vendor)
```

#### Wallet
```
GET    /wallet/balance                   # Get wallet balance (Protected)
POST   /wallet/fund                      # Fund wallet (Protected)
GET    /wallet/history                   # Get transactions (Protected)
```

### Response Format

**Success Response**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["BUYER"],
  "status": "APPROVED",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Response**
```json
{
  "statusCode": 400,
  "message": "Invalid credentials",
  "error": "BadRequestException",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Example Requests

#### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "Buyer@123456"
  }'
```

#### Place Bid (via WebSocket)
```javascript
const socket = io('http://localhost:3001');

socket.emit('place_bid', {
  auctionId: 'auction-123',
  bidderId: 'user-456',
  amount: 420000000  // in smallest unit (Kobo)
});

socket.on('bid_success', (data) => {
  console.log('Bid placed:', data.bidId);
});
```

#### Fund Wallet
```bash
curl -X POST http://localhost:3001/wallet/fund \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "reference": "paystack-ref-123"
  }'
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000    # Frontend
lsof -i :3001    # Backend
lsof -i :5432    # PostgreSQL

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Reset database
cd backend
npx prisma migrate reset

# Reseed
npm run seed
```

### WebSocket Connection Issues

- Check browser console for errors
- Verify CORS settings in `main.ts`
- Ensure frontend API URL matches backend host
- Try hard refresh (Ctrl+Shift+R)

### Module Not Found Errors

```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend specifically
cd backend
npm ci  # Clean install
```

### Prisma Issues

```bash
# Generate Prisma client
npx prisma generate

# Reset schema to DB
npx prisma db push --skip-validation

# View current schema state
npx prisma studio
```

### Missing Environment Variables

```bash
# Copy example env
cp .env.example .env

# Edit with your values
nano .env

# Verify
echo $DATABASE_URL
```

---

## Performance Tips

### Backend
- Enable caching for auctions list
- Use connection pooling (Prisma default)
- Index frequently queried fields
- Monitor WebSocket connections

### Frontend
- Use Next.js Image component for optimization
- Implement pagination for lists
- Cache API responses (SWR recommended)
- Lazy load dashboard components

### Database
- Add indexes on `userId`, `status`, `createdAt`
- Archive old transactions monthly
- Monitor query performance with `EXPLAIN ANALYZE`
- Regular backups every 24 hours

---

## Support & Contact

For issues, questions, or feature requests:
1. Check this guide first
2. Review GitHub issues
3. Contact: support@vehauction.ng

---

**Last Updated**: January 2024
**Version**: 1.0.0 MVP
