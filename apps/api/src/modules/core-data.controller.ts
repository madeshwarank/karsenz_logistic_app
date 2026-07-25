import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BookingStatus, RoleName } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { Roles } from './security';

@ApiTags('Core data')
@ApiBearerAuth()
@Controller()
export class CoreDataController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  async users() {
    const users = await this.prisma.user.findMany({
      include: { roles: { include: { role: true } }, branch: true },
      orderBy: { name: 'asc' },
    });
    return { data: users.map(({ passwordHash: _passwordHash, refreshTokenHash: _refreshTokenHash, ...u }) => u) };
  }

  @Get('branches')
  async branches() {
    return { data: await this.prisma.branch.findMany({ orderBy: { name: 'asc' } }) };
  }

  @Get('drivers')
  async drivers(@Query('date') date?: string) {
    const selectedDate = date ? new Date(date) : new Date();
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const drivers = await this.prisma.driverProfile.findMany({
      include: {
        user: true,
        branch: true,
        assignments: {
          where: { booking: { scheduledPickupAt: { gte: start, lt: end }, currentStatus: { notIn: [BookingStatus.CANCELLED, BookingStatus.COMPLETED] } } },
          include: { booking: true },
        },
        availability: { where: { date: { gte: start, lt: end } } },
      },
      orderBy: { user: { name: 'asc' } },
    });
    return { data: drivers.map((d) => ({ ...d, jobsForSelectedDate: d.assignments.length })) };
  }

  @Get('drivers/availability')
  async availability() {
    return { data: await this.prisma.driverAvailability.findMany({ include: { driverProfile: { include: { user: true } }, branch: true } }) };
  }

  @Get('customers')
  async customers(@Query('search') search?: string) {
    return {
      data: await this.prisma.customer.findMany({
        where: search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { primaryPhone: { contains: search } }] } : undefined,
        include: { vehicles: true, addresses: true },
        orderBy: { updatedAt: 'desc' },
        take: 100,
      }),
    };
  }

  @Get('vehicles')
  async vehicles(@Query('search') search?: string) {
    return {
      data: await this.prisma.vehicle.findMany({
        where: search ? { registrationNumber: { contains: search.toUpperCase() } } : undefined,
        include: { customer: true },
        orderBy: { updatedAt: 'desc' },
        take: 100,
      }),
    };
  }

  @Get('handovers')
  async handovers() {
    return {
      data: await this.prisma.pickupBooking.findMany({
        where: { currentStatus: { in: ['ARRIVED_AT_BRANCH', 'HANDOVER_PENDING'] } },
        include: { inspection: { include: { images: true } }, assignedDriver: { include: { user: true } }, destinationBranch: true },
        orderBy: { updatedAt: 'asc' },
      }),
    };
  }

  @Get('notifications')
  async notifications() {
    return { data: await this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }) };
  }

  @Get('audit-logs')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.MANAGER)
  async auditLogs() {
    return { data: await this.prisma.auditLog.findMany({ include: { actor: true }, orderBy: { createdAt: 'desc' }, take: 200 }) };
  }
}
