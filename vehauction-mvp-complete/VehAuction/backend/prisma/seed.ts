import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.inspectionReport.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.partCompatibility.deleteMany();
  await prisma.part.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.partCategory.deleteMany();
  await prisma.adminAuditLog.deleteMany();

  // Hash password function
  const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  };

  // ============ CREATE PART CATEGORIES ============
  const categories = await Promise.all([
    prisma.partCategory.create({
      data: { name: 'ENGINE', description: 'Engine parts and components' },
    }),
    prisma.partCategory.create({
      data: { name: 'SUSPENSION', description: 'Suspension system parts' },
    }),
    prisma.partCategory.create({
      data: { name: 'BRAKE', description: 'Brake system components' },
    }),
    prisma.partCategory.create({
      data: { name: 'ELECTRICAL', description: 'Electrical and battery parts' },
    }),
    prisma.partCategory.create({
      data: { name: 'BODY', description: 'Body and exterior parts' },
    }),
    prisma.partCategory.create({
      data: { name: 'INTERIOR', description: 'Interior and upholstery' },
    }),
    prisma.partCategory.create({
      data: { name: 'ACCESSORIES', description: 'Car accessories' },
    }),
  ]);

  console.log('✓ Created part categories');

  // ============ CREATE USERS ============
  const admin = await prisma.user.create({
    data: {
      email: 'admin@vehauction.ng',
      password: await hashPassword('Admin@123456'),
      firstName: 'Admin',
      lastName: 'User',
      phone: '+2348012345678',
      roles: ['ADMIN', 'SUPER_ADMIN'],
      status: 'APPROVED',
      emailVerified: true,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      password: await hashPassword('Buyer@123456'),
      firstName: 'John',
      lastName: 'Buyer',
      phone: '+2349012345678',
      roles: ['BUYER'],
      status: 'APPROVED',
      emailVerified: true,
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: 'buyer2@example.com',
      password: await hashPassword('Buyer@123456'),
      firstName: 'Mary',
      lastName: 'Bidder',
      phone: '+2349113345678',
      roles: ['BUYER'],
      status: 'APPROVED',
      emailVerified: true,
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      password: await hashPassword('Seller@123456'),
      firstName: 'Ahmed',
      lastName: 'Seller',
      phone: '+2348123456789',
      roles: ['SELLER'],
      status: 'APPROVED',
      emailVerified: true,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'seller2@example.com',
      password: await hashPassword('Seller@123456'),
      firstName: 'Chioma',
      lastName: 'Motors',
      phone: '+2348125556789',
      roles: ['SELLER'],
      status: 'APPROVED',
      emailVerified: true,
    },
  });

  const vendor = await prisma.user.create({
    data: {
      email: 'vendor@example.com',
      password: await hashPassword('Vendor@123456'),
      firstName: 'Femi',
      lastName: 'Vendor',
      phone: '+2349021234567',
      roles: ['VENDOR'],
      status: 'APPROVED',
      emailVerified: true,
    },
  });

  const vendor2 = await prisma.user.create({
    data: {
      email: 'vendor2@example.com',
      password: await hashPassword('Vendor@123456'),
      firstName: 'Zainab',
      lastName: 'Parts',
      phone: '+2349024534567',
      roles: ['VENDOR'],
      status: 'APPROVED',
      emailVerified: true,
    },
  });

  const inspector = await prisma.user.create({
    data: {
      email: 'inspector@example.com',
      password: await hashPassword('Inspector@123456'),
      firstName: 'Kunle',
      lastName: 'Inspector',
      phone: '+2348034567890',
      roles: ['INSPECTOR'],
      status: 'APPROVED',
      emailVerified: true,
    },
  });

  console.log('✓ Created users');

  // ============ CREATE WALLETS ============
  await prisma.wallet.create({
    data: {
      userId: admin.id,
      balance: 1000000000, // ₦10,000,000
      totalFunded: 1000000000,
    },
  });

  await prisma.wallet.create({
    data: {
      userId: buyer.id,
      balance: 50000000, // ₦500,000
      totalFunded: 50000000,
    },
  });

  await prisma.wallet.create({
    data: {
      userId: buyer2.id,
      balance: 75000000, // ₦750,000
      totalFunded: 75000000,
    },
  });

  await prisma.wallet.create({
    data: {
      userId: seller.id,
      balance: 5000000, // ₦50,000
      totalFunded: 5000000,
    },
  });

  await prisma.wallet.create({
    data: {
      userId: seller2.id,
      balance: 3000000, // ₦30,000
      totalFunded: 3000000,
    },
  });

  await prisma.wallet.create({
    data: {
      userId: vendor.id,
      balance: 10000000, // ₦100,000
      totalFunded: 10000000,
    },
  });

  await prisma.wallet.create({
    data: {
      userId: vendor2.id,
      balance: 8000000, // ₦80,000
      totalFunded: 8000000,
    },
  });

  await prisma.wallet.create({
    data: {
      userId: inspector.id,
      balance: 500000, // ₦5,000
      totalFunded: 500000,
    },
  });

  console.log('✓ Created wallets');

  // ============ CREATE VENDOR PROFILES ============
  const vendorProfile1 = await prisma.vendorProfile.create({
    data: {
      userId: vendor.id,
      businessName: 'Femi Auto Parts',
      businessAddress: '123 Motor Road, Lekki',
      businessPhone: '+2349021234567',
      location: 'Lagos',
      registrationNumber: 'CAC/REG/001',
      status: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  const vendorProfile2 = await prisma.vendorProfile.create({
    data: {
      userId: vendor2.id,
      businessName: 'Zainab Motors Supply',
      businessAddress: '456 Engineering Road, Abuja',
      businessPhone: '+2349024534567',
      location: 'Abuja',
      registrationNumber: 'CAC/REG/002',
      status: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  console.log('✓ Created vendor profiles');

  // ============ CREATE VEHICLES ============
  const vehicle1 = await prisma.vehicle.create({
    data: {
      sellerId: seller.id,
      make: 'Toyota',
      model: 'Corolla',
      year: 2015,
      vin: 'JTDKN3AU3F0123456',
      mileage: 85000,
      color: 'Silver',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      engineCC: 1600,
      condition: 'GOOD',
      location: 'Lagos',
      status: 'READY_FOR_AUCTION',
      description: 'Well-maintained Toyota Corolla, single owner',
      images: [
        'https://via.placeholder.com/600x400?text=Toyota+Corolla+Front',
        'https://via.placeholder.com/600x400?text=Toyota+Corolla+Side',
        'https://via.placeholder.com/600x400?text=Toyota+Corolla+Interior',
      ],
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      sellerId: seller.id,
      make: 'Toyota',
      model: 'Camry',
      year: 2018,
      vin: 'JTDKN3AU5F0654321',
      mileage: 45000,
      color: 'Black',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      engineCC: 2000,
      condition: 'EXCELLENT',
      location: 'Lagos',
      status: 'READY_FOR_AUCTION',
      description: 'Barely driven Toyota Camry, full service history',
      images: [
        'https://via.placeholder.com/600x400?text=Toyota+Camry+Front',
        'https://via.placeholder.com/600x400?text=Toyota+Camry+Side',
      ],
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      sellerId: seller2.id,
      make: 'Lexus',
      model: 'RX300',
      year: 2012,
      vin: 'JTJHA95D7C2234567',
      mileage: 120000,
      color: 'White',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      engineCC: 3000,
      condition: 'FAIR',
      location: 'Abuja',
      status: 'READY_FOR_AUCTION',
      description: 'Reliable Lexus RX300, needs minor repairs',
      images: [
        'https://via.placeholder.com/600x400?text=Lexus+RX300+Front',
      ],
    },
  });

  console.log('✓ Created vehicles');

  // ============ CREATE INSPECTION REPORTS ============
  await prisma.inspectionReport.create({
    data: {
      vehicleId: vehicle1.id,
      inspectorId: inspector.id,
      mechanicalGrade: 'B',
      engineStatus: 'Good',
      transmissionStatus: 'Excellent',
      brakesStatus: 'Good',
      suspensionStatus: 'Fair',
      accidentHistory: false,
      documentationVerified: true,
      theftClearance: true,
      overallNotes: 'Vehicle is in good condition. Recommended for auction.',
      status: 'APPROVED',
      approvedAt: new Date(),
      photos: ['https://via.placeholder.com/400?text=Engine+Inspection'],
    },
  });

  await prisma.inspectionReport.create({
    data: {
      vehicleId: vehicle2.id,
      inspectorId: inspector.id,
      mechanicalGrade: 'A',
      engineStatus: 'Excellent',
      transmissionStatus: 'Excellent',
      brakesStatus: 'Excellent',
      suspensionStatus: 'Excellent',
      accidentHistory: false,
      documentationVerified: true,
      theftClearance: true,
      overallNotes: 'Pristine condition. Ready for premium auction.',
      status: 'APPROVED',
      approvedAt: new Date(),
      photos: ['https://via.placeholder.com/400?text=Full+Inspection'],
    },
  });

  await prisma.inspectionReport.create({
    data: {
      vehicleId: vehicle3.id,
      inspectorId: inspector.id,
      mechanicalGrade: 'C',
      engineStatus: 'Fair',
      transmissionStatus: 'Good',
      brakesStatus: 'Fair',
      suspensionStatus: 'Fair',
      accidentHistory: false,
      documentationVerified: true,
      theftClearance: true,
      overallNotes: 'Vehicle needs some repairs but reliable.',
      status: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  console.log('✓ Created inspection reports');

  // ============ CREATE AUCTIONS ============
  const now = new Date();
  const startTime1 = new Date(now.getTime() + 1000 * 60 * 60); // 1 hour from now
  const endTime1 = new Date(startTime1.getTime() + 1000 * 60 * 60 * 24); // 24 hours later

  const startTime2 = new Date(now.getTime() + 1000 * 60 * 60 * 2); // 2 hours from now
  const endTime2 = new Date(startTime2.getTime() + 1000 * 60 * 60 * 48); // 48 hours later

  const auction1 = await prisma.auction.create({
    data: {
      vehicleId: vehicle1.id,
      title: '2015 Toyota Corolla - Silver',
      description: 'Well-maintained, single owner vehicle',
      startPrice: 350000000, // ₦3.5M
      reservePrice: 400000000, // ₦4.0M
      minimumIncrement: 5000000, // ₦50k
      startTime: startTime1,
      endTime: endTime1,
      status: 'SCHEDULED',
    },
  });

  const auction2 = await prisma.auction.create({
    data: {
      vehicleId: vehicle2.id,
      title: '2018 Toyota Camry - Black',
      description: 'Pristine condition, full service history',
      startPrice: 650000000, // ₦6.5M
      reservePrice: 700000000, // ₦7.0M
      minimumIncrement: 10000000, // ₦100k
      startTime: startTime2,
      endTime: endTime2,
      status: 'SCHEDULED',
    },
  });

  const auction3 = await prisma.auction.create({
    data: {
      vehicleId: vehicle3.id,
      title: '2012 Lexus RX300 - White',
      description: 'Reliable SUV, needs minor repairs',
      startPrice: 250000000, // ₦2.5M
      reservePrice: 280000000, // ₦2.8M
      minimumIncrement: 5000000, // ₦50k
      startTime: new Date(now.getTime() + 1000 * 60 * 60 * 3),
      endTime: new Date(now.getTime() + 1000 * 60 * 60 * 75),
      status: 'SCHEDULED',
    },
  });

  console.log('✓ Created auctions');

  // ============ CREATE BIDS ============
  await prisma.bid.create({
    data: {
      auctionId: auction1.id,
      bidderId: buyer.id,
      amount: 380000000, // ₦3.8M
      status: 'ACTIVE',
      walletLocked: 380000000,
    },
  });

  await prisma.bid.create({
    data: {
      auctionId: auction1.id,
      bidderId: buyer2.id,
      amount: 390000000, // ₦3.9M
      status: 'ACTIVE',
      walletLocked: 390000000,
    },
  });

  await prisma.bid.create({
    data: {
      auctionId: auction2.id,
      bidderId: buyer.id,
      amount: 700000000, // ₦7.0M
      status: 'ACTIVE',
      walletLocked: 700000000,
    },
  });

  console.log('✓ Created bids');

  // ============ CREATE PARTS ============
  const part1 = await prisma.part.create({
    data: {
      vendorId: vendor.id,
      name: 'Engine Oil Filter',
      categoryId: categories[0].id, // ENGINE
      condition: 'NEW',
      brand: 'OEM Toyota',
      description: 'Original Toyota engine oil filter',
      price: 350000, // ₦3,500
      quantity: 50,
      deliveryOptions: ['PICKUP', 'DELIVERY'],
      vendorLocation: 'Lagos',
      photos: ['https://via.placeholder.com/300x300?text=Oil+Filter'],
      isActive: true,
    },
  });

  await prisma.partCompatibility.create({
    data: {
      partId: part1.id,
      vehicleMake: 'Toyota',
      vehicleModel: 'Corolla',
      yearStart: 2010,
      yearEnd: 2020,
    },
  });

  const part2 = await prisma.part.create({
    data: {
      vendorId: vendor.id,
      name: 'Brake Pads Set',
      categoryId: categories[2].id, // BRAKE
      condition: 'NEW',
      brand: 'Bosch',
      description: 'High-quality brake pads for better stopping',
      price: 850000, // ₦8,500
      quantity: 30,
      deliveryOptions: ['PICKUP', 'DELIVERY'],
      vendorLocation: 'Lagos',
      photos: ['https://via.placeholder.com/300x300?text=Brake+Pads'],
      isActive: true,
    },
  });

  await prisma.partCompatibility.create({
    data: {
      partId: part2.id,
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      yearStart: 2015,
      yearEnd: 2023,
    },
  });

  const part3 = await prisma.part.create({
    data: {
      vendorId: vendor2.id,
      name: 'Car Battery 12V 65Ah',
      categoryId: categories[3].id, // ELECTRICAL
      condition: 'NEW',
      brand: 'Exide',
      description: 'Long-lasting car battery',
      price: 2500000, // ₦25,000
      quantity: 20,
      deliveryOptions: ['PICKUP', 'DELIVERY'],
      vendorLocation: 'Abuja',
      photos: ['https://via.placeholder.com/300x300?text=Car+Battery'],
      isActive: true,
    },
  });

  await prisma.partCompatibility.create({
    data: {
      partId: part3.id,
      vehicleMake: 'Toyota',
      vehicleModel: 'Corolla',
      yearStart: 2000,
      yearEnd: 2023,
    },
  });

  await prisma.partCompatibility.create({
    data: {
      partId: part3.id,
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      yearStart: 2000,
      yearEnd: 2023,
    },
  });

  const part4 = await prisma.part.create({
    data: {
      vendorId: vendor.id,
      name: 'Air Filter',
      categoryId: categories[0].id, // ENGINE
      condition: 'NEW',
      brand: 'Mann Filter',
      description: 'Premium air filter for better engine performance',
      price: 280000, // ₦2,800
      quantity: 40,
      deliveryOptions: ['PICKUP', 'DELIVERY'],
      vendorLocation: 'Lagos',
      photos: ['https://via.placeholder.com/300x300?text=Air+Filter'],
      isActive: true,
    },
  });

  await prisma.partCompatibility.create({
    data: {
      partId: part4.id,
      vehicleMake: 'Lexus',
      vehicleModel: 'RX300',
      yearStart: 2005,
      yearEnd: 2015,
    },
  });

  const part5 = await prisma.part.create({
    data: {
      vendorId: vendor2.id,
      name: 'Windshield Wipers',
      categoryId: categories[4].id, // BODY
      condition: 'NEW',
      brand: 'Bosch',
      description: 'Efficient windshield wipers',
      price: 450000, // ₦4,500
      quantity: 60,
      deliveryOptions: ['PICKUP', 'DELIVERY'],
      vendorLocation: 'Abuja',
      photos: ['https://via.placeholder.com/300x300?text=Windshield+Wipers'],
      isActive: true,
    },
  });

  await prisma.partCompatibility.create({
    data: {
      partId: part5.id,
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      yearStart: 2010,
      yearEnd: 2022,
    },
  });

  const part6 = await prisma.part.create({
    data: {
      vendorId: vendor.id,
      name: 'Floor Mats Set',
      categoryId: categories[5].id, // INTERIOR
      condition: 'NEW',
      brand: 'Generic',
      description: 'Premium floor mats for car interior',
      price: 650000, // ₦6,500
      quantity: 25,
      deliveryOptions: ['PICKUP', 'DELIVERY'],
      vendorLocation: 'Lagos',
      photos: ['https://via.placeholder.com/300x300?text=Floor+Mats'],
      isActive: true,
    },
  });

  await prisma.partCompatibility.create({
    data: {
      partId: part6.id,
      vehicleMake: 'Toyota',
      vehicleModel: 'Corolla',
      yearStart: 2010,
      yearEnd: 2023,
    },
  });

  const part7 = await prisma.part.create({
    data: {
      vendorId: vendor2.id,
      name: 'Seat Covers',
      categoryId: categories[5].id, // INTERIOR
      condition: 'NEW',
      brand: 'Premium Leather',
      description: 'Comfortable and durable seat covers',
      price: 1500000, // ₦15,000
      quantity: 15,
      deliveryOptions: ['PICKUP', 'DELIVERY'],
      vendorLocation: 'Abuja',
      photos: ['https://via.placeholder.com/300x300?text=Seat+Covers'],
      isActive: true,
    },
  });

  await prisma.partCompatibility.create({
    data: {
      partId: part7.id,
      vehicleMake: 'Lexus',
      vehicleModel: 'RX300',
      yearStart: 2005,
      yearEnd: 2020,
    },
  });

  const part8 = await prisma.part.create({
    data: {
      vendorId: vendor.id,
      name: 'Car Air Freshener',
      categoryId: categories[6].id, // ACCESSORIES
      condition: 'NEW',
      brand: 'Vanilla Paradise',
      description: 'Long-lasting car air freshener',
      price: 150000, // ₦1,500
      quantity: 100,
      deliveryOptions: ['PICKUP', 'DELIVERY'],
      vendorLocation: 'Lagos',
      photos: ['https://via.placeholder.com/300x300?text=Air+Freshener'],
      isActive: true,
    },
  });

  const part9 = await prisma.part.create({
    data: {
      vendorId: vendor.id,
      name: 'Door Lock Actuator',
      categoryId: categories[4].id, // BODY
      condition: 'USED',
      brand: 'OEM Toyota',
      description: 'Working door lock actuator from salvaged vehicle',
      price: 350000, // ₦3,500
      quantity: 5,
      deliveryOptions: ['PICKUP', 'DELIVERY'],
      vendorLocation: 'Lagos',
      photos: ['https://via.placeholder.com/300x300?text=Door+Lock'],
      isActive: true,
    },
  });

  await prisma.partCompatibility.create({
    data: {
      partId: part9.id,
      vehicleMake: 'Toyota',
      vehicleModel: 'Corolla',
      yearStart: 2012,
      yearEnd: 2018,
    },
  });

  const part10 = await prisma.part.create({
    data: {
      vendorId: vendor2.id,
      name: 'Transmission Fluid',
      categoryId: categories[0].id, // ENGINE
      condition: 'NEW',
      brand: 'Toyota ATF',
      description: 'Original Toyota transmission fluid 4L',
      price: 750000, // ₦7,500
      quantity: 35,
      deliveryOptions: ['PICKUP', 'DELIVERY'],
      vendorLocation: 'Abuja',
      photos: ['https://via.placeholder.com/300x300?text=Transmission+Fluid'],
      isActive: true,
    },
  });

  await prisma.partCompatibility.create({
    data: {
      partId: part10.id,
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      yearStart: 2008,
      yearEnd: 2023,
    },
  });

  console.log('✓ Created parts and compatibility data');

  // ============ CREATE CARTS ============
  await prisma.cart.create({
    data: {
      userId: buyer.id,
    },
  });

  await prisma.cart.create({
    data: {
      userId: buyer2.id,
    },
  });

  console.log('✓ Created carts');

  console.log('✨ Database seeded successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('  Admin: admin@vehauction.ng / Admin@123456');
  console.log('  Buyer: buyer@example.com / Buyer@123456');
  console.log('  Seller: seller@example.com / Seller@123456');
  console.log('  Vendor: vendor@example.com / Vendor@123456');
  console.log('  Inspector: inspector@example.com / Inspector@123456');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
