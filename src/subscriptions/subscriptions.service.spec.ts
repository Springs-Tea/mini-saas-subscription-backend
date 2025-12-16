import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { PlansService } from '../plans/plans.service';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: PrismaService;

  const mockPlan = {
    id: 'plan-1',
    name: 'Pro',
    price: 29.99,
    interval: 'monthly',
    features: ['Feature 1'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomer = {
    id: 'customer-1',
    userId: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSubscription = {
    id: 'sub-1',
    customerId: 'customer-1',
    planId: 'plan-1',
    status: 'active',
    currentPeriodEnd: new Date(),
    canceledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    plan: mockPlan,
    customer: mockCustomer,
  };

  const mockPrismaService = {
    subscription: {
      create: jest.fn().mockResolvedValue(mockSubscription),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(mockSubscription),
      update: jest.fn().mockResolvedValue({ ...mockSubscription, status: 'canceled' }),
    },
  };

  const mockCustomersService = {
    findOrCreate: jest.fn().mockResolvedValue(mockCustomer),
    findByUserId: jest.fn().mockResolvedValue(mockCustomer),
  };

  const mockPlansService = {
    findOne: jest.fn().mockResolvedValue(mockPlan),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: PlansService, useValue: mockPlansService },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a subscription', async () => {
      const dto = { userId: 'user-123', planId: 'plan-1' };
      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(mockPlansService.findOne).toHaveBeenCalledWith('plan-1');
      expect(mockCustomersService.findOrCreate).toHaveBeenCalledWith({ userId: 'user-123' });
    });

    it('should throw NotFoundException if plan not found', async () => {
      mockPlansService.findOne.mockResolvedValueOnce(null);

      await expect(service.create({ userId: 'user-123', planId: 'invalid' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if customer has active subscription', async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValueOnce(mockSubscription);

      await expect(service.create({ userId: 'user-123', planId: 'plan-1' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a subscription', async () => {
      const result = await service.cancel('sub-1');
      expect(mockPrismaService.subscription.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if subscription not found', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValueOnce(null);

      await expect(service.cancel('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already canceled', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValueOnce({
        ...mockSubscription,
        status: 'canceled',
      });

      await expect(service.cancel('sub-1')).rejects.toThrow(BadRequestException);
    });
  });
});
