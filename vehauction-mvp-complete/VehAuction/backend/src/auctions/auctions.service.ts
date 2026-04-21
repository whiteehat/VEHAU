import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AuctionService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async createAuction(vehicleId: string, data: any) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.status !== 'READY_FOR_AUCTION') {
      throw new BadRequestException('Vehicle is not ready for auction');
    }

    const auction = await this.prisma.auction.create({
      data: {
        vehicleId,
        title: data.title,
        description: data.description,
        startPrice: BigInt(data.startPrice),
        reservePrice: BigInt(data.reservePrice),
        minimumIncrement: BigInt(data.minimumIncrement),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: 'SCHEDULED',
      },
    });

    await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'AUCTION_ACTIVE' },
    });

    return auction;
  }

  async getAuction(auctionId: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        vehicle: true,
        bids: {
          orderBy: { createdAt: 'desc' },
          include: {
            bidder: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    // Don't reveal reserve price to non-winners
    return {
      ...auction,
      reservePrice: undefined, // Hide from clients initially
    };
  }

  async getActiveAuctions(skip: number = 0, take: number = 20) {
    const now = new Date();

    const auctions = await this.prisma.auction.findMany({
      where: {
        status: 'SCHEDULED',
        endTime: {
          gt: now,
        },
      },
      skip,
      take,
      include: {
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
            images: true,
            condition: true,
          },
        },
        bids: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        endTime: 'asc',
      },
    });

    return auctions.map((auction) => ({
      ...auction,
      reservePrice: undefined,
      currentHighestBid: auction.bids.length
        ? Math.max(...auction.bids.map((b) => Number(b.amount)))
        : Number(auction.startPrice),
      bidsCount: auction.bids.length,
    }));
  }

  async getBids(auctionId: string) {
    const bids = await this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { createdAt: 'desc' },
      include: {
        bidder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return bids;
  }

  async validateAndPlaceBid(auctionId: string, bidderId: string, amount: bigint) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const now = new Date();
    if (now < auction.startTime || now > auction.endTime) {
      throw new BadRequestException('Auction is not active');
    }

    // Check minimum bid requirement (₦100,000)
    const minimumWallet = BigInt(10000000); // ₦100,000
    const balance = await this.walletService.getBalance(bidderId);

    if (balance < minimumWallet) {
      throw new BadRequestException(
        'Minimum wallet balance of ₦100,000 required to bid',
      );
    }

    // Validate bid amount
    let minimumBidAmount = auction.startPrice;

    if (auction.currentHighestBid > 0n) {
      minimumBidAmount = auction.currentHighestBid + auction.minimumIncrement;
    }

    if (amount < minimumBidAmount) {
      throw new BadRequestException(
        `Minimum bid amount is ₦${(minimumBidAmount / 100n).toString()}`,
      );
    }

    // Check if user already has an active bid
    const existingBid = await this.prisma.bid.findUnique({
      where: {
        auctionId_bidderId: {
          auctionId,
          bidderId,
        },
      },
    });

    if (existingBid && existingBid.status === 'ACTIVE') {
      // Update existing bid
      return await this.updateBid(existingBid.id, amount, auction, bidderId);
    }

    // Lock balance
    await this.walletService.lockBalance(bidderId, amount);

    // Create new bid
    const bid = await this.prisma.bid.create({
      data: {
        auctionId,
        bidderId,
        amount,
        status: 'ACTIVE',
        walletLocked: amount,
      },
    });

    // Update auction highest bid
    await this.prisma.auction.update({
      where: { id: auctionId },
      data: {
        currentHighestBid: amount,
      },
    });

    // Outbid previous bidder if exists
    if (existingBid) {
      await this.prisma.bid.update({
        where: { id: existingBid.id },
        data: { status: 'OUTBID' },
      });

      // Unlock previous bid amount
      await this.walletService.unlockBalance(
        existingBid.bidderId,
        existingBid.amount,
      );
    }

    return bid;
  }

  private async updateBid(bidId: string, newAmount: bigint, auction: any, bidderId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
    });

    const difference = newAmount - bid.amount;

    if (difference > 0n) {
      await this.walletService.lockBalance(bidderId, difference);
    } else {
      await this.walletService.unlockBalance(bidderId, -difference);
    }

    await this.prisma.auction.update({
      where: { id: auction.id },
      data: {
        currentHighestBid: newAmount,
      },
    });

    return await this.prisma.bid.update({
      where: { id: bidId },
      data: {
        amount: newAmount,
        walletLocked: newAmount,
      },
    });
  }

  @Cron('*/30 * * * * *') // Run every 30 seconds
  async endExpiredAuctions() {
    const now = new Date();

    const expiredAuctions = await this.prisma.auction.findMany({
      where: {
        status: 'SCHEDULED',
        endTime: {
          lte: now,
        },
      },
      include: {
        bids: {
          orderBy: {
            amount: 'desc',
          },
          take: 1,
        },
      },
    });

    for (const auction of expiredAuctions) {
      await this.finalizeAuction(auction.id);
    }
  }

  async finalizeAuction(auctionId: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
        },
      },
    });

    if (!auction || auction.status !== 'SCHEDULED') {
      return;
    }

    const highestBid = auction.bids[0];

    // Check if reserve price met
    if (highestBid && highestBid.amount >= auction.reservePrice) {
      // Winner declared
      await this.prisma.auction.update({
        where: { id: auctionId },
        data: {
          status: 'ENDED',
          winnerId: highestBid.bidderId,
          winningBid: highestBid.amount,
          paymentDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
        },
      });

      await this.prisma.bid.update({
        where: { id: highestBid.id },
        data: {
          status: 'WINNER',
        },
      });

      // Unlock other bids
      for (const bid of auction.bids.slice(1)) {
        await this.walletService.unlockBalance(bid.bidderId, bid.amount);
        await this.prisma.bid.update({
          where: { id: bid.id },
          data: { status: 'OUTBID' },
        });
      }
    } else {
      // No winner - reserve not met
      await this.prisma.auction.update({
        where: { id: auctionId },
        data: {
          status: 'ENDED',
        },
      });

      // Unlock all bids
      for (const bid of auction.bids) {
        await this.walletService.unlockBalance(bid.bidderId, bid.amount);
        await this.prisma.bid.update({
          where: { id: bid.id },
          data: { status: 'FORFEIT' },
        });
      }
    }
  }

  @Cron('*/60 * * * * *') // Run every 60 seconds
  async enforcePaymentDeadlines() {
    const now = new Date();

    const auctionsWithExpiredDeadline = await this.prisma.auction.findMany({
      where: {
        paymentDeadline: {
          lt: now,
        },
        paymentCompleted: false,
        status: 'ENDED',
        winnerId: {
          not: null,
        },
      },
    });

    for (const auction of auctionsWithExpiredDeadline) {
      // Unlock winner's balance
      if (auction.winnerId) {
        await this.walletService.unlockBalance(
          auction.winnerId,
          auction.winningBid,
        );
      }

      // Mark as cancelled
      await this.prisma.auction.update({
        where: { id: auction.id },
        data: {
          status: 'CANCELLED',
        },
      });
    }
  }

  async completePayment(auctionId: string, bidderId: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.winnerId !== bidderId) {
      throw new BadRequestException('Only auction winner can complete payment');
    }

    if (auction.paymentCompleted) {
      throw new BadRequestException('Payment already completed');
    }

    // Deduct commission (₦100,000 documentation fee)
    const commissionFee = BigInt(10000000); // ₦100,000
    await this.walletService.deductBalance(
      bidderId,
      commissionFee,
      'AUCTION_COMMISSION',
      'Auction commission fee',
    );

    // Unlock and deduct winning bid amount
    await this.walletService.unlockBalance(bidderId, auction.winningBid);

    await this.prisma.auction.update({
      where: { id: auctionId },
      data: {
        paymentCompleted: true,
      },
    });

    return { success: true, message: 'Payment completed successfully' };
  }
}
