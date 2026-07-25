import { z } from 'zod';
import { PRIORITIES, TIME_SLOTS } from '@karsenz/shared-types';

export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Use a 10 digit Indian mobile number');

export const bookingCreateSchema = z.object({
  scheduledPickupAt: z.string().min(1, 'Scheduled pickup date and time is required'),
  preferredTimeSlot: z.enum(TIME_SLOTS),
  customTimeSlot: z.string().optional().nullable(),
  customerName: z.string().min(2),
  primaryPhone: phoneSchema,
  alternatePhone: phoneSchema.optional().or(z.literal('')).nullable(),
  pickupAddress: z.string().min(5),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2),
  postalCode: z.string().min(5).max(10),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  vehicleRegistrationNumber: z.string().min(4),
  vehicleManufacturer: z.string().min(2),
  vehicleModel: z.string().min(1),
  vehicleYear: z.coerce.number().int().min(1990).max(2100),
  fuelType: z.string().min(2),
  transmissionType: z.string().min(2),
  serviceComplaint: z.string().min(3),
  pickupInstructions: z.string().optional().nullable(),
  destinationBranchId: z.string().uuid(),
  priority: z.enum(PRIORITIES).default('NORMAL'),
  bookingSource: z.string().default('PHONE'),
  internalNotes: z.string().optional().nullable(),
});

export const inspectionSchema = z.object({
  odometerReading: z.coerce.number().int().min(0),
  fuelLevel: z.string().min(1),
  exteriorCondition: z.string().min(1),
  interiorCondition: z.string().min(1),
  existingScratches: z.string().optional().nullable(),
  existingDents: z.string().optional().nullable(),
  windshieldCondition: z.string().min(1),
  tyreCondition: z.string().min(1),
  warningLights: z.string().optional().nullable(),
  numberOfKeysReceived: z.coerce.number().int().min(0),
  rcBookReceived: z.coerce.boolean(),
  insuranceCopyReceived: z.coerce.boolean(),
  accessoriesReceived: z.string().optional().nullable(),
  customerBelongings: z.string().optional().nullable(),
  additionalNotes: z.string().optional().nullable(),
  customerAcknowledgementName: z.string().min(2),
  customerAcknowledged: z.coerce.boolean().refine(Boolean, 'Customer acknowledgement is required'),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type InspectionInput = z.infer<typeof inspectionSchema>;
