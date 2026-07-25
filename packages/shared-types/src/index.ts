export const ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'CUSTOMER_SERVICE',
  'DISPATCHER',
  'DRIVER',
  'WORKSHOP',
  'MANAGER',
] as const;

export type RoleName = (typeof ROLES)[number];

export const BOOKING_STATUSES = [
  'DRAFT',
  'SCHEDULED',
  'UNASSIGNED',
  'ASSIGNED',
  'DRIVER_ACCEPTED',
  'DRIVER_REJECTED',
  'TRIP_STARTED',
  'ARRIVED_AT_CUSTOMER',
  'INSPECTION_IN_PROGRESS',
  'VEHICLE_PICKED_UP',
  'EN_ROUTE_TO_BRANCH',
  'ARRIVED_AT_BRANCH',
  'HANDOVER_PENDING',
  'COMPLETED',
  'RESCHEDULED',
  'CANCELLED',
  'FAILED',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const TIME_SLOTS = ['MORNING', 'AFTERNOON', 'EVENING', 'CUSTOM'] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const DRIVER_STATES = ['AVAILABLE', 'ASSIGNED', 'BUSY', 'ON_LEAVE', 'OFFLINE'] as const;
export type DriverState = (typeof DRIVER_STATES)[number];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: RoleName[];
  driverProfileId?: string | null;
  branchId?: string | null;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  correlationId?: string;
}

export interface BookingListItem {
  id: string;
  referenceNumber: string;
  scheduledPickupAt: string;
  preferredTimeSlot: TimeSlot;
  customerName: string;
  primaryPhone: string;
  pickupAddress: string;
  city: string;
  vehicleRegistrationNumber: string;
  vehicleManufacturer: string;
  vehicleModel: string;
  destinationBranchName: string;
  assignedDriverName?: string | null;
  priority: Priority;
  currentStatus: BookingStatus;
}
