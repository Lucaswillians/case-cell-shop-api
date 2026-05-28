import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { OrderController } from '../order.controller';
import { OrderService } from '../order.service';

describe('OrderController', () => {
  let controller: OrderController;

  const orderService = {
    createOrder: jest.fn<(data: CreateOrderDto) => Promise<unknown>>(),
    getOrders: jest.fn<() => Promise<unknown>>(),
    findOrderById: jest.fn<(id: string) => Promise<unknown>>(),
    cancelOrder: jest.fn<(id: string) => Promise<unknown>>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new OrderController(orderService as unknown as OrderService);
  });

  it('should create an order', async () => {
    const dto: CreateOrderDto = {
      customerName: 'Lucas',
      street: 'Rua 1',
      city: 'Sao Paulo',
      zipCode: '01000-000',
      items: [{ productId: 'product-1', quantity: 2 }],
    };
    const response = { success: true, message: 'Pedido realizado com sucesso' };
    orderService.createOrder.mockResolvedValue(response);

    await expect(controller.createOrder(dto)).resolves.toEqual(response);
    expect(orderService.createOrder).toHaveBeenCalledWith(dto);
  });

  it('should list orders', async () => {
    const orders = [{ id: 'order-1', items: [] }];
    orderService.getOrders.mockResolvedValue(orders);

    await expect(controller.getOrders()).resolves.toEqual(orders);
    expect(orderService.getOrders).toHaveBeenCalledTimes(1);
  });

  it('should get an order by id', async () => {
    const order = { id: 'order-1', items: [] };
    orderService.findOrderById.mockResolvedValue(order);

    await expect(controller.getOrderById('order-1')).resolves.toEqual(order);
    expect(orderService.findOrderById).toHaveBeenCalledWith('order-1');
  });

  it('should cancel an order', async () => {
    const response = { success: true, message: 'Pedido cancelado com sucesso' };
    orderService.cancelOrder.mockResolvedValue(response);

    await expect(controller.cancelOrder('order-1')).resolves.toEqual(response);
    expect(orderService.cancelOrder).toHaveBeenCalledWith('order-1');
  });
});
