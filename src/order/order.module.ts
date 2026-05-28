import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';

import { ProductsEntity } from '../products/products.entity';
import { OrderEntity } from './order.entity';
import { OrderItemEntity } from './orderItem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductsEntity,
      OrderEntity,
      OrderItemEntity,
    ]),
  ],

  controllers: [OrderController],

  providers: [OrderService],
})
export class OrderModule { }