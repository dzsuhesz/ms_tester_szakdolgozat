import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UsersClient } from '../users/users.client';
import { CreateOrderDto } from './create-order.dto';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  private orders = new Map<string, Order>();

  constructor(private usersClient: UsersClient) {}

  async create(userId: string, token: string, dto: CreateOrderDto): Promise<Order> {
    const user = await this.usersClient.getUser(userId, token);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const order: Order = {
      id: randomUUID(),
      userId: userId,
      item: dto.item,
      amount: dto.amount,
      status: 'CREATED',
      createdAt: new Date(),
    };
    this.orders.set(order.id, order);
    return order;
  }

  findById(id: string, userId: string): Order {
    const order = this.orders.get(id);
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}