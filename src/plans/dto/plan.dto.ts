import { ApiProperty } from '@nestjs/swagger';

export class PlanDto {
  @ApiProperty({ description: 'Plan ID' })
  id: string;

  @ApiProperty({ description: 'Plan name', example: 'Pro' })
  name: string;

  @ApiProperty({ description: 'Plan price', example: 29.99 })
  price: number;

  @ApiProperty({ description: 'Billing interval', example: 'monthly' })
  interval: string;

  @ApiProperty({ description: 'Plan features', example: ['Feature 1', 'Feature 2'] })
  features: string[];
}
