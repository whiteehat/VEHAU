import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuctionService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { AuctionGateway } from './auctions.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [AuctionService, PrismaService, WalletService, AuctionGateway],
  controllers: [AuctionsController],
  exports: [AuctionService],
})
export class AuctionsModule {}
