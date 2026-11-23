import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

@Injectable()
export class UsersClient {
  private baseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';

  async getUser(userId: string, token: string): Promise<UserDto | null> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      throw new ServiceUnavailableException('User service unavailable');
    }

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new BadGatewayException(`User service error: ${response.status}`);
    }
    return (await response.json()) as UserDto;
  }
  
}