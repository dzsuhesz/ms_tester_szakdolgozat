import { PaymentProvider } from './payment-provider';

describe('PaymentProvider (mock szolgáltató)', () => {
  const provider = new PaymentProvider();

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('100 000 Ft-ig jóváhagyja a terhelést', async () => {
    expect(await provider.charge(100000)).toEqual({ approved: true });
  });

  it('100 000 Ft felett elutasítja (nincs fedezet)', async () => {
    expect(await provider.charge(100001)).toEqual({ approved: false, reason: 'INSUFFICIENT_FUNDS' });
  });

  it('99 999 Ft-nál szolgáltatói hibát szimulál', async () => {
    await expect(provider.charge(99999)).rejects.toThrow('Provider outage');
  });
});