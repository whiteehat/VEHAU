import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Module({
  providers: [VehiclesService, PrismaService, WalletService],
  controllers: [VehiclesController],
  exports: [VehiclesService],
})
export class VehiclesModule {}
