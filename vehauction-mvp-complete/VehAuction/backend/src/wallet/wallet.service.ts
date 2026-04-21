import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    return await this.prisma.wallet.findUnique({
      where: { userId },
    });
  }

  async fundWallet(userId: string, amount: bigint, reference: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    const transaction = await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: 'WALLET_FUND',
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + amount,
        reference,
        status: 'COMPLETED',
      },
    });

    await this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: wallet.balance + amount,
        totalFunded: wallet.totalFunded + amount,
      },
    });

    return transaction;
  }

  async getBalance(userId: string): Promise<bigint> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    return wallet?.balance || 0n;
  }

  async getAvailableBalance(userId: string): Promise<bigint> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) return 0n;
    return wallet.balance - wallet.lockedBalance;
  }

  async lockBalance(userId: string, amount: bigint) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    const availableBalance = wallet.balance - wallet.lockedBalance;

    if (availableBalance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    return await this.prisma.wallet.update({
      where: { userId },
      data: {
        lockedBalance: wallet.lockedBalance + amount,
      },
    });
  }

  async unlockBalance(userId: string, amount: bigint) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    return await this.prisma.wallet.update({
      where: { userId },
      data: {
        lockedBalance: wallet.lockedBalance - amount,
      },
    });
  }

  async deductBalance(userId: string, amount: bigint, type: string, description?: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const transaction = await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: type as any,
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount,
        description,
        status: 'COMPLETED',
      },
    });

    await this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: wallet.balance - amount,
      },
    });

    return transaction;
  }

  async getTransactionHistory(userId: string, limit: number = 50) {
    return await this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
