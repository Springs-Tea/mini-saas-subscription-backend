import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebhookEventDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Event type', example: 'subscription.created' })
  type: string;

  @ApiProperty({ description: 'Event payload' })
  payload: Record<string, any>;

  @ApiProperty({ description: 'Delivery status', example: 'pending' })
  status: string;

  @ApiProperty({ description: 'Delivery attempts' })
  attempts: number;

  @ApiPropertyOptional({ description: 'Next retry time' })
  nextRetryAt?: Date;

  @ApiPropertyOptional({ description: 'Delivered at time' })
  deliveredAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class WebhookPayloadDto {
  @ApiProperty({ description: 'Event ID (for idempotency)' })
  eventId: string;

  @ApiProperty({ description: 'Event type' })
  type: string;

  @ApiProperty({ description: 'Event data' })
  data: Record<string, any>;

  @ApiProperty({ description: 'Event timestamp' })
  timestamp: string;
}

export class WebhookResponseDto {
  @ApiProperty()
  received: boolean;

  @ApiProperty()
  eventId: string;

  @ApiPropertyOptional()
  message?: string;
}
