import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuctionService } from './auctions.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUserId } from '../auth/decorators/auth.decorators';

class CreateAuctionDto {
  vehicleId: string;
  title: string;
  description?: string;
  startPrice: number;
  reservePrice: number;
  minimumIncrement: number;
  startTime: string;
  endTime: string;
}

class PlaceBidDto {
  amount: number;
}

@Controller('auctions')
export class AuctionsController {
  constructor(private auctionService: AuctionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAuctions(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ) {
    return this.auctionService.getActiveAuctions(skip, take);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getAuction(@Param('id') auctionId: string) {
    return this.auctionService.getAuction(auctionId);
  }

  @Get(':id/bids')
  @HttpCode(HttpStatus.OK)
  async getBids(@Param('id') auctionId: string) {
    return this.auctionService.getBids(auctionId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createAuction(@Body() dto: CreateAuctionDto) {
    return this.auctionService.createAuction(dto.vehicleId, dto);
  }

  @Post(':id/payment-complete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async completePayment(
    @Param('id') auctionId: string,
    @CurrentUserId() bidderId: string,
  ) {
    return this.auctionService.completePayment(auctionId, bidderId);
  }
}
