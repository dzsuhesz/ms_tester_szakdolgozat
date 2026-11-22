import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

function fakeRequest(authorization?: string) {
  const request: any = { headers: {} };
  if (authorization) {
    request.headers.authorization = authorization;
  }
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('JwtAuthGuard', () => {
  const jwtService = new JwtService({ secret: 'test-secret' });
  const guard = new JwtAuthGuard(jwtService);

  it('érvényes tokennel átenged, és a token tartalmát a request.user-be teszi', async () => {
    const token = jwtService.sign({ sub: 'user-1', email: 'a@b.hu' }, { expiresIn: '5m' });
    const { context, request } = fakeRequest(`Bearer ${token}`);

    expect(await guard.canActivate(context)).toBe(true);
    expect(request.user.sub).toBe('user-1');
  });

  it('hiányzó fejléc esetén elutasít', async () => {
    const { context } = fakeRequest();

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('nem Bearer séma esetén elutasít', async () => {
    const token = jwtService.sign({ sub: 'user-1' });
    const { context } = fakeRequest(`Basic ${token}`);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('más titokkal aláírt (hamisított) tokent elutasít', async () => {
    const forged = new JwtService({ secret: 'tamado-titka' }).sign({ sub: 'admin' });
    const { context } = fakeRequest(`Bearer ${forged}`);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('lejárt tokent elutasít', async () => {
    const tenSecondsAgo = Math.floor(Date.now() / 1000) - 10;
    const expired = jwtService.sign({ sub: 'user-1', exp: tenSecondsAgo });
    const { context } = fakeRequest(`Bearer ${expired}`);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});