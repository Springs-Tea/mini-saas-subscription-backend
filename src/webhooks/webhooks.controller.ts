import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import {
  WebhookEventDto,
  WebhookPayloadDto,
  WebhookResponseDto,
} from './dto/webhook.dto';

@ApiTags('Webhooks')
@Controller('api/v1/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('provider')
  @ApiOperation({ summary: 'Simulated webhook receiver endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Webhook received',
    type: WebhookResponseDto,
  })
  async receiveWebhook(
    @Body() payload: WebhookPayloadDto,
  ): Promise<WebhookResponseDto> {
    this.logger.log(`Received webhook: ${payload.eventId} (${payload.type})`);
    return this.webhooksService.processIncomingWebhook(
      payload.eventId,
      payload.type,
      payload.data,
    );
  }

  @Get('events')
  @ApiOperation({ summary: 'Get all webhook events (admin)' })
  @ApiResponse({
    status: 200,
    description: 'List of webhook events',
    type: [WebhookEventDto],
  })
  async getEvents() {
    return this.webhooksService.getEvents();
  }

  @Get('events/pending')
  @ApiOperation({ summary: 'Get pending webhook events' })
  @ApiResponse({
    status: 200,
    description: 'List of pending events',
    type: [WebhookEventDto],
  })
  async getPendingEvents() {
    return this.webhooksService.getPendingEvents();
  }
}
