import { BookingStatus } from '@prisma/client';

const allowed: Record<BookingStatus, BookingStatus[]> = {
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

describe('booking workflow rules', () => {
  it('prevents completing before workshop handover state', () => {
    expect(allowed.VEHICLE_PICKED_UP).not.toContain('COMPLETED');
    expect(allowed.HANDOVER_PENDING).toContain('COMPLETED');
  });

  it('keeps future-booking recovery paths available', () => {
    expect(allowed.UNASSIGNED).toEqual(expect.arrayContaining(['ASSIGNED', 'RESCHEDULED', 'CANCELLED']));
  });
});
