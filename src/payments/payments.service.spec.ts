import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockPlan = {
    id: 'plan-1',
    name: 'Pro',
    price: 29.99,
    interval: 'monthly',
  };

  const mockSubscription = {
    id: 'sub-1',
    customerId: 'customer-1',
    planId: 'plan-1',
    status: 'pending',
    currentPeriodEnd: new Date(),
    plan: mockPlan,
  };

  const mockInvoice = {
    id: 'inv-1',
    subscriptionId: 'sub-1',
    amount: 29.99,
    status: 'pending',
    createdAt: new Date(),
  };

  const mockPrismaService = {
    invoice: {
      create: jest.fn().mockResolvedValue(mockInvoice),
      update: jest.fn().mockResolvedValue({ ...mockInvoice, status: 'paid' }),
      findMany: jest.fn().mockResolvedValue([mockInvoice]),
    },
  };

  const mockSubscriptionsService = {
    findById: jest.fn().mockResolvedValue(mockSubscription),
    activate: jest.fn().mockResolvedValue({ ...mockSubscription, status: 'active' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    it('should process successful payment', async () => {
      const result = await service.checkout({ subscriptionId: 'sub-1' });

      expect(result.success).toBe(true);
      expect(result.subscriptionStatus).toBe('active');
      expect(mockPrismaService.invoice.create).toHaveBeenCalled();
      expect(mockSubscriptionsService.activate).toHaveBeenCalledWith('sub-1');
    });

    it('should handle failed payment simulation', async () => {
      const result = await service.checkout({
        subscriptionId: 'sub-1',
        simulateFailure: true,
      });

      expect(result.success).toBe(false);
      expect(result.subscriptionStatus).toBe('pending');
    });

    it('should throw NotFoundException if subscription not found', async () => {
      mockSubscriptionsService.findById.mockResolvedValueOnce(null);

      await expect(service.checkout({ subscriptionId: 'invalid' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if subscription not pending', async () => {
      mockSubscriptionsService.findById.mockResolvedValueOnce({
        ...mockSubscription,
        status: 'active',
      });

      await expect(service.checkout({ subscriptionId: 'sub-1' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getInvoicesBySubscription', () => {
    it('should return invoices for a subscription', async () => {
      const result = await service.getInvoicesBySubscription('sub-1');

      expect(result).toHaveLength(1);
      expect(mockPrismaService.invoice.findMany).toHaveBeenCalledWith({
        where: { subscriptionId: 'sub-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
