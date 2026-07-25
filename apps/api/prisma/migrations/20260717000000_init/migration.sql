-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SERVICE', 'DISPATCHER', 'DRIVER', 'WORKSHOP', 'MANAGER');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'UNASSIGNED', 'ASSIGNED', 'DRIVER_ACCEPTED', 'DRIVER_REJECTED', 'TRIP_STARTED', 'ARRIVED_AT_CUSTOMER', 'INSPECTION_IN_PROGRESS', 'VEHICLE_PICKED_UP', 'EN_ROUTE_TO_BRANCH', 'ARRIVED_AT_BRANCH', 'HANDOVER_PENDING', 'COMPLETED', 'RESCHEDULED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "TimeSlot" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DriverState" AS ENUM ('AVAILABLE', 'ASSIGNED', 'BUSY', 'ON_LEAVE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "branchId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" "RoleName" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Chennai',
    "phone" TEXT NOT NULL,
    "dailyCapacity" INTEGER NOT NULL DEFAULT 8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "currentState" "DriverState" NOT NULL DEFAULT 'AVAILABLE',
    "activeAssignmentId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverAvailability" (
    "id" UUID NOT NULL,
    "driverProfileId" UUID NOT NULL,
    "branchId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shiftStart" TIMESTAMP(3) NOT NULL,
    "shiftEnd" TIMESTAMP(3) NOT NULL,
    "state" "DriverState" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,

    CONSTRAINT "DriverAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "primaryPhone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "line1" TEXT NOT NULL,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmissionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupBooking" (
    "id" UUID NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "scheduledPickupAt" TIMESTAMP(3) NOT NULL,
    "preferredTimeSlot" "TimeSlot" NOT NULL,
    "customTimeSlot" TEXT,
    "customerId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "customerName" TEXT NOT NULL,
    "primaryPhone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "vehicleRegistrationNumber" TEXT NOT NULL,
    "vehicleManufacturer" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehicleYear" INTEGER NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmissionType" TEXT NOT NULL,
    "serviceComplaint" TEXT NOT NULL,
    "pickupInstructions" TEXT,
    "destinationBranchId" UUID NOT NULL,
    "assignedDriverId" UUID,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "bookingSource" TEXT NOT NULL,
    "currentStatus" "BookingStatus" NOT NULL DEFAULT 'UNASSIGNED',
    "internalNotes" TEXT,
    "cancellationReason" TEXT,
    "rescheduleReason" TEXT,
    "createdById" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverAssignment" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "driverProfileId" UUID NOT NULL,
    "assignedById" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DriverAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingStatusHistory" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "fromStatus" "BookingStatus",
    "toStatus" "BookingStatus" NOT NULL,
    "changedById" UUID NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleInspection" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "odometerReading" INTEGER NOT NULL,
    "fuelLevel" TEXT NOT NULL,
    "exteriorCondition" TEXT NOT NULL,
    "interiorCondition" TEXT NOT NULL,
    "existingScratches" TEXT,
    "existingDents" TEXT,
    "windshieldCondition" TEXT NOT NULL,
    "tyreCondition" TEXT NOT NULL,
    "warningLights" TEXT,
    "numberOfKeysReceived" INTEGER NOT NULL,
    "rcBookReceived" BOOLEAN NOT NULL,
    "insuranceCopyReceived" BOOLEAN NOT NULL,
    "accessoriesReceived" TEXT,
    "customerBelongings" TEXT,
    "additionalNotes" TEXT,
    "customerAcknowledgementName" TEXT NOT NULL,
    "customerAcknowledged" BOOLEAN NOT NULL,
    "customerAcknowledgementAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionImage" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupConfirmation" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL DEFAULT 'CHECKBOX',

    CONSTRAINT "PickupConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopHandover" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "confirmedOdometer" INTEGER NOT NULL,
    "confirmedKeys" INTEGER NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "receivingEmployee" TEXT NOT NULL,
    "discrepancyNotes" TEXT,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "acceptedById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkshopHandover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "bookingId" UUID,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "providerRef" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "bookingId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationSetting" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_key" ON "Permission"("action");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_userId_key" ON "DriverProfile"("userId");

-- CreateIndex
CREATE INDEX "DriverAvailability_date_state_idx" ON "DriverAvailability"("date", "state");

-- CreateIndex
CREATE INDEX "DriverAvailability_driverProfileId_date_idx" ON "DriverAvailability"("driverProfileId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_primaryPhone_key" ON "Customer"("primaryPhone");

-- CreateIndex
CREATE INDEX "Customer_primaryPhone_idx" ON "Customer"("primaryPhone");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_registrationNumber_key" ON "Vehicle"("registrationNumber");

-- CreateIndex
CREATE INDEX "Vehicle_registrationNumber_idx" ON "Vehicle"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PickupBooking_referenceNumber_key" ON "PickupBooking"("referenceNumber");

-- CreateIndex
CREATE INDEX "PickupBooking_scheduledPickupAt_idx" ON "PickupBooking"("scheduledPickupAt");

-- CreateIndex
CREATE INDEX "PickupBooking_currentStatus_idx" ON "PickupBooking"("currentStatus");

-- CreateIndex
CREATE INDEX "PickupBooking_destinationBranchId_scheduledPickupAt_idx" ON "PickupBooking"("destinationBranchId", "scheduledPickupAt");

-- CreateIndex
CREATE INDEX "PickupBooking_assignedDriverId_scheduledPickupAt_idx" ON "PickupBooking"("assignedDriverId", "scheduledPickupAt");

-- CreateIndex
CREATE INDEX "PickupBooking_vehicleRegistrationNumber_idx" ON "PickupBooking"("vehicleRegistrationNumber");

-- CreateIndex
CREATE INDEX "PickupBooking_primaryPhone_idx" ON "PickupBooking"("primaryPhone");

-- CreateIndex
CREATE INDEX "DriverAssignment_driverProfileId_assignedAt_idx" ON "DriverAssignment"("driverProfileId", "assignedAt");

-- CreateIndex
CREATE INDEX "DriverAssignment_bookingId_active_idx" ON "DriverAssignment"("bookingId", "active");

-- CreateIndex
CREATE INDEX "BookingStatusHistory_bookingId_createdAt_idx" ON "BookingStatusHistory"("bookingId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleInspection_bookingId_key" ON "VehicleInspection"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "PickupConfirmation_bookingId_key" ON "PickupConfirmation"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopHandover_bookingId_key" ON "WorkshopHandover"("bookingId");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationSetting_key_key" ON "ApplicationSetting"("key");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverProfile" ADD CONSTRAINT "DriverProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverProfile" ADD CONSTRAINT "DriverProfile_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverAvailability" ADD CONSTRAINT "DriverAvailability_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverAvailability" ADD CONSTRAINT "DriverAvailability_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupBooking" ADD CONSTRAINT "PickupBooking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupBooking" ADD CONSTRAINT "PickupBooking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupBooking" ADD CONSTRAINT "PickupBooking_destinationBranchId_fkey" FOREIGN KEY ("destinationBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupBooking" ADD CONSTRAINT "PickupBooking_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "DriverProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupBooking" ADD CONSTRAINT "PickupBooking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverAssignment" ADD CONSTRAINT "DriverAssignment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "PickupBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverAssignment" ADD CONSTRAINT "DriverAssignment_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingStatusHistory" ADD CONSTRAINT "BookingStatusHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "PickupBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleInspection" ADD CONSTRAINT "VehicleInspection_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "PickupBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionImage" ADD CONSTRAINT "InspectionImage_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "VehicleInspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupConfirmation" ADD CONSTRAINT "PickupConfirmation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "PickupBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopHandover" ADD CONSTRAINT "WorkshopHandover_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "PickupBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "PickupBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "PickupBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

