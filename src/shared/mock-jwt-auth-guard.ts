import { ExecutionContext } from '@nestjs/common';

export const mockJwtAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    request.user = {
      accessToken: 'mock-access-token',
      id: 'mock-user-id',
      email: 'user@example.com',
    };
    return true;
  }),
};
