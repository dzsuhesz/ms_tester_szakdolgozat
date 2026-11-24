import { Controller, Get, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { PaymentProvider } from './payments/payment-provider';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'payment-service' };
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
  controllers: [HealthController, PaymentsController],
  providers: [PaymentsService, PaymentProvider, JwtAuthGuard],
})
export class AppModule {}