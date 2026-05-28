import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import { ProductsService } from './products.service';

import { CreateProductsDto } from './dto/CreateProducts.dto';
import { UpdateProductsDto } from './dto/UpdateProducts.dto';
import { CacheInterceptor } from '@nestjs/cache-manager/dist/interceptors/cache.interceptor';
import { CacheKey } from '@nestjs/cache-manager/dist/decorators/cache-key.decorator';
import { CacheTTL } from '@nestjs/cache-manager/dist/decorators/cache-ttl.decorator';

@Controller('products')
@UseInterceptors(CacheInterceptor)
export class ProductsController {
  @Inject()
  private readonly productsService: ProductsService;

  @Post()
  async createProduct(@Body() productData: CreateProductsDto) {
    return this.productsService.createProduct(productData);
  }

  @Get()
  @CacheKey('all_products')
  @CacheTTL(600)
  async getProducts() {
    return this.productsService.getProducts();
  }

  @Get(':id')
  @CacheKey('product_:id')
  @CacheTTL(600)
  async getProductById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Patch(':id')
  async updateProduct(@Param('id') id: string, @Body() newData: UpdateProductsDto) {
    return this.productsService.updateProduct(
      id,
      newData,
    );
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}