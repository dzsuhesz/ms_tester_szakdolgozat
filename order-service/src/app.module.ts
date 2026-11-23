import { Controller, Get, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { UsersClient } from './users/users.client';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'order-service' };
  }
}

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
      signOptions: { expiresIn: '1h', algorithm: 'HS256' },
      verifyOptions: { algorithms: ['HS256'] },
    }),
  ],
  controllers: [HealthController, OrdersController],
  providers: [OrdersService, UsersClient, JwtAuthGuard],
})
export class AppModule {}