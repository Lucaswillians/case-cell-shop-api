import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';

import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/createOrder.dto';

@Controller('orders')
@UseGuards(ThrottlerGuard)
@UseInterceptors(CacheInterceptor)
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async createOrder(@Body() data: CreateOrderDto) {
    return this.orderService.createOrder(data);
  }

  @Get()
  @CacheKey('orders_history')
  @CacheTTL(300)
  @Throttle({ long: { limit: 30, ttl: 60000 } })
  async getOrders() {
    return this.orderService.getOrders();
  }

  @Get(':id')
  @CacheTTL(300)
  async getOrderById(@Param('id') id: string) {
    return this.orderService.findOrderById(id);
  }

  @Patch(':id/cancel')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async cancelOrder(@Param('id') id: string) {
    return this.orderService.cancelOrder(id);
  }
}