import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductsEntity } from '../products/products.entity';
import { OrderEntity } from './order.entity';
import { CheckoutStatus } from 'src/enums/checkoutStatus';
import { OrderItemEntity } from './orderItem.entity';
import { CreateOrderDto } from './dto/createOrder.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(ProductsEntity)
    private readonly productsRepository: Repository<ProductsEntity>,

    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,

    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) { }

  async createOrder(data: CreateOrderDto) {
    try {
      const { items, customerName, street, city, zipCode } = data;

      if (!items || items.length === 0) {
        throw new BadRequestException('Carrinho vazio');
      }

      const order = this.orderRepository.create({
        customerName,
        street,
        city,
        zipCode,
        status: CheckoutStatus.PENDING,
        totalPrice: 0,
      });

      const savedOrder = await this.orderRepository.save(order);

      let totalPrice = 0;

      for (const item of items) {
        const product = await this.productsRepository.findOne({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Produto ${item.productId} não encontrado`,
          );
        }

        if (item.quantity <= 0) {
          throw new BadRequestException('Quantidade inválida');
        }

        if (product.quantity < item.quantity) {
          throw new ConflictException(
            `Estoque insuficiente para o produto ${product.name}`,
          );
        }

        const itemTotal = Number(product.price) * item.quantity;
        totalPrice += itemTotal;

        product.quantity -= item.quantity;
        await this.productsRepository.save(product);

        const orderItem = this.orderItemRepository.create({
          order: savedOrder,
          product,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal,
        });

        await this.orderItemRepository.save(orderItem);
      }

      savedOrder.totalPrice = totalPrice;
      savedOrder.status = CheckoutStatus.APPROVED;

      const finalOrder = await this.orderRepository.save(savedOrder);

      return {
        success: true,
        message: 'Pedido realizado com sucesso',
        order: finalOrder,
      };
    } 
    catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }

      throw new BadRequestException(
        `Erro ao processar pedido: ${err.message}`,
      );
    }
  }

  async getOrders() {
    try {
      return await this.orderRepository.find({
        relations: { items: true },
        order: { createdAt: 'DESC' },
      });
    } 
    catch (err: any) {
      throw new BadRequestException(
        `Erro ao buscar pedidos: ${err.message}`,
      );
    }
  }

  async findOrderById(id: string) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: {
          items: {
            product: true,
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Pedido não encontrado');
      }

      return order;
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;

      throw new BadRequestException(
        `Erro ao buscar pedido: ${err.message}`,
      );
    }
  }

  async cancelOrder(id: string) {
    try {
      const order = await this.findOrderById(id);

      if (order.status === CheckoutStatus.CANCELED) {
        throw new ConflictException('Pedido já cancelado');
      }

      for (const item of order.items) {
        const product = await this.productsRepository.findOne({
          where: { id: item.product.id },
        });

        if (product) {
          product.quantity += item.quantity;
          await this.productsRepository.save(product);
        }
      }

      order.status = CheckoutStatus.CANCELED;

      const updatedOrder = await this.orderRepository.save(order);

      return {
        success: true,
        message: 'Pedido cancelado com sucesso',
        order: updatedOrder,
      };
    } catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }

      throw new BadRequestException(
        `Erro ao cancelar pedido: ${err.message}`,
      );
    }
  }
}
