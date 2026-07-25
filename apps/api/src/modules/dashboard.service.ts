import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const now = new Date();

    const [
      totalToday,
      futureScheduled,
      unassigned,
      active,
      delayed,
      completed,
      cancelled,
      statusGroups,
      branchGroups,
      driverCompleted,
    ] = await Promise.all([
      this.prisma.pickupBooking.count({ where: { scheduledPickupAt: { gte: todayStart, lt: todayEnd } } }),
      this.prisma.pickupBooking.count({ where: { scheduledPickupAt: { gte: todayEnd }, currentStatus: { notIn: ['CANCELLED', 'COMPLETED'] } } }),
      this.prisma.pickupBooking.count({ where: { currentStatus: 'UNASSIGNED' } }),
      this.prisma.pickupBooking.count({ where: { currentStatus: { in: ['ASSIGNED', 'DRIVER_ACCEPTED', 'TRIP_STARTED', 'ARRIVED_AT_CUSTOMER', 'INSPECTION_IN_PROGRESS', 'VEHICLE_PICKED_UP', 'EN_ROUTE_TO_BRANCH', 'ARRIVED_AT_BRANCH', 'HANDOVER_PENDING'] } } }),
      this.prisma.pickupBooking.count({ where: { scheduledPickupAt: { lt: now }, currentStatus: { notIn: ['COMPLETED', 'CANCELLED', 'FAILED'] } } }),
      this.prisma.pickupBooking.count({ where: { currentStatus: 'COMPLETED', updatedAt: { gte: todayStart } } }),
      this.prisma.pickupBooking.count({ where: { currentStatus: 'CANCELLED', updatedAt: { gte: todayStart } } }),
      this.prisma.pickupBooking.groupBy({ by: ['currentStatus'], _count: true }),
      this.prisma.pickupBooking.groupBy({ by: ['destinationBranchId'], _count: true }),
      this.prisma.pickupBooking.groupBy({ by: ['assignedDriverId'], where: { currentStatus: 'COMPLETED', assignedDriverId: { not: null } }, _count: true }),
    ]);

    const completedRows = await this.prisma.pickupBooking.findMany({
      where: { currentStatus: 'COMPLETED' },
      select: { createdAt: true, updatedAt: true },
      take: 100,
    });
    const averagePickupCompletionMinutes =
      completedRows.length === 0
        ? 0
        : Math.round(
            completedRows.reduce((sum, row) => sum + (row.updatedAt.getTime() - row.createdAt.getTime()) / 60000, 0) /
              completedRows.length,
          );

    const drivers = await this.prisma.driverProfile.findMany({ include: { user: true, branch: true } });
    const branches = await this.prisma.branch.findMany();
    return {
      cards: {
        totalToday,
        futureScheduled,
        unassigned,
        active,
        delayed,
        completed,
        cancelled,
        averagePickupCompletionMinutes,
        driverUtilisation: drivers.length ? Math.round((active / drivers.length) * 100) : 0,
      },
      charts: {
        statusDistribution: statusGroups.map((g) => ({ label: g.currentStatus, value: g._count })),
        branchVolume: branchGroups.map((g) => ({ label: branches.find((b) => b.id === g.destinationBranchId)?.name ?? g.destinationBranchId, value: g._count })),
        driverCompleted: driverCompleted.map((g) => ({ label: drivers.find((d) => d.id === g.assignedDriverId)?.user.name ?? 'Unassigned', value: g._count })),
        dailyTrend: await this.dailyTrend(),
      },
    };
  }

  async report(name: string, query: Record<string, string | undefined>) {
    const where: Prisma.PickupBookingWhereInput = {};
    if (query.status) where.currentStatus = query.status as BookingStatus;
    if (query.branchId) where.destinationBranchId = query.branchId;
    const bookings = await this.prisma.pickupBooking.findMany({
      where,
      include: { destinationBranch: true, assignedDriver: { include: { user: true } } },
      orderBy: { scheduledPickupAt: 'desc' },
      take: 500,
    });
    return {
      name,
      rows: bookings.map((b) => ({
        referenceNumber: b.referenceNumber,
        scheduledPickupAt: b.scheduledPickupAt,
        customerName: b.customerName,
        phone: b.primaryPhone,
        vehicle: b.vehicleRegistrationNumber,
        branch: b.destinationBranch.name,
        driver: b.assignedDriver?.user.name ?? '',
        status: b.currentStatus,
        priority: b.priority,
      })),
    };
  }

  toCsv(rows: Record<string, unknown>[]) {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    return [headers.join(','), ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
  }

  private async dailyTrend() {
    const rows = await this.prisma.pickupBooking.findMany({
      orderBy: { scheduledPickupAt: 'asc' },
      select: { scheduledPickupAt: true, currentStatus: true },
      take: 200,
    });
    const counts = new Map<string, number>();
    for (const row of rows) {
      const key = row.scheduledPickupAt.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].map(([label, value]) => ({ label, value }));
  }
}
