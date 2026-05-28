import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { CheckoutStatus } from '../../enums/checkoutStatus';
import { ProductsEntity } from '../../products/products.entity';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { OrderEntity } from '../order.entity';
import { OrderItemEntity } from '../orderItem.entity';
import { OrderService } from '../order.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('OrderService', () => {
  let service: OrderService;

  const productsRepository = {
    findOne: jest.fn<(options: unknown) => Promise<ProductsEntity | null>>(),
    save: jest.fn<(product: ProductsEntity) => Promise<ProductsEntity>>(),
  };
  const orderRepository = {
    create: jest.fn<(data: unknown) => OrderEntity>(),
    save: jest.fn<(order: OrderEntity) => Promise<OrderEntity>>(),
    find: jest.fn<(options: unknown) => Promise<OrderEntity[]>>(),
    findOne: jest.fn<(options: unknown) => Promise<OrderEntity | null>>(),
  };
  const orderItemRepository = {
    create: jest.fn<(data: OrderItemEntity) => OrderItemEntity>(),
    save: jest.fn<
      (orderItem: OrderItemEntity) => Promise<OrderItemEntity>
    >(),
  };
  const product = {
    id: 'product-1',
    name: 'Capinha',
    description: 'Capinha transparente',
    quantity: 10,
    price: 25,
  } as ProductsEntity;

  const createOrderDto: CreateOrderDto = {
    customerName: 'Lucas',
    street: 'Rua 1',
    city: 'Sao Paulo',
    zipCode: '01000-000',
    items: [{ productId: 'product-1', quantity: 2 }],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(ProductsEntity),
          useValue: productsRepository,
        },
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: orderRepository,
        },
        {
          provide: getRepositoryToken(OrderItemEntity),
          useValue: orderItemRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should create an approved order, persist items and decrement product stock', async () => {
    const initialOrder = {
      customerName: createOrderDto.customerName,
      street: createOrderDto.street,
      city: createOrderDto.city,
      zipCode: createOrderDto.zipCode,
      status: CheckoutStatus.PENDING,
      totalPrice: 0,
    } as OrderEntity;
    const savedOrder = { ...initialOrder, id: 'order-1' };

    orderRepository.create.mockReturnValue(initialOrder);
    orderRepository.save.mockImplementation((order: OrderEntity) =>
      Promise.resolve({
        ...order,
        id: order.id ?? 'order-1',
      }),
    );
    productsRepository.findOne.mockResolvedValue({ ...product });
    productsRepository.save.mockImplementation((item: ProductsEntity) =>
      Promise.resolve(item),
    );
    orderItemRepository.create.mockImplementation(
      (item: OrderItemEntity) => item,
    );
    orderItemRepository.save.mockImplementation((item: OrderItemEntity) =>
      Promise.resolve(item),
    );

    await expect(service.createOrder(createOrderDto)).resolves.toEqual({
      success: true,
      message: 'Pedido realizado com sucesso',
      order: {
        ...savedOrder,
        totalPrice: 50,
        status: CheckoutStatus.APPROVED,
      },
    });
    expect(orderRepository.create).toHaveBeenCalledWith({
      customerName: createOrderDto.customerName,
      street: createOrderDto.street,
      city: createOrderDto.city,
      zipCode: createOrderDto.zipCode,
      status: CheckoutStatus.PENDING,
      totalPrice: 0,
    });
    expect(productsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'product-1', quantity: 8 }),
    );
    expect(orderItemRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        productName: product.name,
        quantity: 2,
        unitPrice: product.price,
        totalPrice: 50,
      }),
    );
  });

  it('should reject an empty cart', async () => {
    await expect(
      service.createOrder({ ...createOrderDto, items: [] }),
    ).rejects.toThrow(new BadRequestException('Carrinho vazio'));
  });

  it('should reject a missing product', async () => {
    orderRepository.create.mockReturnValue({} as OrderEntity);
    orderRepository.save.mockResolvedValue({ id: 'order-1' } as OrderEntity);
    productsRepository.findOne.mockResolvedValue(null);

    await expect(service.createOrder(createOrderDto)).rejects.toThrow(
      new NotFoundException('Produto product-1 não encontrado'),
    );
  });

  it('should reject invalid item quantities', async () => {
    orderRepository.create.mockReturnValue({} as OrderEntity);
    orderRepository.save.mockResolvedValue({ id: 'order-1' } as OrderEntity);
    productsRepository.findOne.mockResolvedValue(product);

    await expect(
      service.createOrder({
        ...createOrderDto,
        items: [{ productId: 'product-1', quantity: 0 }],
      }),
    ).rejects.toThrow(new BadRequestException('Quantidade inválida'));
  });

  it('should reject orders with insufficient stock', async () => {
    orderRepository.create.mockReturnValue({} as OrderEntity);
    orderRepository.save.mockResolvedValue({ id: 'order-1' } as OrderEntity);
    productsRepository.findOne.mockResolvedValue({ ...product, quantity: 1 });

    await expect(service.createOrder(createOrderDto)).rejects.toThrow(
      new ConflictException('Estoque insuficiente para o produto Capinha'),
    );
  });

  it('should list orders with items ordered by creation date descending', async () => {
    const orders = [{ id: 'order-1', items: [] }] as unknown as OrderEntity[];
    orderRepository.find.mockResolvedValue(orders);

    await expect(service.getOrders()).resolves.toEqual(orders);
    expect(orderRepository.find).toHaveBeenCalledWith({
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  });

  it('should find an order by id with its items', async () => {
    const order = { id: 'order-1', items: [] } as unknown as OrderEntity;
    orderRepository.findOne.mockResolvedValue(order);

    await expect(service.findOrderById('order-1')).resolves.toEqual(order);
    expect(orderRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      relations: {
        items: {
          product: true,
        },
      },
    });
  });

  it('should throw NotFoundException when order does not exist', async () => {
    orderRepository.findOne.mockResolvedValue(null);

    await expect(service.findOrderById('missing-id')).rejects.toThrow(
      new NotFoundException('Pedido não encontrado'),
    );
  });

  it('should cancel an order and restore product stock', async () => {
    const order = {
      id: 'order-1',
      status: CheckoutStatus.APPROVED,
      items: [
        {
          product: { id: 'product-1' },
          quantity: 2,
        },
      ],
    } as OrderEntity;
    const stockedProduct = { ...product, quantity: 8 };

    orderRepository.findOne.mockResolvedValue(order);
    productsRepository.findOne.mockResolvedValue(stockedProduct);
    productsRepository.save.mockImplementation((item: ProductsEntity) =>
      Promise.resolve(item),
    );
    orderRepository.save.mockImplementation((item: OrderEntity) =>
      Promise.resolve(item),
    );

    await expect(service.cancelOrder('order-1')).resolves.toEqual({
      success: true,
      message: 'Pedido cancelado com sucesso',
      order: {
        ...order,
        status: CheckoutStatus.CANCELED,
      },
    });
    expect(productsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'product-1', quantity: 10 }),
    );
  });

  it('should not cancel an order twice', async () => {
    orderRepository.findOne.mockResolvedValue({
      id: 'order-1',
      status: CheckoutStatus.CANCELED,
      items: [],
    } as unknown as OrderEntity);

    await expect(service.cancelOrder('order-1')).rejects.toThrow(
      new ConflictException('Pedido já cancelado'),
    );
  });
});
