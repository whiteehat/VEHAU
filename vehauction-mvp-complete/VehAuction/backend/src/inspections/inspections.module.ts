import { Module } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { InspectionsController } from './inspections.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [InspectionsService, PrismaService],
  controllers: [InspectionsController],
  exports: [InspectionsService],
})
export class InspectionsModule {}
