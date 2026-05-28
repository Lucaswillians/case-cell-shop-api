import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ProductsService } from './products.service';

import { CreateProductsDto } from './dto/CreateProducts.dto';
import { UpdateProductsDto } from './dto/UpdateProducts.dto';

@Controller('products')
export class ProductsController {
    @Inject()
    private readonly productsService: ProductsService;

  @Post()
  async createProduct(@Body() productData: CreateProductsDto) {
    return this.productsService.createProduct(productData);
  }

  @Get()
  async getProducts() {
    return this.productsService.getProducts();
  }

  @Get(':id')
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