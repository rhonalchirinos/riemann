// invitation.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { InvitationController } from './invitation.controller';
import { ProfileInvitationUsecase } from 'src/profile/application/usecases/profile.invitations.usecase';
import { AuthRequest } from 'src/shared/dto/request';
import {
  PG_PROFILE_INVITATION_REPOSITORY,
  ProfileInvitationRepository,
} from '../database/invitation.repository';
import { PrismaService } from 'src/database/prisma.service';
import { ProfileInvitationRepositoryPort } from 'src/profile/domain/rapositories/profile.invitation.repository';
import { UserRepositoryPort } from 'src/auth/domain/repositories/user.repository';
import {
  PG_USER_REPOSITORY,
  UserRepository,
} from 'src/auth/infrastructure/database/user.repository';
import { InvitationStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { HttpException, NotFoundException } from '@nestjs/common';

describe('InvitationController', () => {
  let controller: InvitationController;

  const mockRequest: Partial<AuthRequest> = {
    user: {
      userId: '42',
      accessToken: {
        id: 'accessTokenId',
        refreshToken: 'refreshToken',
        userId: 42,
        expiresAt: new Date(),
        createdAt: new Date(),
      },
    },
  };

  const mockUserRepository: any = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockInvitationRepository: any = {
    invitation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    employee: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationController],
      providers: [
        {
          provide: ProfileInvitationUsecase,
          useFactory: (
            invitationRepository: ProfileInvitationRepositoryPort,
            userRepository: UserRepositoryPort,
          ) => new ProfileInvitationUsecase(invitationRepository, userRepository),
          inject: [PG_PROFILE_INVITATION_REPOSITORY, PG_USER_REPOSITORY],
        },
        {
          provide: PG_PROFILE_INVITATION_REPOSITORY,
          useFactory: () =>
            new ProfileInvitationRepository(mockInvitationRepository as PrismaService),
        },
        {
          provide: PG_USER_REPOSITORY,
          useFactory: () => new UserRepository(mockUserRepository as PrismaService),
        },
      ],
    }).compile();

    controller = module.get<InvitationController>(InvitationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of all invitations', async () => {
    const mockInvitations = [
      {
        id: '685dcaea-4c2a-496c-afda-578eebc91ec4',
        name: 'Miss Rosalie Kshlerin',
        email: 'valentine52@yahoo.com',
        token: 'ebd7ce45accec232ca89ed4e561dfc7a38ae04b0b13b58d653806103d885f62a',
        status: 'accepted',
        enterprise: {
          slug: 'alterta-mexico',
          name: 'Soy una prueba',
          description: 'soy una descripcion',
        },
      },
    ];

    mockUserRepository.user.findUnique.mockResolvedValueOnce(
      Promise.resolve({
        email: 'test@gmail.com',
      }),
    );

    mockInvitationRepository.invitation.findMany.mockResolvedValueOnce(
      Promise.resolve(mockInvitations),
    );

    const result = await controller.invitations(mockRequest as AuthRequest);
    expect(mockUserRepository.user.findUnique).toHaveBeenCalled();
    expect(result).toEqual({ data: mockInvitations });
  });

  describe('accept invitation', () => {
    it('should accept a valid invitation', async () => {
      const email = faker.internet.email();

      const mockInvitation = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: email,
        token: faker.string.alpha(16),
        status: InvitationStatus.pending,
        enterprise: {
          slug: faker.lorem.slug(),
          name: faker.company.name(),
          description: faker.lorem.paragraph(),
        },
      };

      mockUserRepository.user.findUnique.mockResolvedValueOnce(Promise.resolve({ email }));
      mockInvitationRepository.invitation.findUnique.mockResolvedValueOnce(
        Promise.resolve(mockInvitation),
      );

      await controller.accept(mockRequest as AuthRequest, mockInvitation.id);

      expect(mockUserRepository.user.findUnique).toHaveBeenCalled();
      expect(mockInvitationRepository.invitation.findUnique).toHaveBeenCalled();
      expect(mockInvitationRepository.invitation.update).toHaveBeenCalledWith({
        where: { id: mockInvitation.id },
        data: { status: InvitationStatus.accepted },
      });
    });

    it('should return an error status for an invalid invitation', () => {
      const email = faker.internet.email();

      const mockInvitation = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: email,
        token: faker.string.alpha(16),
        status: InvitationStatus.accepted,
        enterprise: {
          slug: faker.lorem.slug(),
          name: faker.company.name(),
          description: faker.lorem.paragraph(),
        },
      };
      mockUserRepository.user.findUnique.mockResolvedValueOnce(Promise.resolve({ email }));
      mockInvitationRepository.invitation.findUnique.mockResolvedValueOnce(
        Promise.resolve(mockInvitation),
      );

      expect(() => controller.accept(mockRequest as AuthRequest, mockInvitation.id)).toThrow(
        new HttpException('Invitation already ' + mockInvitation.status, 422),
      );
    });

    it('should not return an error for a valid invitation', () => {
      const email = faker.internet.email();

      mockUserRepository.user.findUnique.mockResolvedValueOnce(Promise.resolve({ email }));
      mockInvitationRepository.invitation.findUnique.mockResolvedValueOnce(Promise.resolve(null));

      expect(() => controller.accept(mockRequest as AuthRequest, faker.string.uuid())).toThrow(
        new NotFoundException('Invitation not found'),
      );
    });

    it('should return an error when accepting an invitation intended for another user', () => {
      const email = faker.internet.email();

      const mockInvitation = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: email,
        token: faker.string.alpha(16),
        status: InvitationStatus.pending,
        enterprise: {
          slug: faker.lorem.slug(),
          name: faker.company.name(),
          description: faker.lorem.paragraph(),
        },
      };
      mockUserRepository.user.findUnique.mockResolvedValueOnce(
        Promise.resolve({ email: faker.internet.email() }),
      );
      mockInvitationRepository.invitation.findUnique.mockResolvedValueOnce(
        Promise.resolve(mockInvitation),
      );

      expect(() => controller.accept(mockRequest as AuthRequest, mockInvitation.id)).toThrow(
        new NotFoundException('Invitation does not belongs you'),
      );
    });
  });

  // describe('reject invitation', () => {
  //   it('should reject a valid invitation', async () => {
  //     const email = faker.internet.email();

  //     const mockInvitation = {
  //       id: faker.string.uuid(),
  //       name: faker.person.fullName(),
  //       email: email,
  //       token: faker.string.alpha(16),
  //       status: InvitationStatus.pending,
  //       enterprise: {
  //         slug: faker.lorem.slug(),
  //         name: faker.company.name(),
  //         description: faker.lorem.paragraph(),
  //       },
  //     };
  //     mockUserRepository.user.findUnique.mockResolvedValueOnce(Promise.resolve({ email }));
  //     mockInvitationRepository.invitation.findUnique.mockResolvedValueOnce(
  //       Promise.resolve(mockInvitation),
  //     );

  //     await controller.reject(mockRequest as AuthRequest, mockInvitation.id);

  //     expect(mockUserRepository.user.findUnique).toHaveBeenCalled();
  //     expect(mockInvitationRepository.invitation.findUnique).toHaveBeenCalled();
  //     expect(mockInvitationRepository.invitation.update).toHaveBeenCalledWith({
  //       where: { id: mockInvitation.id },
  //       data: { status: InvitationStatus.rejected },
  //     });
  //   });

  //   it('should return an error status for an invalid invitation', () => {
  //     const email = faker.internet.email();

  //     const mockInvitation = {
  //       id: faker.string.uuid(),
  //       name: faker.person.fullName(),
  //       email: email,
  //       token: faker.string.alpha(16),
  //       status: InvitationStatus.accepted,
  //       enterprise: {
  //         slug: faker.lorem.slug(),
  //         name: faker.company.name(),
  //         description: faker.lorem.paragraph(),
  //       },
  //     };
  //     mockUserRepository.user.findUnique.mockResolvedValueOnce(Promise.resolve({ email }));
  //     mockInvitationRepository.invitation.findUnique.mockResolvedValueOnce(
  //       Promise.resolve(mockInvitation),
  //     );

  //     expect(() => controller.accept(mockRequest as AuthRequest, mockInvitation.id)).toThrow(
  //       new HttpException('Invitation already ' + mockInvitation.status, 422),
  //     );
  //   });

  //   it('should not return an error for a valid invitation', () => {
  //     const email = faker.internet.email();

  //     mockUserRepository.user.findUnique.mockResolvedValueOnce(Promise.resolve({ email }));
  //     mockInvitationRepository.invitation.findUnique.mockResolvedValueOnce(Promise.resolve(null));

  //     expect(() => controller.reject(mockRequest as AuthRequest, faker.string.uuid())).toThrow(
  //       new NotFoundException('Invitation not found'),
  //     );
  //   });

  //   it('should return an error when rejecting an invitation intended for another user', () => {
  //     const email = faker.internet.email();

  //     const mockInvitation = {
  //       id: faker.string.uuid(),
  //       name: faker.person.fullName(),
  //       email: email,
  //       token: faker.string.alpha(16),
  //       status: InvitationStatus.pending,
  //       enterprise: {
  //         slug: faker.lorem.slug(),
  //         name: faker.company.name(),
  //         description: faker.lorem.paragraph(),
  //       },
  //     };
  //     mockUserRepository.user.findUnique.mockResolvedValueOnce(
  //       Promise.resolve({ email: faker.internet.email() }),
  //     );
  //     mockInvitationRepository.invitation.findUnique.mockResolvedValueOnce(
  //       Promise.resolve(mockInvitation),
  //     );

  //     expect(() => controller.reject(mockRequest as AuthRequest, mockInvitation.id)).toThrow(
  //       new NotFoundException('Invitation does not belongs you'),
  //     );
  //   });
  // });
});
