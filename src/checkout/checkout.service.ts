import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsEntity } from '../products/products.entity';

import {
  CheckoutEntity,
} from './checkout.entity';
import { CreateCheckoutDto } from './dto/createCheckout.dto';
import { CheckoutStatus } from 'src/enums/checkoutStatus';



@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(ProductsEntity)
    private readonly productsRepository: Repository<ProductsEntity>,

    @InjectRepository(CheckoutEntity)
    private readonly checkoutRepository: Repository<CheckoutEntity>,
  ) { }

  async createCheckout(
    checkoutData: CreateCheckoutDto,
  ) {
    try {
      const { productId, quantity } = checkoutData;

      const randomFailure = Math.random();

      if (randomFailure < 0.1) {
        throw new ServiceUnavailableException(
          'Serviço temporariamente indisponível',
        );
      }

      const product = await this.productsRepository.findOne({
        where: { id: productId },
      });

      if (!product) throw new NotFoundException('Produto não encontrado');
      
      if (quantity <= 0) throw new BadRequestException('Quantidade deve ser maior que zero');
      
      if (product.quantity < quantity) throw new ConflictException('Estoque insuficiente');

      const totalPrice = Number(product.price) * quantity;

      const checkout =
        this.checkoutRepository.create({
          product,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          totalPrice,
          status: CheckoutStatus.APPROVED,
        });

      product.quantity -= quantity;

      await this.productsRepository.save(product);

      const savedCheckout =
        await this.checkoutRepository.save(
          checkout,
        );

      return {
        success: true, message: 'Compra realizada com sucesso', checkout: savedCheckout,
      };
    } 
    catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException ||
        err instanceof BadRequestException ||
        err instanceof ServiceUnavailableException
      ) {
        throw err;
      }

      throw new BadRequestException(
        `Erro ao processar checkout: ${err.message}`,
      );
    }
  }

  async getCheckoutHistory() {
    try {
      const checkouts =
        await this.checkoutRepository.find({
          order: { createdAt: 'DESC' },
        });

      return checkouts;
    } 
    catch (err: any) {
      throw new BadRequestException(
        `Erro ao buscar histórico: ${err.message}`,
      );
    }
  }

  async findCheckoutById(id: string) {
    try {
      const checkout =
        await this.checkoutRepository.findOne({ where: { id } });

      if (!checkout) throw new NotFoundException('Checkout não encontrado');

      return checkout;
    } 
    catch (err: any) {
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new BadRequestException(`Erro ao buscar checkout: ${err.message}`);
    }
  }

  async cancelCheckout(id: string) {
    try {
      const checkout =
        await this.findCheckoutById(id);

      if (checkout.status === CheckoutStatus.CANCELED) throw new ConflictException('Checkout já cancelado');
      
      const product =
        await this.productsRepository.findOne({
          where: { id: checkout.product.id },
        });

      if (product) {
        product.quantity += checkout.quantity;

        await this.productsRepository.save(
          product,
        );
      }

      checkout.status = CheckoutStatus.CANCELED;

      const updatedCheckout = await this.checkoutRepository.save(checkout);

      return {
        success: true, message: 'Checkout cancelado com sucesso', checkout: updatedCheckout,
      };
    } 
    catch (err: any) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }

      throw new BadRequestException(`Erro ao cancelar checkout: ${err.message}`);
    }
  }
}