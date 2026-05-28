import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { GetProductsDto } from '../dto/GetProducts.dto';
import { ProductsEntity } from '../products.entity';
import { ProductsService } from '../products.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('ProductsService', () => {
  let service: ProductsService;

  const productsRepository = {
    create: jest.fn<(productData: unknown) => ProductsEntity>(),
    save: jest.fn<(product: ProductsEntity) => Promise<ProductsEntity>>(),
    find: jest.fn<() => Promise<ProductsEntity[]>>(),
    findOne: jest.fn<(options: unknown) => Promise<ProductsEntity | null>>(),
    update:
      jest.fn<
        (id: string, newData: unknown) => Promise<{ affected: number }>
      >(),
    delete: jest.fn<(id: string) => Promise<{ affected: number }>>(),
  };

  const product = {
    id: 'product-1',
    name: 'Capinha',
    description: 'Capinha transparente',
    quantity: 10,
    price: 29.9,
  } as ProductsEntity;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(ProductsEntity),
          useValue: productsRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should create a product', async () => {
    productsRepository.create.mockReturnValue(product);
    productsRepository.save.mockResolvedValue(product);

    await expect(service.createProduct(product)).resolves.toEqual(product);
    expect(productsRepository.create).toHaveBeenCalledWith(product);
    expect(productsRepository.save).toHaveBeenCalledWith(product);
  });

  it('should wrap repository errors when creating a product', async () => {
    productsRepository.create.mockImplementation(() => {
      throw new Error('database error');
    });

    await expect(service.createProduct(product)).rejects.toThrow(
      new BadRequestException('Erro ao criar produto: database error'),
    );
  });

  it('should list products as GetProductsDto instances', async () => {
    productsRepository.find.mockResolvedValue([product]);

    await expect(service.getProducts()).resolves.toEqual([
      new GetProductsDto(
        product.id,
        product.name,
        product.description,
        product.quantity,
        product.price,
      ),
    ]);
    expect(productsRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should find a product by id', async () => {
    productsRepository.findOne.mockResolvedValue(product);

    await expect(service.findById('product-1')).resolves.toEqual(product);
    expect(productsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'product-1' },
    });
  });

  it('should throw NotFoundException when product does not exist', async () => {
    productsRepository.findOne.mockResolvedValue(null);

    await expect(service.findById('missing-id')).rejects.toThrow(
      new NotFoundException('Produto não encontrado'),
    );
  });

  it('should update a product after validating it exists', async () => {
    const newData = {
      name: 'Capinha preta',
      description: 'Capinha fosca',
      quantity: 7,
      price: 34.9,
    };
    const updatedProduct = { ...product, ...newData };
    productsRepository.findOne
      .mockResolvedValueOnce(product)
      .mockResolvedValueOnce(updatedProduct);
    productsRepository.update.mockResolvedValue({ affected: 1 });

    await expect(service.updateProduct('product-1', newData)).resolves.toEqual(
      updatedProduct,
    );
    expect(productsRepository.update).toHaveBeenCalledWith(
      'product-1',
      newData,
    );
  });

  it('should delete a product after validating it exists', async () => {
    productsRepository.findOne.mockResolvedValue(product);
    productsRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.deleteProduct('product-1')).resolves.toEqual({
      message: 'Produto deletado com sucesso',
    });
    expect(productsRepository.delete).toHaveBeenCalledWith('product-1');
  });
});
