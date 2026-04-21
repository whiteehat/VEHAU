import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUserId } from '../auth/decorators/auth.decorators';

class CreateOrderDto {
  deliveryAddress?: string;
  deliveryPhone?: string;
}

class UpdateOrderItemStatusDto {
  status: string;
}

class RequestReturnDto {
  orderItemId: string;
  reason: string;
  description?: string;
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @CurrentUserId() buyerId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(buyerId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getOrders(
    @CurrentUserId() userId: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ) {
    return this.ordersService.getOrdersByBuyer(userId, skip, take);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOrder(@Param('id') orderId: string, @CurrentUserId() userId: string) {
    return this.ordersService.getOrder(orderId, userId);
  }

  @Get('vendor/orders')
  @UseGuards(RolesGuard)
  @Roles('VENDOR')
  @HttpCode(HttpStatus.OK)
  async getVendorOrders(
    @CurrentUserId() vendorId: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ) {
    return this.ordersService.getOrdersByVendor(vendorId, skip, take);
  }

  @Patch(':orderId/items/:itemId/status')
  @UseGuards(RolesGuard)
  @Roles('VENDOR')
  @HttpCode(HttpStatus.OK)
  async updateOrderItemStatus(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @CurrentUserId() vendorId: string,
    @Body() dto: UpdateOrderItemStatusDto,
  ) {
    return this.ordersService.updateOrderItemStatus(itemId, vendorId, dto.status);
  }

  @Post(':id/return')
  @HttpCode(HttpStatus.CREATED)
  async requestReturn(
    @Param('id') orderId: string,
    @CurrentUserId() buyerId: string,
    @Body() dto: RequestReturnDto,
  ) {
    return this.ordersService.requestReturn(
      orderId,
      dto.orderItemId,
      buyerId,
      dto.reason,
      dto.description,
    );
  }

  @Patch('return/:returnId/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async approveReturn(
    @Param('returnId') returnId: string,
    @CurrentUserId() adminId: string,
  ) {
    return this.ordersService.approveReturn(returnId, adminId);
  }
}
