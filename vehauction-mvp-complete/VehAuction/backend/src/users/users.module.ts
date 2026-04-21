import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

class UsersService {
  constructor(private prisma: PrismaService) {}
}

@Module({
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
