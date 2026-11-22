import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  const jwtService = new JwtService({ secret: 'test-secret', signOptions: { expiresIn: '1h' } });

  let storedUser: User;
  let usersServiceMock: { findByEmail: jest.Mock };
  let service: AuthService;

  beforeAll(async () => {
    storedUser = {
      id: 'b3c1a7e2-1111-4222-8333-444455556666',
      email: 'anna@example.com',
      name: 'Anna',
      passwordHash: await bcrypt.hash('secret123', 4),
      createdAt: new Date(),
    };
  });

  beforeEach(() => {
    usersServiceMock = { findByEmail: jest.fn() };
    service = new AuthService(usersServiceMock as unknown as UsersService, jwtService);
  });

  it('helyes adatokkal érvényes JWT-t ad vissza a user azonosítójával', async () => {
    usersServiceMock.findByEmail.mockReturnValue(storedUser);

    const { accessToken } = await service.login({ email: 'anna@example.com', password: 'secret123' });
    const payload = jwtService.verify(accessToken);

    expect(payload.sub).toBe(storedUser.id);
    expect(payload.email).toBe(storedUser.email);
    expect(payload.exp - payload.iat).toBe(3600);
  });

  it('a token nem tartalmaz érzékeny adatot (jelszó, hash)', async () => {
    usersServiceMock.findByEmail.mockReturnValue(storedUser);

    const { accessToken } = await service.login({ email: 'anna@example.com', password: 'secret123' });
    const decoded = JSON.stringify(jwtService.decode(accessToken));

    expect(decoded).not.toContain('passwordHash');
    expect(decoded).not.toContain('secret123');
  });

  it('rossz jelszóra UnauthorizedException-t dob', async () => {
    usersServiceMock.findByEmail.mockReturnValue(storedUser);

    await expect(
      service.login({ email: 'anna@example.com', password: 'rossz-jelszo' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('ismeretlen emailre ugyanazt a hibát adja, mint rossz jelszóra (nincs user enumeration)', async () => {
    usersServiceMock.findByEmail.mockReturnValue(undefined);
    const unknownEmailError = await service
      .login({ email: 'nincs@example.com', password: 'x' })
      .catch((e) => e);

    usersServiceMock.findByEmail.mockReturnValue(storedUser);
    const wrongPasswordError = await service
      .login({ email: 'anna@example.com', password: 'x' })
      .catch((e) => e);

    expect(unknownEmailError).toBeInstanceOf(UnauthorizedException);
    expect(unknownEmailError.message).toBe(wrongPasswordError.message);
  });

  it('login egyszer hívja csak meg a megadott emalel a findByEmail-t', async () => {
    usersServiceMock.findByEmail.mockReturnValue(storedUser);
    await service.login({ email: 'anna@example.com', password: 'secret123' });

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('anna@example.com');
    expect(usersServiceMock.findByEmail).toHaveBeenCalledTimes(1);
  });
});