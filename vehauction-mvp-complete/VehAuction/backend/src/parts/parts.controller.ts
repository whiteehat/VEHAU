import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PartsService } from './parts.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUserId } from '../auth/decorators/auth.decorators';

class CreatePartDto {
  name: string;
  category: string;
  condition: string;
  brand: string;
  description?: string;
  price: number;
  quantity: number;
  compatibilities?: any[];
  deliveryOptions?: string[];
  vendorLocation: string;
  photos?: string[];
}

class UpdatePartDto {
  name?: string;
  condition?: string;
  brand?: string;
  description?: string;
  price?: number;
  quantity?: number;
  deliveryOptions?: string[];
  vendorLocation?: string;
  photos?: string[];
}

@Controller('parts')
export class PartsController {
  constructor(private partsService: PartsService) {}

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  async getCategories() {
    return this.partsService.getPartCategories();
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchParts(
    @Query('make') make?: string,
    @Query('model') model?: string,
    @Query('year') year?: number,
    @Query('category') category?: string,
    @Query('condition') condition?: string,
    @Query('location') location?: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ) {
    return this.partsService.searchParts(
      { make, model, year, category, condition, location },
      skip,
      take,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getParts(@Query('skip') skip: number = 0, @Query('take') take: number = 20) {
    // Return active parts with pagination
    return this.partsService.searchParts({}, skip, take);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPart(@Param('id') partId: string) {
    return this.partsService.getPart(partId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR')
  @HttpCode(HttpStatus.CREATED)
  async createPart(
    @CurrentUserId() vendorId: string,
    @Body() dto: CreatePartDto,
  ) {
    return this.partsService.createPart(vendorId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR')
  @HttpCode(HttpStatus.OK)
  async updatePart(
    @Param('id') partId: string,
    @CurrentUserId() vendorId: string,
    @Body() dto: UpdatePartDto,
  ) {
    return this.partsService.updatePart(partId, vendorId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDOR')
  @HttpCode(HttpStatus.OK)
  async deletePart(
    @Param('id') partId: string,
    @CurrentUserId() vendorId: string,
  ) {
    return this.partsService.deletePart(partId, vendorId);
  }

  @Get('vendor/:vendorId')
  @HttpCode(HttpStatus.OK)
  async getVendorParts(
    @Param('vendorId') vendorId: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ) {
    return this.partsService.getVendorParts(vendorId, skip, take);
  }
}
