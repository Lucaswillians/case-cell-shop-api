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
} from '@nestjs/common';

import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/createCheckout.dto';

@Controller('checkout')
export class CheckoutController {
  @Inject()
  private readonly checkoutService: CheckoutService;

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCheckout(@Body() checkoutData: CreateCheckoutDto) {
    return this.checkoutService.createCheckout(
      checkoutData,
    );
  }

  @Get()
  async getCheckoutHistory() {
    return this.checkoutService.getCheckoutHistory();
  }

  @Get(':id')
  async getCheckoutById(@Param('id') id: string) {
    return this.checkoutService.findCheckoutById(
      id,
    );
  }

  @Patch(':id/cancel')
  async cancelCheckout(@Param('id') id: string) {
    return this.checkoutService.cancelCheckout(
      id,
    );
  }
}