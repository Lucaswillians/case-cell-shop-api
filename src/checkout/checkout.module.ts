import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { ProductsEntity } from '../products/products.entity';
import { CheckoutEntity } from './checkout.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductsEntity, CheckoutEntity]),
  ],

  controllers: [CheckoutController],

  providers: [CheckoutService],
})
export class CheckoutModule { }