import { BadGatewayException, UnprocessableEntityException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentProvider } from './payment-provider';

describe('PaymentsService', () => {
  const dto = { orderId: 'order-1', amount: 24990 };

  let providerMock: { charge: jest.Mock };
  let service: PaymentsService;
  

  beforeEach(() => {
    providerMock = { charge: jest.fn().mockResolvedValue({ approved: true }) };
    service = new PaymentsService(providerMock as unknown as PaymentProvider);
  });

  it('sikeres terhelésnél APPROVED fizetést ad vissza', async () => {
    const payment = await service.pay('user-1', 'kulcs-1', dto);

    expect(payment.status).toBe('APPROVED');
    expect(payment.orderId).toBe('order-1');
    expect(payment.userId).toBe('user-1');
    expect(providerMock.charge).toHaveBeenCalledWith(24990);
  });

  it('elutasított terhelésnél DECLINED fizetést ad vissza, az okkal együtt', async () => {
    providerMock.charge.mockResolvedValue({ approved: false, reason: 'INSUFFICIENT_FUNDS' });

    const payment = await service.pay('user-1', 'kulcs-1', dto);

    expect(payment.status).toBe('DECLINED');
    expect(payment.reason).toBe('INSUFFICIENT_FUNDS');
  });

  describe('idempotencia', () => {
    it('ugyanazzal a kulccsal másodszor NEM terhel újra, hanem az első eredményt adja vissza', async () => {
      const first = await service.pay('user-1', 'kulcs-1', dto);
      const second = await service.pay('user-1', 'kulcs-1', dto);

      expect(second).toEqual(first);
      expect(providerMock.charge).toHaveBeenCalledTimes(1);
    });

    it('egyszerre beérkező, azonos kulcsú kéréseknél is csak egyszer terhel', async () => {
      const results = await Promise.all([
        service.pay('user-1', 'kulcs-1', dto),
        service.pay('user-1', 'kulcs-1', dto),
        service.pay('user-1', 'kulcs-1', dto),
      ]);

      expect(results[1]).toEqual(results[0]);
      expect(results[2]).toEqual(results[0]);
      expect(providerMock.charge).toHaveBeenCalledTimes(1);
    });

    it('ugyanazzal a kulccsal, de más adatokkal 422-t dob', async () => {
      await service.pay('user-1', 'kulcs-1', dto);

      await expect(service.pay('user-1', 'kulcs-1', { ...dto, amount: 1 })).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('a kulcs felhasználónként értendő: két felhasználó ugyanazzal a kulccsal két külön fizetés', async () => {
      const elek = await service.pay('user-1', 'kulcs-1', dto);
      const bela = await service.pay('user-2', 'kulcs-1', dto);

      expect(bela.id).not.toBe(elek.id);
      expect(providerMock.charge).toHaveBeenCalledTimes(2);
    });

    it('szolgáltatói hiba után (502) ugyanazzal a kulccsal újrapróbálható', async () => {
      providerMock.charge.mockRejectedValueOnce(new Error('Provider outage'));

      await expect(service.pay('user-1', 'kulcs-1', dto)).rejects.toThrow(BadGatewayException);

      const retry = await service.pay('user-1', 'kulcs-1', dto);
      expect(retry.status).toBe('APPROVED');
      expect(providerMock.charge).toHaveBeenCalledTimes(2);
    });
  });
});