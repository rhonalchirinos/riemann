/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileInvitationRepository } from './invitation.repository';
import { PrismaService } from 'src/configuration/database/prisma.service';
import { Employee, Invitation, InvitationStatus, PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { randomUUID } from 'crypto';

describe('ProfileInvitationRepository', () => {
  let repository: ProfileInvitationRepository;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    prismaMock.$transaction = jest
      .fn()
      .mockImplementation((callback: (prisma: DeepMockProxy<PrismaClient>) => unknown) =>
        callback(prismaMock),
      ) as typeof prismaMock.$transaction;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileInvitationRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repository = module.get<ProfileInvitationRepository>(ProfileInvitationRepository);
  });

  describe('findById', () => {
    it('should find an invitation by ID', async () => {
      const mockInvitation: Invitation = {
        id: '1',
        email: 'test@example.com',
        createdAt: new Date(),
        name: '',
        token: '',
        status: 'pending',
        enterpriseId: '',
        updatedAt: null,
        acceptedAt: null,
        rejectedAt: null,
      };
      prismaMock.invitation.findUnique.mockResolvedValue(mockInvitation);

      const result = await repository.findById('1');
      expect(prismaMock.invitation.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { enterprise: true },
      });
      expect(result).toEqual(mockInvitation);
    });
  });

  describe('findAll', () => {
    it('should find all invitations by email', async () => {
      const mockInvitations: Invitation[] = [
        {
          id: '1',
          email: 'test@example.com',
          createdAt: new Date(),
          name: '',
          token: '',
          status: 'pending',
          enterpriseId: '',
          updatedAt: null,
          acceptedAt: null,
          rejectedAt: null,
        },
      ];
      prismaMock.invitation.findMany.mockResolvedValue(mockInvitations);

      const result = await repository.findAll('test@example.com');

      expect(prismaMock.invitation.findMany).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { enterprise: true },
      });
      expect(result).toEqual(mockInvitations);
    });
  });

  describe('findByToken', () => {
    it('should find an invitation by email and token', async () => {
      const mockInvitation: Invitation = {
        id: '1',
        email: 'test@example.com',
        token: 'token',
        name: '',
        status: 'pending',
        enterpriseId: '',
        createdAt: new Date(),
        updatedAt: null,
        acceptedAt: null,
        rejectedAt: null,
      };
      prismaMock.invitation.findFirst.mockResolvedValue(mockInvitation);

      const result = await repository.findByToken('test@example.com', 'token');

      expect(prismaMock.invitation.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com', token: 'token' },
        include: { enterprise: true },
      });
      expect(result).toEqual(mockInvitation);
    });
  });

  describe('accept', () => {
    it('should accept an invitation and create an employee if necessary', async () => {
      const mockInvitation: Invitation = {
        id: randomUUID(),
        enterpriseId: '1',
        name: '',
        email: '',
        token: '',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: null,
        acceptedAt: null,
        rejectedAt: null,
      };

      const mockEmployee: Employee = {
        id: '1',
        userId: 1,
        enterpriseId: '',
        createdAt: new Date(),
        updatedAt: null,
        position: null,
      };

      prismaMock.invitation.update.mockResolvedValue({
        ...mockInvitation,
        status: InvitationStatus.accepted,
      });
      prismaMock.employee.findFirst.mockResolvedValue(null);
      prismaMock.employee.create.mockResolvedValue(mockEmployee);

      await repository.accept(mockInvitation, 1);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.invitation.update).toHaveBeenCalledWith({
        where: { id: mockInvitation.id },
        data: { status: InvitationStatus.accepted },
      });
      expect(prismaMock.employee.findFirst).toHaveBeenCalledWith({
        where: { userId: 1, enterpriseId: mockInvitation.enterpriseId },
      });
      expect(prismaMock.employee.create).toHaveBeenCalledWith({
        data: { userId: 1, enterpriseId: mockInvitation.enterpriseId, position: 'employee' },
      });
    });
  });

  describe('reject', () => {
    it('should reject an invitation', async () => {
      const mockInvitation: Invitation = {
        id: '1',
        enterpriseId: '1',
        name: '',
        email: '',
        token: '',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: null,
        acceptedAt: null,
        rejectedAt: null,
      };

      prismaMock.invitation.update.mockResolvedValue(mockInvitation);

      await repository.reject(mockInvitation);

      expect(prismaMock.invitation.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: InvitationStatus.rejected },
      });
    });
  });
});
