import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CheckoutDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async checkout(dto: CheckoutDto) {
    // Get subscription
    const subscription = await this.subscriptionsService.findById(dto.subscriptionId);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== 'pending') {
      throw new BadRequestException('Subscription is not pending payment');
    }

    const amount = subscription.plan.price;

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        subscriptionId: dto.subscriptionId,
        amount,
        status: 'pending',
      },
    });

    // Simulate payment processing
    const paymentSuccess = !dto.simulateFailure;

    if (paymentSuccess) {
      // Update invoice as paid
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      });

      // Activate subscription
      await this.subscriptionsService.activate(dto.subscriptionId);

      return {
        success: true,
        message: 'Payment successful. Subscription activated.',
        invoiceId: invoice.id,
        subscriptionId: dto.subscriptionId,
        subscriptionStatus: 'active',
      };
    } else {
      // Update invoice as failed
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'failed',
        },
      });

      return {
        success: false,
        message: 'Payment failed. Please try again.',
        invoiceId: invoice.id,
        subscriptionId: dto.subscriptionId,
        subscriptionStatus: 'pending',
      };
    }
  }

  async getInvoicesBySubscription(subscriptionId: string) {
    return this.prisma.invoice.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
