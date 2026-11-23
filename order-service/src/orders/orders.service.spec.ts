import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UsersClient } from '../users/users.client';

describe('OrdersService', () => {
  const user = { id: 'user-1', email: 'elek@gmail.com', name: 'Teszt Elek', createdAt: '2026-11-22T10:00:00.000Z' };
  const dto = { item: 'Kávéfőző', amount: 24990 };

  let usersClientMock: { getUser: jest.Mock };
  let service: OrdersService;

  beforeEach(() => {
    usersClientMock = { getUser: jest.fn() };
    service = new OrdersService(usersClientMock as unknown as UsersClient);
  });

  describe('create', () => {
    it('létrehozza a rendelést CREATED állapotban, a felhasználóhoz kötve', async () => {
      usersClientMock.getUser.mockResolvedValue(user);

      const order = await service.create('user-1', 'token-123', dto);

      expect(order.userId).toBe('user-1');
      expect(order.item).toBe('Kávéfőző');
      expect(order.amount).toBe(24990);
      expect(order.status).toBe('CREATED');
      expect(order.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('a User Service-t a felhasználó azonosítójával és a tokennel kérdezi le', async () => {
      usersClientMock.getUser.mockResolvedValue(user);

      await service.create('user-1', 'token-123', dto);

      expect(usersClientMock.getUser).toHaveBeenCalledWith('user-1', 'token-123');
    });

    it('NotFoundException-t dob, ha a felhasználó nem létezik', async () => {
      usersClientMock.getUser.mockResolvedValue(null);

      await expect(service.create('user-1', 'token-123', dto)).rejects.toThrow(NotFoundException);
    });

    it('továbbadja a hibát, ha a User Service nem elérhető, és nem jön létre rendelés', async () => {
      usersClientMock.getUser.mockRejectedValue(new ServiceUnavailableException());

      await expect(service.create('user-1', 'token-123', dto)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('findById', () => {
    it('visszaadja a saját rendelést', async () => {
      usersClientMock.getUser.mockResolvedValue(user);
      const created = await service.create('user-1', 'token-123', dto);

      expect(service.findById(created.id, 'user-1')).toEqual(created);
    });

    it('más felhasználó rendelését nem adja ki (404, mintha nem is létezne)', async () => {
      usersClientMock.getUser.mockResolvedValue(user);
      const created = await service.create('user-1', 'token-123', dto);

      expect(() => service.findById(created.id, 'masik-user')).toThrow(NotFoundException);
    });

    it('NotFoundException-t dob ismeretlen azonosítóra', () => {
      expect(() => service.findById('nincs-ilyen', 'user-1')).toThrow(NotFoundException);
    });
  });
});