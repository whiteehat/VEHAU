import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUserId } from '../auth/decorators/auth.decorators';

class CreateVehicleDto {
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage: number;
  color?: string;
  fuelType?: string;
  transmission?: string;
  engineCC?: number;
  condition: string;
  location: string;
  description?: string;
  images?: string[];
  videoUrl?: string;
}

class UpdateVehicleDto {
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  mileage?: number;
  color?: string;
  fuelType?: string;
  transmission?: string;
  engineCC?: number;
  condition?: string;
  location?: string;
  description?: string;
  images?: string[];
  videoUrl?: string;
}

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getVehicle(@Param('id') vehicleId: string) {
    return this.vehiclesService.getVehicle(vehicleId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @HttpCode(HttpStatus.CREATED)
  async createVehicle(
    @CurrentUserId() sellerId: string,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehiclesService.createVehicle(sellerId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @HttpCode(HttpStatus.OK)
  async updateVehicle(
    @Param('id') vehicleId: string,
    @CurrentUserId() sellerId: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.updateVehicle(vehicleId, sellerId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @HttpCode(HttpStatus.OK)
  async getSellerVehicles(@CurrentUserId() sellerId: string) {
    return this.vehiclesService.getSellerVehicles(sellerId);
  }

  @Post(':id/request-inspection')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @HttpCode(HttpStatus.OK)
  async requestInspection(
    @Param('id') vehicleId: string,
    @CurrentUserId() sellerId: string,
  ) {
    return this.vehiclesService.requestInspection(vehicleId, sellerId);
  }
}
