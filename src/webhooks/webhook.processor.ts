import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Processor('webhooks')
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<{ eventId: string }>) {
    const { eventId } = job.data;
    this.logger.log(`Processing webhook job for event: ${eventId}`);

    const event = await this.prisma.webhookEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      this.logger.warn(`Event not found: ${eventId}`);
      return;
    }

    if (event.status === 'delivered') {
      this.logger.log(`Event already delivered: ${eventId}`);
      return;
    }

    const webhookUrl = this.configService.get<string>('WEBHOOK_ENDPOINT_URL') || 'http://localhost:3000/api/v1/webhooks/provider';

    try {
      // Simulate webhook delivery
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          type: event.type,
          data: event.payload,
          timestamp: event.createdAt.toISOString(),
        }),
      });

      if (response.ok) {
        await this.prisma.webhookEvent.update({
          where: { id: eventId },
          data: {
            status: 'delivered',
            deliveredAt: new Date(),
            attempts: event.attempts + 1,
          },
        });
        this.logger.log(`Webhook delivered: ${eventId}`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.logger.error(`Webhook delivery failed: ${eventId}`, error);

      const newAttempts = event.attempts + 1;
      const maxAttempts = 5;

      // Exponential backoff
      const retryDelays = [1, 5, 15, 30, 60];
      const nextRetryAt = newAttempts < maxAttempts
        ? new Date(Date.now() + retryDelays[newAttempts - 1] * 60 * 1000)
        : null;

      await this.prisma.webhookEvent.update({
        where: { id: eventId },
        data: {
          attempts: newAttempts,
          status: newAttempts >= maxAttempts ? 'failed' : 'pending',
          nextRetryAt,
        },
      });

      // Re-throw to trigger BullMQ retry
      if (newAttempts < maxAttempts) {
        throw error;
      }
    }
  }
}
