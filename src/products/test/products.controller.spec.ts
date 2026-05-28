import { ProductsController } from '../products.controller';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('ProductsController', () => {
  let controller: ProductsController;

  const productsService = {
    createProduct: jest.fn<(productData: unknown) => Promise<unknown>>(),
    getProducts: jest.fn<() => Promise<unknown>>(),
    findById: jest.fn<(id: string) => Promise<unknown>>(),
    updateProduct:
      jest.fn<(id: string, newData: unknown) => Promise<unknown>>(),
    deleteProduct: jest.fn<(id: string) => Promise<unknown>>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new ProductsController();
    Object.defineProperty(controller, 'productsService', {
      value: productsService,
    });
  });

  it('should create a product', async () => {
    const dto = {
      name: 'Capinha',
      description: 'Capinha transparente',
      quantity: 10,
      price: 29.9,
    };
    const product = { id: 'product-1', ...dto };
    productsService.createProduct.mockResolvedValue(product);

    await expect(controller.createProduct(dto)).resolves.toEqual(product);
    expect(productsService.createProduct).toHaveBeenCalledWith(dto);
  });

  it('should list products', async () => {
    const products = [{ id: 'product-1', name: 'Película' }];
    productsService.getProducts.mockResolvedValue(products);

    await expect(controller.getProducts()).resolves.toEqual(products);
    expect(productsService.getProducts).toHaveBeenCalledTimes(1);
  });

  it('should get a product by id', async () => {
    const product = { id: 'product-1', name: 'Carregador' };
    productsService.findById.mockResolvedValue(product);

    await expect(controller.getProductById('product-1')).resolves.toEqual(
      product,
    );
    expect(productsService.findById).toHaveBeenCalledWith('product-1');
  });

  it('should update a product', async () => {
    const dto = {
      name: 'Cabo USB-C',
      description: 'Cabo reforçado',
      quantity: 5,
      price: 39.9,
    };
    const product = { id: 'product-1', ...dto };
    productsService.updateProduct.mockResolvedValue(product);

    await expect(controller.updateProduct('product-1', dto)).resolves.toEqual(
      product,
    );
    expect(productsService.updateProduct).toHaveBeenCalledWith(
      'product-1',
      dto,
    );
  });

  it('should delete a product', async () => {
    const response = { message: 'Produto deletado com sucesso' };
    productsService.deleteProduct.mockResolvedValue(response);

    await expect(controller.deleteProduct('product-1')).resolves.toEqual(
      response,
    );
    expect(productsService.deleteProduct).toHaveBeenCalledWith('product-1');
  });
});
