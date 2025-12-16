import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CheckoutDto, PaymentResultDto, InvoiceDto } from './dto/payment.dto';

@ApiTags('Payments')
@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Process payment for a subscription (fake)' })
  @ApiResponse({
    status: 200,
    description: 'Payment result',
    type: PaymentResultDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async checkout(@Body() dto: CheckoutDto): Promise<PaymentResultDto> {
    return this.paymentsService.checkout(dto);
  }

  @Get('invoices/:subscriptionId')
  @ApiOperation({ summary: 'Get invoices for a subscription' })
  @ApiResponse({
    status: 200,
    description: 'List of invoices',
    type: [InvoiceDto],
  })
  async getInvoices(@Param('subscriptionId') subscriptionId: string) {
    return this.paymentsService.getInvoicesBySubscription(subscriptionId);
  }
}
