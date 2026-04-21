# VehAuction - Nigerian Vehicle Auction + Parts Marketplace MVP

**"Verify Before You Bid"**

A production-grade web application for verified vehicle auctions and auto parts marketplace. Built with Next.js, NestJS, PostgreSQL, and real-time WebSockets.

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### 1. Clone & Install Dependencies

```bash
# Install backend
cd backend
npm install

# Install frontend (in another terminal)
cd frontend
npm install
```

### 2. Setup Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://vehauction:vehauction123@localhost:5432/vehauction_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PAYSTACK_SECRET=sk_test_your_paystack_key_here
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
API_PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=VehAuction
```

### 3. Database Setup

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Run Prisma migrations
cd backend
npx prisma migrate deploy

# Seed database with sample data
npm run seed
```

### 4. Start Services

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3 (Optional): Watch for file changes
cd backend
npm run build:watch
```

Access the app at: **http://localhost:3000**

## Or: Use Docker Compose (Full Stack)

```bash
docker-compose up --build
```

Then visit:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api

---

## Test Credentials (After Seeding)

### Admin
- Email: `admin@vehauction.ng`
- Password: `Admin@123456`

### Buyer/Bidder
- Email: `buyer@example.com`
- Password: `Buyer@123456`

### Seller
- Email: `seller@example.com`
- Password: `Seller@123456`

### Parts Vendor
- Email: `vendor@example.com`
- Password: `Vendor@123456`

### Inspector
- Email: `inspector@example.com`
- Password: `Inspector@123456`

---

## Testing Key Features

### 1. Test Vehicle Auction Bidding

1. Login as **Buyer** → "Browse Auctions"
2. Fund wallet with ₦500,000 (use test card: 4111 1111 1111 1111)
3. Click auction → Place bid
4. Watch real-time bid updates (Socket.IO)
5. Win auction → Complete payment within 6 hours

### 2. Test Parts Marketplace

1. Login as **Vendor** → "My Shop"
2. Add spare parts (engine, suspension, etc.)
3. Set compatibility (Toyota 2015-2020)
4. Login as **Buyer** → "Parts Marketplace"
5. Search by Make/Model/Year
6. Add to cart → Checkout → Pay

### 3. Test Vehicle Inspection Flow

1. Login as **Seller** → "Submit Vehicle"
2. Fill vehicle details (Toyota Camry, 2018, etc.)
3. Request inspection (₦10,000 fee)
4. Login as **Inspector** → "Inspection Queue"
5. Upload inspection report with photos/video
6. Admin approves → Seller can list for auction

### 4. Test Real-Time Bidding

- Open auction in 2 browser tabs
- Bid in tab 1 → See live update in tab 2
- Try bidding below minimum increment → Validation error

---

## Project Structure

```
vehauction/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── vehicles/
│   │   ├── inspections/
│   │   ├── auctions/
│   │   ├── bids/
│   │   ├── parts/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── wallet/
│   │   ├── admin/
│   │   ├── common/
│   │   ├── prisma/
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── auctions/
│   │   │   ├── parts/
│   │   │   └── admin/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   ├── .env.local
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Architecture Highlights

### Backend (NestJS)
- **JWT Auth** + RBAC middleware for 5 user roles
- **Auction Engine** service with real-time Socket.IO bidding
- **Parts Marketplace** module with compatibility search
- **Wallet System** with Paystack integration (stub for MVP)
- **Inspection Pipeline** with photo/video upload support
- **Admin Dashboard** API with audit logging
- **Cron Jobs** for auction expiry and payment deadlines
- **WebSocket Gateway** for live bid updates + fallback polling

### Frontend (Next.js)
- **App Router** with TypeScript
- **TailwindCSS** for Nigerian startup aesthetic
- **Socket.IO Client** for real-time bidding
- **Context API** for auth state
- **Responsive Dashboards** for all 5 user roles
- **Dynamic Part Search** with year compatibility
- **Real-time Bid Board** with auto-refresh fallback

### Database (PostgreSQL + Prisma)
- 18 models covering all features
- Audit logs for admin actions
- Transaction tracking for wallet
- Escrow mechanism for auction payments

---

## API Documentation

### Authentication
```
POST /auth/register
POST /auth/login
POST /auth/refresh
GET  /auth/profile (Protected)
```

### Auctions
```
GET    /auctions (public)
GET    /auctions/:id (public)
POST   /auctions (Admin)
POST   /auctions/:id/start (Admin)
GET    /auctions/:id/bids (public - with WebSocket fallback)
POST   /bids (Protected)
```

### Vehicle Listings
```
POST   /vehicles (Seller)
GET    /vehicles/:id (Seller)
PATCH  /vehicles/:id (Seller)
POST   /vehicles/:id/request-inspection (Seller)
```

### Inspection
```
GET    /inspections (Inspector)
PATCH  /inspections/:id (Inspector)
PATCH  /inspections/:id/approve (Admin)
```

### Parts Marketplace
```
GET    /parts (public - with filters)
GET    /parts/search (public - make/model/year search)
POST   /parts (Vendor)
PATCH  /parts/:id (Vendor)
DELETE /parts/:id (Vendor)
```

### Cart & Orders
```
POST   /cart (Protected)
GET    /cart (Protected)
DELETE /cart/:itemId (Protected)
POST   /orders (Protected)
GET    /orders (Protected)
PATCH  /orders/:id/status (Vendor)
```

### Wallet
```
POST   /wallet/fund (Protected)
GET    /wallet/balance (Protected)
GET    /wallet/history (Protected)
```

### Admin
```
GET    /admin/users (Admin)
PATCH  /admin/users/:id/approve (Admin)
GET    /admin/analytics (Admin)
GET    /admin/audit-logs (Admin)
```

---

## Deployment

### Docker Build & Push
```bash
docker-compose build
docker tag vehauction-backend:latest your-registry/vehauction-backend
docker push your-registry/vehauction-backend
```

### Production Environment
- Use managed PostgreSQL (e.g., AWS RDS)
- Use Cloudinary for file storage (not local)
- Enable HTTPS
- Set `NODE_ENV=production`
- Use production Paystack keys
- Enable rate limiting and CORS restrictions

---

## Features Implemented

### Vehicle Auction
- ✅ Seller vehicle submission
- ✅ Inspector inspection workflow with photo/video
- ✅ Admin approval pipeline
- ✅ Real-time bidding with Socket.IO + polling fallback
- ✅ Reserve price (hidden from bidders)
- ✅ Minimum bid increment rules
- ✅ 6-hour payment deadline enforcement
- ✅ Winner selection logic

### Parts Marketplace
- ✅ Vendor profile & parts listing
- ✅ Dynamic compatibility search (Make/Model/Year)
- ✅ Multi-category parts (engine, suspension, brake, etc.)
- ✅ Condition tracking (New/Used/Refurbished)
- ✅ Cart & checkout
- ✅ Order status tracking
- ✅ Delivery options
- ✅ Return/refund requests

### Wallet & Payment
- ✅ Paystack integration (stub for MVP)
- ✅ Wallet funding & balance tracking
- ✅ Transaction history
- ✅ Bidder ₦100,000 wallet requirement
- ✅ Commission deduction on auction win
- ✅ Vendor payout tracking

### Admin Dashboard
- ✅ User approval workflows
- ✅ Auction monitoring
- ✅ Parts moderation
- ✅ Dispute/refund approval
- ✅ Revenue analytics
- ✅ Audit logging

### Security
- ✅ JWT authentication
- ✅ RBAC (5 roles)
- ✅ Input validation (DTOs)
- ✅ Rate limiting on bid endpoints
- ✅ Secure file upload validation
- ✅ Audit logs for sensitive actions

---

## Troubleshooting

### Port Already in Use
```bash
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
lsof -ti:3001 | xargs kill -9  # Kill process on port 3001
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
```

### WebSocket Not Connecting
- Check that both frontend and backend are running
- Verify `NEXT_PUBLIC_API_URL` points to correct backend URL
- Check browser console for connection errors
- Fallback polling will activate automatically

### Seed Data Not Loading
```bash
# Clear existing data (careful!)
npx prisma db push --skip-generate --skip-validation

# Re-run seed
npm run seed
```

---

## Future Enhancements

- [ ] Email notifications (verification, bid alerts, payment confirmations)
- [ ] SMS alerts via Termii
- [ ] Advanced analytics dashboard
- [ ] Machine learning for vehicle valuation
- [ ] Multi-currency support (NGN, USD, EUR)
- [ ] Mobile app (React Native)
- [ ] Advanced dispute resolution system
- [ ] Insurance integration
- [ ] Trade-in vehicle acceptance
- [ ] Vehicle history report integration (via NHTSA/equivalent)

---

## Support & Contributing

For issues, feature requests, or contributions:
1. Create an issue with clear description
2. Fork and create feature branch
3. Submit pull request with tests

---

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the Nigerian automotive market**

**VehAuction Team**
