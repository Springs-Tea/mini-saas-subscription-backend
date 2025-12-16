import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import {
  CreateSubscriptionDto,
  SubscriptionDto,
  SubscriptionWithPlanDto,
} from './dto/subscription.dto';

@ApiTags('Subscriptions')
@Controller('api/v1/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created (pending payment)',
    type: SubscriptionWithPlanDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User ID (simulated auth)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Current subscription',
    type: SubscriptionWithPlanDto,
  })
  @ApiResponse({ status: 404, description: 'No active subscription' })
  async getMySubscription(@Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new NotFoundException('User ID header required');
    }
    const subscription = await this.subscriptionsService.findByUserId(userId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }
    return subscription;
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled',
    type: SubscriptionDto,
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 400, description: 'Already canceled' })
  async cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id);
  }
}
