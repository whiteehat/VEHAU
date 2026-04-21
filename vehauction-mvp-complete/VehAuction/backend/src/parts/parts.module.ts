import { Module } from '@nestjs/common';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PartsService, PrismaService],
  controllers: [PartsController],
  exports: [PartsService],
})
export class PartsModule {}
