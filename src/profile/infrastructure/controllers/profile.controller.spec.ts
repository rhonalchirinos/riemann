import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileUsecase } from 'src/profile/application/usecases/profile.usecase';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';

describe('ProfileController', () => {
  let controller: ProfileController;
  let mockProfileUsecase: Partial<ProfileUsecase>;

  beforeEach(async () => {
    mockProfileUsecase = {
      profile: jest.fn().mockResolvedValue({
        email: 'test@example.com',
        name: 'Test User',
        employees: [
          {
            position: 'Manager',
            enterprise: {
              slug: 'test-enterprise',
              name: 'Test Enterprise',
              description: 'Test Description',
            },
          },
        ],
      }),
      updateProfile: jest.fn().mockResolvedValue({
        email: 'updated@example.com',
        name: 'Updated User',
        employees: [
          {
            position: 'Manager',
            enterprise: {
              slug: 'updated-enterprise',
              name: 'Updated Enterprise',
              description: 'Updated Description',
            },
          },
        ],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileUsecase,
          useValue: mockProfileUsecase,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('profile', () => {
    it('should return user profile data', async () => {
      const req = { user: { userId: '1' } } as any;
      const result = await controller.profile(req);

      expect(mockProfileUsecase.profile).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          enterprises: [
            {
              position: 'Manager',
              enterprise: {
                slug: 'test-enterprise',
                name: 'Test Enterprise',
                description: 'Test Description',
              },
            },
          ],
        },
      });
    });
  });

  describe('profileUpdate', () => {
    it('should update and return user profile data', async () => {
      const req = { user: { userId: '1' } } as any;
      const profileDto = { name: 'Updated User', email: 'updated@example.com' } as any;
      const result = await controller.profileUpdate(req, profileDto);

      expect(mockProfileUsecase.updateProfile).toHaveBeenCalledWith(1, profileDto);
      expect(result).toEqual({
        data: {
          email: 'updated@example.com',
          name: 'Updated User',
          enterprises: [
            {
              position: 'Manager',
              enterprise: {
                slug: 'updated-enterprise',
                name: 'Updated Enterprise',
                description: 'Updated Description',
              },
            },
          ],
        },
      });
    });
  });
});
