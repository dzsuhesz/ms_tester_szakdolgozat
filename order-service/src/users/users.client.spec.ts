import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { UsersClient } from './users.client';

describe('UsersClient', () => {
  let client: UsersClient;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    client = new UsersClient();
    fetchMock = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('200-as válasznál visszaadja a felhasználót', async () => {
    const user = { id: 'user-1', email: 'elek@gmail.com', name: 'Teszt Elek', createdAt: '...' };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(user), { status: 200 }));

    expect(await client.getUser('user-1', 'token-123')).toEqual(user);
  });

  it('a megfelelő címre, Bearer tokennel küldi a kérést', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));

    await client.getUser('user-1', 'token-123');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:3001/users/user-1');
    expect(options.headers.Authorization).toBe('Bearer token-123');
  });

  it('404-es válasznál null-t ad vissza', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 404 }));

    expect(await client.getUser('user-1', 'token-123')).toBeNull();
  });

  it('ha a User Service nem elérhető, ServiceUnavailableException-t dob (503)', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(client.getUser('user-1', 'token-123')).rejects.toThrow(ServiceUnavailableException);
  });

  

  it('egyéb hibás válasznál (pl. 500) BadGatewayException-t dob (502)', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 500 }));

    await expect(client.getUser('user-1', 'token-123')).rejects.toThrow(BadGatewayException);
  });
});