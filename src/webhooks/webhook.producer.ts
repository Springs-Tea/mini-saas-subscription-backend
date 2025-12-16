import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WebhookProducer {
  constructor(@InjectQueue('webhooks') private webhookQueue: Queue) {}

  async addDeliveryJob(eventId: string) {
    await this.webhookQueue.add(
      'deliver',
      { eventId },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1 minute initial delay
        },
      },
    );
  }
}
