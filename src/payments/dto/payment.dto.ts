import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ description: 'Subscription ID to pay for' })
  @IsUUID()
  subscriptionId: string;

  @ApiPropertyOptional({
    description: 'Simulate payment failure (for testing)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;
}

export class PaymentResultDto {
  @ApiProperty({ description: 'Payment success status' })
  success: boolean;

  @ApiProperty({ description: 'Result message' })
  message: string;

  @ApiPropertyOptional({ description: 'Invoice ID if created' })
  invoiceId?: string;

  @ApiPropertyOptional({ description: 'Subscription ID' })
  subscriptionId?: string;

  @ApiPropertyOptional({ description: 'New subscription status' })
  subscriptionStatus?: string;
}

export class InvoiceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  subscriptionId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ description: 'Invoice status', example: 'paid' })
  status: string;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiProperty()
  createdAt: Date;
}
