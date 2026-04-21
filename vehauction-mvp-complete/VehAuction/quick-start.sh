#!/bin/bash

# VehAuction Quick Start Script
# Usage: bash quick-start.sh

set -e

echo "🚗 VehAuction Quick Start"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm -v)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null && ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL/Docker not found. Will use containerized PostgreSQL if Docker available.${NC}"
fi

echo ""
echo "📦 Installing dependencies..."

# Backend
echo "Installing backend..."
cd backend
npm install --silent
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Frontend  
echo "Installing frontend..."
cd ../frontend
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

cd ..

echo ""
echo "🗄️  Setting up environment variables..."

# Backend .env
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
else
    echo -e "${YELLOW}ℹ️  backend/.env already exists${NC}"
fi

# Frontend .env.local
if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo -e "${GREEN}✓ Created frontend/.env.local${NC}"
else
    echo -e "${YELLOW}ℹ️  frontend/.env.local already exists${NC}"
fi

echo ""
echo "💾 Database setup..."

if command -v docker &> /dev/null; then
    echo "Starting PostgreSQL with Docker..."
    docker-compose up -d postgres
    echo -e "${GREEN}✓ PostgreSQL started${NC}"
    
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
fi

# Run migrations
echo "Running database migrations..."
cd backend
npx prisma migrate deploy --skip-generate
echo -e "${GREEN}✓ Migrations completed${NC}"

# Seed database
echo "Seeding database with test data..."
npm run seed
echo -e "${GREEN}✓ Database seeded${NC}"

cd ..

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo ""
echo "1️⃣  Start backend (Terminal 1):"
echo "   cd backend && npm run start:dev"
echo ""
echo "2️⃣  Start frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "3️⃣  Open browser:"
echo "   http://localhost:3000"
echo ""
echo "4️⃣  Test Credentials:"
echo "   Admin: admin@vehauction.ng / Admin@123456"
echo "   Buyer: buyer@example.com / Buyer@123456"
echo "   Seller: seller@example.com / Seller@123456"
echo "   Vendor: vendor@example.com / Vendor@123456"
echo "   Inspector: inspector@example.com / Inspector@123456"
echo ""
echo "📚 Documentation: See BUILD_GUIDE.md"
echo ""
