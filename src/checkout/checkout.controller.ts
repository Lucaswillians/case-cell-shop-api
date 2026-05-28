import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/createCheckout.dto';
import {
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';

@Controller('checkout')
@UseInterceptors(CacheInterceptor)
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async createCheckout( @Body() checkoutData: CreateCheckoutDto) {
    return this.checkoutService.createCheckout(
      checkoutData,
    );
  }

  @Get()
  @CacheKey('checkout_history')
  @CacheTTL(300)
  @Throttle({ long: { limit: 2, ttl: 60000 } })
  async getCheckoutHistory() {
    return this.checkoutService.getCheckoutHistory();
  }

  @Get(':id')
  @CacheTTL(300)
  @Throttle({ long: { limit: 30, ttl: 60000 } })
  async getCheckoutById(@Param('id') id: string) {
    return this.checkoutService.findCheckoutById(id);
  }

  @Patch(':id/cancel')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async cancelCheckout(@Param('id') id: string) {
    return this.checkoutService.cancelCheckout(id);
  }
}