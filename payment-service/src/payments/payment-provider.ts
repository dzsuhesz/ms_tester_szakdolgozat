import { Injectable } from '@nestjs/common';

export interface ChargeResult {
  approved: boolean;
  reason?: string;
}

@Injectable()
export class PaymentProvider {
  private delayMs = Number(process.env.PAYMENT_DELAY_MS || 0);

  async charge(amount: number): Promise<ChargeResult> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
    if (amount === 99999) {
      throw new Error('Provider outage');
    }

    console.log(`[mock-provider] ${amount} Ft terhelése`);

    if (amount > 100000) {
      return { approved: false, reason: 'INSUFFICIENT_FUNDS' };
    }
    return { approved: true };
  }
}