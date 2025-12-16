import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PlansService', () => {
  let service: PlansService;
  let prisma: PrismaService;

  const mockPlans = [
    {
      id: '1',
      name: 'Free',
      price: 0,
      interval: 'monthly',
      features: ['Basic features'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Pro',
      price: 29.99,
      interval: 'monthly',
      features: ['Pro features'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPrismaService = {
    plan: {
      findMany: jest.fn().mockResolvedValue(mockPlans),
      findUnique: jest.fn().mockResolvedValue(mockPlans[0]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of plans', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockPlans);
      expect(prisma.plan.findMany).toHaveBeenCalledWith({
        orderBy: { price: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single plan by id', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockPlans[0]);
      expect(prisma.plan.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('findByName', () => {
    it('should return a plan by name', async () => {
      await service.findByName('Free');
      expect(prisma.plan.findUnique).toHaveBeenCalledWith({
        where: { name: 'Free' },
      });
    });
  });
});
