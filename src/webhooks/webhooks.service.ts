import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Event types
export enum WebhookEventType {
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_ACTIVATED = 'subscription.activated',
  SUBSCRIPTION_CANCELED = 'subscription.canceled',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  // Simple in-memory store for processed event IDs (idempotency)
  private processedEvents = new Set<string>();

  constructor(private prisma: PrismaService) {}

  async createEvent(type: string, payload: Record<string, any>) {
    const event = await this.prisma.webhookEvent.create({
      data: {
        type,
        payload,
        status: 'pending',
        attempts: 0,
      },
    });

    this.logger.log(`Created webhook event: ${event.id} (${type})`);
    return event;
  }

  async getEvents(limit = 50) {
    return this.prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getPendingEvents() {
    return this.prisma.webhookEvent.findMany({
      where: {
        status: 'pending',
        OR: [
          { nextRetryAt: null },
          { nextRetryAt: { lte: new Date() } },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markDelivered(id: string) {
    return this.prisma.webhookEvent.update({
      where: { id },
      data: {
        status: 'delivered',
        deliveredAt: new Date(),
      },
    });
  }

  async markFailed(id: string, scheduleRetry = true) {
    const event = await this.prisma.webhookEvent.findUnique({
      where: { id },
    });

    if (!event) return null;

    const newAttempts = event.attempts + 1;
    const maxAttempts = 5;

    // Exponential backoff: 1min, 5min, 15min, 30min, 1hr
    const retryDelays = [1, 5, 15, 30, 60];
    const nextRetryAt = scheduleRetry && newAttempts < maxAttempts
      ? new Date(Date.now() + retryDelays[newAttempts - 1] * 60 * 1000)
      : null;

    return this.prisma.webhookEvent.update({
      where: { id },
      data: {
        attempts: newAttempts,
        status: newAttempts >= maxAttempts ? 'failed' : 'pending',
        nextRetryAt,
      },
    });
  }

  // Simulated webhook receiver - processes incoming webhooks
  async processIncomingWebhook(eventId: string, type: string, data: Record<string, any>) {
    // Idempotency check
    if (this.processedEvents.has(eventId)) {
      this.logger.warn(`Event ${eventId} already processed (idempotency)`);
      return { received: true, eventId, message: 'Already processed' };
    }

    // Simulate processing (could fail randomly for testing)
    this.logger.log(`Processing webhook: ${eventId} (${type})`);

    // Mark as processed
    this.processedEvents.add(eventId);

    // Find and mark the event as delivered
    const event = await this.prisma.webhookEvent.findUnique({
      where: { id: eventId },
    });

    if (event) {
      await this.markDelivered(eventId);
    }

    return { received: true, eventId };
  }

  // Helper to emit events for various actions
  async emitSubscriptionCreated(subscriptionId: string, data: Record<string, any>) {
    return this.createEvent(WebhookEventType.SUBSCRIPTION_CREATED, {
      subscriptionId,
      ...data,
    });
  }

  async emitSubscriptionActivated(subscriptionId: string, data: Record<string, any>) {
    return this.createEvent(WebhookEventType.SUBSCRIPTION_ACTIVATED, {
      subscriptionId,
      ...data,
    });
  }

  async emitSubscriptionCanceled(subscriptionId: string, data: Record<string, any>) {
    return this.createEvent(WebhookEventType.SUBSCRIPTION_CANCELED, {
      subscriptionId,
      ...data,
    });
  }

  async emitPaymentSuccess(invoiceId: string, data: Record<string, any>) {
    return this.createEvent(WebhookEventType.PAYMENT_SUCCESS, {
      invoiceId,
      ...data,
    });
  }

  async emitPaymentFailed(invoiceId: string, data: Record<string, any>) {
    return this.createEvent(WebhookEventType.PAYMENT_FAILED, {
      invoiceId,
      ...data,
    });
  }
}
