import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Req() request: any, @Body() dto: CreateOrderDto) {
    const userId = request.user.sub;
    const token = request.headers.authorization.slice(7);
    return this.ordersService.create(userId, token, dto);
  }

  @Get(':id')
  findOne(@Req() request: any, @Param('id') id: string) {
    return this.ordersService.findById(id, request.user.sub);
  }
}