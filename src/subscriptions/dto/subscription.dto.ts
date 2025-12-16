import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'User ID for the subscriber',
    example: 'user_123',
  })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Plan ID to subscribe to' })
  @IsUUID()
  planId: string;
}

export class SubscriptionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  planId: string;

  @ApiProperty({ description: 'Subscription status', example: 'active' })
  status: string;

  @ApiProperty()
  currentPeriodEnd: Date;

  @ApiPropertyOptional()
  canceledAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class SubscriptionWithPlanDto extends SubscriptionDto {
  @ApiProperty()
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
  };
}
