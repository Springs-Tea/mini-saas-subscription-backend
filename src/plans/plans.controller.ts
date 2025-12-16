import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { PlanDto } from './dto/plan.dto';

@ApiTags('Plans')
@Controller('api/v1/plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available plans' })
  @ApiResponse({ status: 200, description: 'List of plans', type: [PlanDto] })
  async findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan details', type: PlanDto })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }
}
