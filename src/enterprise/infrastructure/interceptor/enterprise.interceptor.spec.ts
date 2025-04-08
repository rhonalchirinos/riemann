import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, ExecutionContext, CallHandler } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EnterpriseInterceptor } from './enterprise.interceptor';
import { PG_ENTERPRISE_REPOSITORY } from '../databases/entreprise.repository';
import { firstValueFrom, of } from 'rxjs';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Employee } from '@prisma/client';

describe('EnterpriseInterceptor', () => {
  let interceptor: EnterpriseInterceptor;
  let mockRequest: any;
  let mockCacheManager: any;
  let mockRepository: any;
  let mockExecutionContext: any;
  let mockCallHandler: any;

  const mockEnterprise = {
    id: 'enterprise-123',
    slug: 'enterprise-slug',
    description: 'Test Enterprise Description',
    createdAt: new Date(),
    updatedAt: null,
    name: 'Test Enterprise',
    ownerId: 123,
  };

  const mockEmployee = {
    id: 'employee-123',
    userId: '456',
    enterpriseId: 'enterprise-123',
    // Add other employee properties as needed
  };

  beforeEach(async () => {
    mockRequest = {
      params: { enterpriseId: 'enterprise-123' },
      user: { userId: '456' },
      enterpriseId: undefined,
      enterprise: undefined,
    };

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    mockRepository = {
      findById: jest.fn(),
      findEmployee: jest.fn(),
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    };

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('test')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseInterceptor,
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: PG_ENTERPRISE_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    interceptor = module.get<EnterpriseInterceptor>(EnterpriseInterceptor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should throw error when enterpriseId is missing', async () => {
      try {
        mockRequest.params = {};
        const context = new ExecutionContextHost([mockRequest]);

        await interceptor.intercept(context, mockCallHandler as CallHandler);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }

      expect(mockCallHandler.handle).not.toHaveBeenCalled();
    });

    it('should successfully intercept when user is the owner', async () => {
      const employee: Employee = {
        id: 'employee-123',
        position: 'employe',
        enterpriseId: 'enterprise-123',
        userId: 123,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.user.userId = '123';
      mockRepository.findById.mockResolvedValue(mockEnterprise);
      mockRepository.findEmployee.mockResolvedValue(employee);

      await interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      expect(mockRequest.enterpriseId).toBe(mockEnterprise.id);
      expect(mockRequest.enterprise).toEqual({
        ...mockEnterprise,
        ownerId: 123,
      });
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should successfully intercept when user is an employee with cache miss', async () => {
      mockRequest.user.userId = '456';
      jest
        .spyOn(interceptor, 'loadEnterpriseData')
        .mockResolvedValue(Promise.resolve(mockEnterprise));

      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findEmployee.mockResolvedValue(mockEmployee);

      await interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      expect(mockRepository.findEmployee).toHaveBeenCalledWith('enterprise-123', '456');
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'enterprise-users:enterprise-123:456',
        mockEmployee,
        60 * 1000,
      );
      expect(mockRequest.enterpriseId).toBe(mockEnterprise.id);
      expect(mockRequest.enterprise).toEqual(mockEnterprise);
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should successfully intercept when user is an employee with cache hit', async () => {
      mockRequest.user.userId = '456';
      jest.spyOn(interceptor, 'loadEnterpriseData').mockResolvedValue(mockEnterprise);
      mockCacheManager.get.mockResolvedValue(true);

      await interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      expect(mockRepository.findEmployee).not.toHaveBeenCalled();
      expect(mockRequest.enterpriseId).toBe(mockEnterprise.id);
      expect(mockRequest.enterprise).toEqual(mockEnterprise);
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it('should throw forbidden exception when user is not owner or employee', async () => {
      mockRequest.user.userId = '789';
      jest
        .spyOn(interceptor, 'loadEnterpriseData')
        .mockResolvedValue(Promise.resolve(mockEnterprise));
      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findEmployee.mockResolvedValue(null);

      await expect(
        interceptor.intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        ),
      ).rejects.toThrow('User not found in this organization');
      expect(mockCallHandler.handle).not.toHaveBeenCalled();
    });
  });

  describe('loadEnterpriseData', () => {
    it('should return cached enterprise when available', async () => {
      mockCacheManager.get.mockResolvedValue(mockEnterprise);

      const result = await interceptor.loadEnterpriseData('enterprise-123');

      expect(mockCacheManager.get).toHaveBeenCalledWith('enterprise:enterprise-123');
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(result).toEqual(mockEnterprise);
    });

    it('should fetch and cache enterprise when not in cache', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(mockEnterprise);

      const result = await interceptor.loadEnterpriseData('enterprise-123');

      expect(mockCacheManager.get).toHaveBeenCalledWith('enterprise:enterprise-123');
      expect(mockRepository.findById).toHaveBeenCalledWith('enterprise-123');
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'enterprise:enterprise-123',
        mockEnterprise,
        60 * 1000,
      );
      expect(result).toEqual(mockEnterprise);
    });

    it('should throw not found exception when enterprise does not exist', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(null);

      await expect(interceptor.loadEnterpriseData('enterprise-123')).rejects.toThrow(
        'Enterprise not found',
      );
    });
  });

  describe('findEnterpriseById', () => {
    it('should return enterprise directly if user is the owner', async () => {
      jest.spyOn(interceptor, 'loadEnterpriseData').mockResolvedValue({
        ...mockEnterprise,
        ownerId: 456, // Match the parsed userId '456'
      });

      const result = await interceptor.findEnterpriseById('enterprise-123', '456');

      expect(mockCacheManager.get).not.toHaveBeenCalled();
      expect(mockRepository.findEmployee).not.toHaveBeenCalled();
      expect(result).toEqual({
        ...mockEnterprise,
        ownerId: 456,
      });
    });

    it('should check cache and database for employee access', async () => {
      jest.spyOn(interceptor, 'loadEnterpriseData').mockResolvedValue(mockEnterprise);
      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findEmployee.mockResolvedValue(mockEmployee);

      const result = await interceptor.findEnterpriseById('enterprise-123', '456');

      expect(mockCacheManager.get).toHaveBeenCalledWith('enterprise-users:enterprise-123:456');
      expect(mockRepository.findEmployee).toHaveBeenCalledWith('enterprise-123', '456');
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'enterprise-users:enterprise-123:456',
        mockEmployee,
        60 * 1000,
      );
      expect(result).toEqual(mockEnterprise);
    });

    it('should use cached employee data when available', async () => {
      jest.spyOn(interceptor, 'loadEnterpriseData').mockResolvedValue(mockEnterprise);
      mockCacheManager.get.mockResolvedValue(mockEmployee);

      const result = await interceptor.findEnterpriseById('enterprise-123', '456');

      expect(mockCacheManager.get).toHaveBeenCalledWith('enterprise-users:enterprise-123:456');
      expect(mockRepository.findEmployee).not.toHaveBeenCalled();
      expect(result).toEqual(mockEnterprise);
    });
  });
});
