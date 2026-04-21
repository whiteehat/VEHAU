import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Module({
  providers: [OrdersService, PrismaService, WalletService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
