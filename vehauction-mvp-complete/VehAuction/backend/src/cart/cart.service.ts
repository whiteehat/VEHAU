import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { part: true } } },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    return {
      ...cart,
      items: cart.items.map((item) => ({
        ...item,
        part: {
          ...item.part,
          price: item.part.price.toString(),
        },
        priceAtAddTime: item.priceAtAddTime.toString(),
      })),
    };
  }

  async addToCart(userId: string, partId: string, quantity: number) {
    const part = await this.prisma.part.findUnique({
      where: { id: partId },
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    if (!part.isActive) {
      throw new BadRequestException('This part is no longer available');
    }

    if (quantity > part.quantity) {
      throw new BadRequestException(
        `Only ${part.quantity} units available in stock`,
      );
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_partId_userId: {
          cartId: cart.id,
          partId,
          userId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      return await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { part: true },
      });
    }

    return await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        partId,
        userId,
        quantity,
        priceAtAddTime: part.price,
      },
      include: { part: true },
    });
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item || item.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return { message: 'Item removed from cart' };
  }

  async updateCartItemQuantity(
    userId: string,
    cartItemId: string,
    quantity: number,
  ) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item || item.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    const part = await this.prisma.part.findUnique({
      where: { id: item.partId },
    });

    if (quantity > part.quantity) {
      throw new BadRequestException(
        `Only ${part.quantity} units available in stock`,
      );
    }

    return await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { part: true },
    });
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });

    return { message: 'Cart cleared' };
  }

  async getCartTotal(userId: string): Promise<string> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { part: true } } },
    });

    if (!cart) {
      return '0';
    }

    let total = BigInt(0);
    for (const item of cart.items) {
      total += item.part.price * BigInt(item.quantity);
    }

    return total.toString();
  }
}
