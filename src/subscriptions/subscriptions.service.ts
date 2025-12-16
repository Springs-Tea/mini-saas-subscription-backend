import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { PlansService } from '../plans/plans.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private customersService: CustomersService,
    private plansService: PlansService,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    // Verify plan exists
    const plan = await this.plansService.findOne(dto.planId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Find or create customer
    const customer = await this.customersService.findOrCreate({
      userId: dto.userId,
    });

    // Check if customer already has an active subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        customerId: customer.id,
        status: { in: ['active', 'pending'] },
      },
    });

    if (existingSubscription) {
      throw new BadRequestException(
        'Customer already has an active subscription',
      );
    }

    // Calculate period end (1 month for monthly, 1 year for yearly)
    const currentPeriodEnd = new Date();
    if (plan.interval === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Create subscription in pending status (will be activated after payment)
    const subscription = await this.prisma.subscription.create({
      data: {
        customerId: customer.id,
        planId: dto.planId,
        status: 'pending',
        currentPeriodEnd,
      },
      include: {
        plan: true,
        customer: true,
      },
    });

    return subscription;
  }

  async findByUserId(userId: string) {
    const customer = await this.customersService.findByUserId(userId);
    if (!customer) {
      return null;
    }

    return this.prisma.subscription.findFirst({
      where: {
        customerId: customer.id,
        status: { in: ['active', 'pending'] },
      },
      include: {
        plan: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        customer: true,
      },
    });
  }

  async cancel(id: string) {
    const subscription = await this.findById(id);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === 'canceled') {
      throw new BadRequestException('Subscription is already canceled');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
      include: {
        plan: true,
      },
    });
  }

  async activate(id: string) {
    const subscription = await this.findById(id);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'active',
      },
      include: {
        plan: true,
      },
    });
  }

  async expire(id: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'expired',
      },
    });
  }
}
