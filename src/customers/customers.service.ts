import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { userId: dto.userId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.customer.create({
      data: {
        userId: dto.userId,
        email: dto.email,
        name: dto.name,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.customer.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          include: { plan: true },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }
}
