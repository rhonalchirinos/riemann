import { Test, TestingModule } from '@nestjs/testing';
import { InvitationController } from './invitation.controller';
import { ProfileInvitationUsecase } from 'src/profile/application/usecases/profile-invitations.usecase';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { AuthRequest } from 'src/shared/dto/request';

describe('InvitationController', () => {
  let controller: InvitationController;
  let mockInvitationUsecase: Partial<ProfileInvitationUsecase>;

  beforeEach(async () => {
    mockInvitationUsecase = {
      invitations: jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'Test Invitation',
          email: 'test@example.com',
          token: 'test-token',
          status: 'PENDING',
          enterprise: {
            slug: 'test-enterprise',
            name: 'Test Enterprise',
            description: 'Test Description',
          },
        },
      ]),
      accept: jest.fn().mockResolvedValue(undefined),
      reject: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationController],
      providers: [
        {
          provide: ProfileInvitationUsecase,
          useValue: mockInvitationUsecase,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<InvitationController>(InvitationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('invitations', () => {
    it('should return a list of invitations', async () => {
      const req: AuthRequest = { user: { userId: '1' } } as AuthRequest;
      const result = await controller.invitations(req);

      expect(mockInvitationUsecase.invitations).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        data: [
          {
            id: 1,
            name: 'Test Invitation',
            email: 'test@example.com',
            token: 'test-token',
            status: 'PENDING',
            enterprise: {
              slug: 'test-enterprise',
              name: 'Test Enterprise',
              description: 'Test Description',
            },
          },
        ],
      });
    });
  });

  describe('accept', () => {
    it('should accept an invitation', async () => {
      const req: AuthRequest = { user: { userId: '1' } } as any;
      const id = '1';

      await controller.accept(req, id);

      expect(mockInvitationUsecase.accept).toHaveBeenCalledWith(1, id);
    });
  });

  describe('reject', () => {
    it('should reject an invitation', async () => {
      const req: AuthRequest = { user: { userId: '1' } } as any;
      const id = '1';

      await controller.reject(req, id);

      expect(mockInvitationUsecase.reject).toHaveBeenCalledWith(1, id);
    });
  });
});
