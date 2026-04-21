import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { InspectionsModule } from './inspections/inspections.module';
import { AuctionsModule } from './auctions/auctions.module';
import { BidsModule } from './bids/bids.module';
import { WalletModule } from './wallet/wallet.module';
import { PartsModule } from './parts/parts.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { HealthController } from './health/health.controller';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    VehiclesModule,
    InspectionsModule,
    AuctionsModule,
    BidsModule,
    WalletModule,
    PartsModule,
    CartModule,
    OrdersModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class AppModule {}
