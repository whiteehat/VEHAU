import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async createVehicle(sellerId: string, data: any) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        sellerId,
        make: data.make,
        model: data.model,
        year: data.year,
        vin: data.vin,
        mileage: data.mileage,
        color: data.color,
        fuelType: data.fuelType,
        transmission: data.transmission,
        engineCC: data.engineCC,
        condition: data.condition,
        location: data.location,
        description: data.description,
        images: data.images || [],
        videoUrl: data.videoUrl,
        status: 'DRAFT',
      },
    });

    return vehicle;
  }

  async getVehicle(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        inspectionReport: true,
        auction: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async getSellerVehicles(sellerId: string) {
    return await this.prisma.vehicle.findMany({
      where: { sellerId },
      include: {
        inspectionReport: true,
        auction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateVehicle(vehicleId: string, sellerId: string, data: any) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.sellerId !== sellerId) {
      throw new ForbiddenException('You can only update your own vehicles');
    }

    if (vehicle.status !== 'DRAFT') {
      throw new BadRequestException(
        'You can only edit vehicles in DRAFT status',
      );
    }

    return await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        make: data.make || vehicle.make,
        model: data.model || vehicle.model,
        year: data.year || vehicle.year,
        vin: data.vin || vehicle.vin,
        mileage: data.mileage ?? vehicle.mileage,
        color: data.color || vehicle.color,
        fuelType: data.fuelType || vehicle.fuelType,
        transmission: data.transmission || vehicle.transmission,
        engineCC: data.engineCC || vehicle.engineCC,
        condition: data.condition || vehicle.condition,
        location: data.location || vehicle.location,
        description: data.description || vehicle.description,
        images: data.images || vehicle.images,
        videoUrl: data.videoUrl || vehicle.videoUrl,
      },
    });
  }

  async requestInspection(vehicleId: string, sellerId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.sellerId !== sellerId) {
      throw new ForbiddenException(
        'You can only request inspection for your own vehicles',
      );
    }

    if (vehicle.status !== 'DRAFT') {
      throw new BadRequestException(
        'Vehicle must be in DRAFT status to request inspection',
      );
    }

    // Deduct inspection fee (₦10,000)
    const inspectionFee = BigInt(1000000); // ₦10,000
    const balance = await this.walletService.getBalance(sellerId);

    if (balance < inspectionFee) {
      throw new BadRequestException(
        'Insufficient balance for inspection fee (₦10,000)',
      );
    }

    await this.walletService.deductBalance(
      sellerId,
      inspectionFee,
      'AUCTION_COMMISSION',
      'Vehicle inspection fee',
    );

    const updated = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: 'PENDING_INSPECTION',
        inspectionFee,
        inspectionFeePaid: true,
      },
    });

    return updated;
  }
}
