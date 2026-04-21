import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartsService {
  constructor(private prisma: PrismaService) {}

  async createPart(vendorId: string, data: any) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId: vendorId },
    });

    if (!vendor) {
      throw new BadRequestException('Vendor profile not found');
    }

    if (vendor.status !== 'APPROVED') {
      throw new ForbiddenException('Vendor is not approved');
    }

    const category = await this.prisma.partCategory.findUnique({
      where: { name: data.category },
    });

    if (!category) {
      throw new BadRequestException('Invalid part category');
    }

    const part = await this.prisma.part.create({
      data: {
        vendorId,
        name: data.name,
        categoryId: category.id,
        condition: data.condition,
        brand: data.brand,
        description: data.description,
        price: BigInt(Math.floor(data.price * 100)), // Convert to smallest unit
        quantity: data.quantity,
        deliveryOptions: data.deliveryOptions || ['PICKUP', 'DELIVERY'],
        vendorLocation: data.vendorLocation,
        photos: data.photos || [],
        isActive: true,
      },
    });

    // Add compatibility info
    if (data.compatibilities && Array.isArray(data.compatibilities)) {
      for (const compat of data.compatibilities) {
        await this.prisma.partCompatibility.create({
          data: {
            partId: part.id,
            vehicleMake: compat.vehicleMake,
            vehicleModel: compat.vehicleModel,
            yearStart: compat.yearStart,
            yearEnd: compat.yearEnd,
          },
        });
      }
    }

    return part;
  }

  async getPart(partId: string) {
    const part = await this.prisma.part.findUnique({
      where: { id: partId },
      include: {
        compatibilities: true,
        vendor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    return {
      ...part,
      price: part.price.toString(),
    };
  }

  async searchParts(query: any, skip: number = 0, take: number = 20) {
    const { make, model, year, category, condition, location } = query;

    const filters: any = {
      isActive: true,
    };

    if (category) {
      const partCategory = await this.prisma.partCategory.findUnique({
        where: { name: category },
      });
      if (partCategory) {
        filters.categoryId = partCategory.id;
      }
    }

    if (condition) {
      filters.condition = condition;
    }

    if (location) {
      filters.vendorLocation: location;
    }

    let parts = await this.prisma.part.findMany({
      where: filters,
      skip,
      take,
      include: {
        compatibilities: true,
        vendor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Filter by compatibility if make/model/year provided
    if (make && model && year) {
      parts = parts.filter((part) =>
        part.compatibilities.some(
          (compat) =>
            compat.vehicleMake.toLowerCase() === make.toLowerCase() &&
            compat.vehicleModel.toLowerCase() === model.toLowerCase() &&
            compat.yearStart <= year &&
            compat.yearEnd >= year,
        ),
      );
    }

    return parts.map((part) => ({
      ...part,
      price: part.price.toString(),
    }));
  }

  async getVendorParts(vendorId: string, skip: number = 0, take: number = 20) {
    const parts = await this.prisma.part.findMany({
      where: { vendorId },
      skip,
      take,
      include: {
        compatibilities: true,
      },
    });

    return parts.map((part) => ({
      ...part,
      price: part.price.toString(),
    }));
  }

  async updatePart(partId: string, vendorId: string, data: any) {
    const part = await this.prisma.part.findUnique({
      where: { id: partId },
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    if (part.vendorId !== vendorId) {
      throw new ForbiddenException('You can only update your own parts');
    }

    const updateData: any = {
      name: data.name || part.name,
      condition: data.condition || part.condition,
      brand: data.brand || part.brand,
      description: data.description || part.description,
      quantity: data.quantity ?? part.quantity,
      deliveryOptions: data.deliveryOptions || part.deliveryOptions,
      vendorLocation: data.vendorLocation || part.vendorLocation,
    };

    if (data.price) {
      updateData.price = BigInt(Math.floor(data.price * 100));
    }

    if (data.photos) {
      updateData.photos = data.photos;
    }

    const updated = await this.prisma.part.update({
      where: { id: partId },
      data: updateData,
    });

    return {
      ...updated,
      price: updated.price.toString(),
    };
  }

  async deletePart(partId: string, vendorId: string) {
    const part = await this.prisma.part.findUnique({
      where: { id: partId },
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    if (part.vendorId !== vendorId) {
      throw new ForbiddenException('You can only delete your own parts');
    }

    await this.prisma.part.update({
      where: { id: partId },
      data: { isActive: false },
    });

    return { message: 'Part deleted successfully' };
  }

  async getPartCategories() {
    return await this.prisma.partCategory.findMany();
  }
}
