import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUserId } from '../auth/decorators/auth.decorators';

class AddToCartDto {
  partId: string;
  quantity: number;
}

class UpdateQuantityDto {
  quantity: number;
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCart(@CurrentUserId() userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  async addToCart(
    @CurrentUserId() userId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, dto.partId, dto.quantity);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  async removeFromCart(
    @CurrentUserId() userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeFromCart(userId, itemId);
  }

  @Patch('items/:itemId/quantity')
  @HttpCode(HttpStatus.OK)
  async updateQuantity(
    @CurrentUserId() userId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateQuantityDto,
  ) {
    return this.cartService.updateCartItemQuantity(
      userId,
      itemId,
      dto.quantity,
    );
  }

  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  async clearCart(@CurrentUserId() userId: string) {
    return this.cartService.clearCart(userId);
  }

  @Get('total')
  @HttpCode(HttpStatus.OK)
  async getTotal(@CurrentUserId() userId: string) {
    const total = await this.cartService.getCartTotal(userId);
    return { total };
  }
}
