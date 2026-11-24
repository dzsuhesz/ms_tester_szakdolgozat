
import { BadGatewayException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreatePaymentDto } from './create-payment.dto';
import { Payment } from './payment.entity';
import { PaymentProvider } from './payment-provider';

interface ProcessedRequest {
  fingerprint: string;
  result: Promise<Payment>;
}

@Injectable()
export class PaymentsService {
  private processed = new Map<string, ProcessedRequest>();

  constructor(private provider: PaymentProvider) {}

  
  async pay(userId: string, idempotencyKey: string, dto: CreatePaymentDto): Promise<Payment> {
    const storeKey = `${userId}:${idempotencyKey}`;
    const fingerprint = `${dto.orderId}:${dto.amount}`;

    const previous = this.processed.get(storeKey);
    if (previous) {
      if (previous.fingerprint !== fingerprint) {
        throw new UnprocessableEntityException('Idempotency-Key already used with different data');
      }
      return previous.result;
    }

    const result = this.charge(userId, dto);
    this.processed.set(storeKey, { fingerprint, result });

    try {
      return await result;
    } catch (error) {
      this.processed.delete(storeKey);
      throw error;
    }
  }

  private async charge(userId: string, dto: CreatePaymentDto): Promise<Payment> {
    let outcome;
    try {
      outcome = await this.provider.charge(dto.amount);
    } catch {
      throw new BadGatewayException('Payment provider error');
    }

    return {
      id: randomUUID(),
      orderId: dto.orderId,
      userId: userId,
      amount: dto.amount,
      status: outcome.approved ? 'APPROVED' : 'DECLINED',
      reason: outcome.reason,
      createdAt: new Date(),
    };
  }
}