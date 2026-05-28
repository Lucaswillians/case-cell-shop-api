import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsEntity } from './products.entity';
import { CreateProductsDto } from './dto/CreateProducts.dto';
import { GetProductsDto } from './dto/GetProducts.dto';
import { UpdateProductsDto } from './dto/UpdateProducts.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductsEntity)
    private readonly productsRepository: Repository<ProductsEntity>,
  ) { }

  async createProduct(productData: CreateProductsDto) {
    try {
      const product = this.productsRepository.create(productData);
      const savedProduct = await this.productsRepository.save(product);

      return savedProduct;
    } 
    catch (err: any) {
      throw new BadRequestException(
        `Erro ao criar produto: ${err.message}`,
      );
    }
  }

  async getProducts() {
    try {
      const products = await this.productsRepository.find();

      return products.map(
        (product) =>
          new GetProductsDto(
            product.id,
            product.name,
            product.description,
            product.quantity,
            product.price,
          ),
      );
    } 
    catch (err: any) {
      throw new BadRequestException(
        `Erro ao buscar produtos: ${err.message}`,
      );
    }
  }

  async findById(id: string): Promise<ProductsEntity> {
    try {
      const product = await this.productsRepository.findOne({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException('Produto não encontrado');
      }

      return product;
    } 
    catch (err: any) {
      if (err instanceof NotFoundException) throw err;

      throw new BadRequestException(
        `Erro ao buscar produto: ${err.message}`,
      );
    }
  }

  async updateProduct(
    id: string,
    newData: UpdateProductsDto,
  ) {
    try {
      await this.findById(id);
      await this.productsRepository.update(id, newData);

      const updatedProduct = await this.findById(id);

      return updatedProduct;
    } 
    catch (err: any) {
      if (err instanceof NotFoundException) throw err;

      throw new BadRequestException(
        `Erro ao atualizar produto: ${err.message}`,
      );
    }
  }

  async deleteProduct(id: string) {
    try {
      await this.findById(id);
      await this.productsRepository.delete(id);

      return {
        message: 'Produto deletado com sucesso',
      };
    } 
    catch (err: any) {
      if (err instanceof NotFoundException) throw err;

      throw new BadRequestException(
        `Erro ao deletar produto: ${err.message}`,
      );
    }
  }
}