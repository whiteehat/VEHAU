import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async createOrder(buyerId: string, data: any) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: buyerId },
      include: { items: { include: { part: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate total
    let totalAmount = BigInt(0);
    const orderItems = [];

    for (const item of cart.items) {
      const itemTotal = item.part.price * BigInt(item.quantity);
      totalAmount += itemTotal;

      orderItems.push({
        partId: item.part.id,
        vendorId: item.part.vendorId,
        quantity: item.quantity,
        pricePerUnit: item.part.price,
        totalPrice: itemTotal,
      });
    }

    // Check wallet balance
    const balance = await this.walletService.getBalance(buyerId);
    if (balance < totalAmount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        buyerId,
        totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: orderItems,
        },
      },
    });

    // Deduct from wallet
    await this.walletService.deductBalance(
      buyerId,
      totalAmount,
      'PARTS_PURCHASE',
      `Parts order ${orderNumber}`,
    );

    // Clear cart
    await this.prisma.cartItem.deleteMany({
      where: { userId: buyerId },
    });

    // Update payment status
    await this.prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'COMPLETED', paidAt: new Date() },
    });

    return order;
  }

  async getOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { part: true } },
        buyer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user is buyer or vendor
    if (order.buyerId !== userId) {
      const isVendor = order.items.some((item) => item.vendorId === userId);
      if (!isVendor) {
        throw new ForbiddenException('You do not have access to this order');
      }
    }

    return order;
  }

  async getOrdersByBuyer(buyerId: string, skip: number = 0, take: number = 20) {
    return await this.prisma.order.findMany({
      where: { buyerId },
      skip,
      take,
      include: { items: { include: { part: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrdersByVendor(vendorId: string, skip: number = 0, take: number = 20) {
    return await this.prisma.order.findMany({
      where: { items: { some: { vendorId } } },
      skip,
      take,
      include: {
        items: { where: { vendorId }, include: { part: true } },
        buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderItemStatus(
    orderItemId: string,
    vendorId: string,
    status: string,
  ) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: orderItemId },
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    if (orderItem.vendorId !== vendorId) {
      throw new ForbiddenException(
        'You can only update items from your parts',
      );
    }

    const updated = await this.prisma.orderItem.update({
      where: { id: orderItemId },
      data: { vendorStatus: status },
    });

    // Check if all items are delivered
    const order = await this.prisma.order.findUnique({
      where: { id: orderItem.orderId },
      include: { items: true },
    });

    const allDelivered = order.items.every((item) => item.vendorStatus === 'DELIVERED');
    if (allDelivered) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'DELIVERED', deliveredAt: new Date() },
      });
    }

    return updated;
  }

  async requestReturn(
    orderId: string,
    orderItemId: string,
    buyerId: string,
    reason: string,
    description?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.buyerId !== buyerId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    const returnRequest = await this.prisma.returnRequest.create({
      data: {
        orderId,
        orderItemId,
        buyerId,
        reason,
        description,
        status: 'PENDING',
      },
    });

    return returnRequest;
  }

  async approveReturn(returnId: string, adminId: string) {
    const returnRequest = await this.prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { order: { include: { items: true } } },
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    const orderItem = returnRequest.order.items.find(
      (item) => item.id === returnRequest.orderItemId,
    );

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    // Refund buyer
    await this.walletService.fundWallet(
      returnRequest.buyerId,
      orderItem.totalPrice,
      `return-${returnId}`,
    );

    await this.prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        status: 'REFUNDED',
        refundAmount: orderItem.totalPrice,
        refundedAt: new Date(),
      },
    });

    return returnRequest;
  }
}
