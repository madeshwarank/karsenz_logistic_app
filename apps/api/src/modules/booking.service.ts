import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, DriverState, Prisma, RoleName } from '@prisma/client';
import { AssignDriverDto, CreateBookingDto, HandoverDto, InspectionDto } from './dto';
import { PrismaService } from './prisma.service';
import { RequestUser } from './security';

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  DRAFT: ['SCHEDULED', 'UNASSIGNED', 'CANCELLED'],
  SCHEDULED: ['UNASSIGNED', 'ASSIGNED', 'RESCHEDULED', 'CANCELLED'],
  UNASSIGNED: ['ASSIGNED', 'RESCHEDULED', 'CANCELLED'],
  ASSIGNED: ['DRIVER_ACCEPTED', 'DRIVER_REJECTED', 'RESCHEDULED', 'CANCELLED'],
  DRIVER_ACCEPTED: ['TRIP_STARTED', 'DRIVER_REJECTED', 'CANCELLED'],
  DRIVER_REJECTED: ['UNASSIGNED', 'ASSIGNED', 'CANCELLED'],
  TRIP_STARTED: ['ARRIVED_AT_CUSTOMER', 'FAILED'],
  ARRIVED_AT_CUSTOMER: ['INSPECTION_IN_PROGRESS', 'FAILED'],
  INSPECTION_IN_PROGRESS: ['VEHICLE_PICKED_UP', 'FAILED'],
  VEHICLE_PICKED_UP: ['EN_ROUTE_TO_BRANCH'],
  EN_ROUTE_TO_BRANCH: ['ARRIVED_AT_BRANCH'],
  ARRIVED_AT_BRANCH: ['HANDOVER_PENDING'],
  HANDOVER_PENDING: ['COMPLETED'],
  COMPLETED: [],
  RESCHEDULED: ['UNASSIGNED', 'ASSIGNED', 'CANCELLED'],
  CANCELLED: [],
  FAILED: ['RESCHEDULED', 'CANCELLED'],
};

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto, user: RequestUser) {
    const scheduled = new Date(dto.scheduledPickupAt);
    if (Number.isNaN(scheduled.getTime()) || scheduled < new Date(Date.now() - 60_000)) {
      throw new BadRequestException('Scheduled pickup cannot be in the past');
    }
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { primaryPhone: dto.primaryPhone },
        update: { name: dto.customerName, alternatePhone: dto.alternatePhone || null },
        create: { name: dto.customerName, primaryPhone: dto.primaryPhone, alternatePhone: dto.alternatePhone || null },
      });
      await tx.customerAddress.create({
        data: {
          customerId: customer.id,
          line1: dto.pickupAddress,
          landmark: dto.landmark,
          city: dto.city,
          postalCode: dto.postalCode,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      });
      const vehicle = await tx.vehicle.upsert({
        where: { registrationNumber: dto.vehicleRegistrationNumber.toUpperCase() },
        update: {
          customerId: customer.id,
          manufacturer: dto.vehicleManufacturer,
          model: dto.vehicleModel,
          year: dto.vehicleYear,
          fuelType: dto.fuelType,
          transmissionType: dto.transmissionType,
        },
        create: {
          customerId: customer.id,
          registrationNumber: dto.vehicleRegistrationNumber.toUpperCase(),
          manufacturer: dto.vehicleManufacturer,
          model: dto.vehicleModel,
          year: dto.vehicleYear,
          fuelType: dto.fuelType,
          transmissionType: dto.transmissionType,
        },
      });
      const referenceNumber = `KPL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const booking = await tx.pickupBooking.create({
        data: {
          ...dto,
          referenceNumber,
          scheduledPickupAt: scheduled,
          alternatePhone: dto.alternatePhone || null,
          customerId: customer.id,
          vehicleId: vehicle.id,
          createdById: user.sub,
          currentStatus: 'UNASSIGNED',
          vehicleRegistrationNumber: dto.vehicleRegistrationNumber.toUpperCase(),
        },
      });
      await this.history(tx, booking.id, null, 'UNASSIGNED', user.sub, 'Booking created');
      await this.audit(tx, user.sub, booking.id, 'booking.created', 'PickupBooking', booking.id, { scheduledPickupAt: dto.scheduledPickupAt });
      return booking;
    });
  }

  async list(query: Record<string, string | undefined>, user: RequestUser) {
    const where: Prisma.PickupBookingWhereInput = {};
    if (query.status) where.currentStatus = query.status as BookingStatus;
    if (query.branchId) where.destinationBranchId = query.branchId;
    if (query.priority) where.priority = query.priority as any;
    if (query.date) {
      const start = new Date(query.date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.scheduledPickupAt = { gte: start, lt: end };
    }
    if (query.search) {
      where.OR = [
        { referenceNumber: { contains: query.search, mode: 'insensitive' } },
        { primaryPhone: { contains: query.search } },
        { vehicleRegistrationNumber: { contains: query.search.toUpperCase() } },
        { customerName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (user.roles.includes(RoleName.DRIVER)) {
      where.assignedDriverId = user.driverProfileId ?? '00000000-0000-0000-0000-000000000000';
    }
    const page = Number(query.page ?? 1);
    const take = Math.min(Number(query.take ?? 50), 100);
    const [items, total] = await Promise.all([
      this.prisma.pickupBooking.findMany({
        where,
        orderBy: { scheduledPickupAt: 'asc' },
        skip: (page - 1) * take,
        take,
        include: { destinationBranch: true, assignedDriver: { include: { user: true } } },
      }),
      this.prisma.pickupBooking.count({ where }),
    ]);
    return { items, total, page, take };
  }

  async get(id: string, user: RequestUser) {
    const booking = await this.prisma.pickupBooking.findUnique({
      where: { id },
      include: {
        destinationBranch: true,
        assignedDriver: { include: { user: true } },
        assignments: { include: { driverProfile: { include: { user: true } } }, orderBy: { assignedAt: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        inspection: { include: { images: true } },
        handover: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (user.roles.includes(RoleName.DRIVER) && booking.assignedDriverId !== user.driverProfileId) {
      throw new ForbiddenException('Drivers can view only assigned bookings');
    }
    return booking;
  }

  async assign(id: string, dto: AssignDriverDto, user: RequestUser) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.pickupBooking.findUnique({ where: { id } });
      if (!booking) throw new NotFoundException('Booking not found');
      const driver = await tx.driverProfile.findUnique({ where: { id: dto.driverProfileId } });
      if (!driver || !driver.isActive) throw new BadRequestException('Driver is not active');

      const dayStart = new Date(booking.scheduledPickupAt);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const workload = await tx.pickupBooking.count({
        where: {
          assignedDriverId: driver.id,
          scheduledPickupAt: { gte: dayStart, lt: dayEnd },
          currentStatus: { notIn: ['CANCELLED', 'COMPLETED', 'FAILED'] },
        },
      });
      if (workload >= 5) throw new BadRequestException('Driver workload warning: selected driver already has 5 jobs');

      await tx.driverAssignment.updateMany({ where: { bookingId: id, active: true }, data: { active: false } });
      const assignment = await tx.driverAssignment.create({
        data: { bookingId: id, driverProfileId: driver.id, assignedById: user.sub },
      });
      await tx.driverProfile.update({ where: { id: driver.id }, data: { currentState: DriverState.ASSIGNED, activeAssignmentId: assignment.id } });
      const updated = await tx.pickupBooking.update({
        where: { id },
        data: { assignedDriverId: driver.id, currentStatus: 'ASSIGNED', version: { increment: 1 } },
      });
      await this.history(tx, id, booking.currentStatus, 'ASSIGNED', user.sub, dto.reason ?? 'Driver assigned');
      await this.audit(tx, user.sub, id, 'assignment.created', 'DriverAssignment', assignment.id, { driverProfileId: driver.id });
      return updated;
    });
  }

  async transition(id: string, toStatus: BookingStatus, user: RequestUser, notes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.pickupBooking.findUnique({ where: { id }, include: { inspection: true, handover: true } });
      if (!booking) throw new NotFoundException('Booking not found');
      if (user.roles.includes(RoleName.DRIVER) && booking.assignedDriverId !== user.driverProfileId) throw new ForbiddenException();
      if (!ALLOWED_TRANSITIONS[booking.currentStatus].includes(toStatus)) {
        throw new BadRequestException(`Invalid transition ${booking.currentStatus} -> ${toStatus}`);
      }
      if (toStatus === 'VEHICLE_PICKED_UP' && !booking.inspection) {
        throw new BadRequestException('Inspection is required before pickup completion');
      }
      if (toStatus === 'COMPLETED' && !booking.handover?.accepted) {
        throw new BadRequestException('Workshop handover acceptance is required before completion');
      }
      const updated = await tx.pickupBooking.update({
        where: { id },
        data: { currentStatus: toStatus, version: { increment: 1 } },
      });
      await this.history(tx, id, booking.currentStatus, toStatus, user.sub, notes);
      await this.audit(tx, user.sub, id, 'booking.status_changed', 'PickupBooking', id, { from: booking.currentStatus, to: toStatus });
      return updated;
    });
  }

  async reject(id: string, reason: string, user: RequestUser) {
    await this.prisma.driverAssignment.updateMany({
      where: { bookingId: id, driverProfileId: user.driverProfileId ?? undefined, active: true },
      data: { rejectedAt: new Date(), rejectionReason: reason, active: false },
    });
    return this.transition(id, 'DRIVER_REJECTED', user, reason);
  }

  async reschedule(id: string, scheduledPickupAt: string, reason: string, user: RequestUser) {
    const scheduled = new Date(scheduledPickupAt);
    if (scheduled < new Date(Date.now() - 60_000)) throw new BadRequestException('Cannot reschedule into the past');
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.pickupBooking.findUnique({ where: { id } });
      if (!booking) throw new NotFoundException();
      const updated = await tx.pickupBooking.update({
        where: { id },
        data: { scheduledPickupAt: scheduled, rescheduleReason: reason, currentStatus: 'RESCHEDULED', assignedDriverId: null, version: { increment: 1 } },
      });
      await tx.driverAssignment.updateMany({ where: { bookingId: id, active: true }, data: { active: false } });
      await this.history(tx, id, booking.currentStatus, 'RESCHEDULED', user.sub, reason);
      await this.audit(tx, user.sub, id, 'booking.rescheduled', 'PickupBooking', id, { reason, scheduledPickupAt });
      return updated;
    });
  }

  async cancel(id: string, reason: string, user: RequestUser) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.pickupBooking.findUnique({ where: { id } });
      if (!booking) throw new NotFoundException();
      const updated = await tx.pickupBooking.update({
        where: { id },
        data: { cancellationReason: reason, currentStatus: 'CANCELLED', version: { increment: 1 } },
      });
      await this.history(tx, id, booking.currentStatus, 'CANCELLED', user.sub, reason);
      await this.audit(tx, user.sub, id, 'booking.cancelled', 'PickupBooking', id, { reason });
      return updated;
    });
  }

  async inspection(id: string, dto: InspectionDto, user: RequestUser) {
    if (!dto.customerAcknowledged) throw new BadRequestException('Customer acknowledgement is required');
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.pickupBooking.findUnique({ where: { id } });
      if (!booking) throw new NotFoundException();
      const inspection = await tx.vehicleInspection.upsert({
        where: { bookingId: id },
        update: { ...dto, customerAcknowledgementAt: new Date() },
        create: { ...dto, bookingId: id, customerAcknowledgementAt: new Date() },
      });
      await tx.pickupConfirmation.upsert({
        where: { bookingId: id },
        update: { name: dto.customerAcknowledgementName, confirmedAt: new Date() },
        create: { bookingId: id, name: dto.customerAcknowledgementName },
      });
      if (booking.currentStatus !== 'INSPECTION_IN_PROGRESS') {
        await tx.pickupBooking.update({ where: { id }, data: { currentStatus: 'INSPECTION_IN_PROGRESS' } });
        await this.history(tx, id, booking.currentStatus, 'INSPECTION_IN_PROGRESS', user.sub, 'Inspection submitted');
      }
      await this.audit(tx, user.sub, id, 'inspection.submitted', 'VehicleInspection', inspection.id, {});
      return inspection;
    });
  }

  async acceptHandover(id: string, dto: HandoverDto, user: RequestUser) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.pickupBooking.findUnique({ where: { id } });
      if (!booking) throw new NotFoundException();
      if (!['ARRIVED_AT_BRANCH', 'HANDOVER_PENDING'].includes(booking.currentStatus)) {
        throw new BadRequestException('Booking must be at branch before handover');
      }
      const handover = await tx.workshopHandover.upsert({
        where: { bookingId: id },
        update: { ...dto, receivedAt: new Date(dto.receivedAt), accepted: true, acceptedById: user.sub },
        create: { ...dto, receivedAt: new Date(dto.receivedAt), accepted: true, acceptedById: user.sub, bookingId: id },
      });
      await tx.pickupBooking.update({ where: { id }, data: { currentStatus: 'COMPLETED', version: { increment: 1 } } });
      await this.history(tx, id, booking.currentStatus, 'COMPLETED', user.sub, 'Workshop handover accepted');
      await this.audit(tx, user.sub, id, 'handover.completed', 'WorkshopHandover', handover.id, {});
      return handover;
    });
  }

  private async history(tx: Prisma.TransactionClient, bookingId: string, fromStatus: BookingStatus | null, toStatus: BookingStatus, userId: string, notes?: string | null) {
    await tx.bookingStatusHistory.create({ data: { bookingId, fromStatus, toStatus, changedById: userId, notes } });
  }

  private async audit(tx: Prisma.TransactionClient, actorId: string, bookingId: string | null, action: string, entityType: string, entityId: string, metadata: object) {
    await tx.auditLog.create({ data: { actorId, bookingId, action, entityType, entityId, metadata } });
  }
}
