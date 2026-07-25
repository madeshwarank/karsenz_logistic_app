import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus, Priority, TimeSlot } from '@prisma/client';
import { IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, Max, Min } from 'class-validator';

export class LoginDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @IsNotEmpty() password!: string;
}

export class CreateBookingDto {
  @ApiProperty() @IsDateString() scheduledPickupAt!: string;
  @ApiProperty({ enum: TimeSlot }) @IsEnum(TimeSlot) preferredTimeSlot!: TimeSlot;
  @ApiPropertyOptional() @IsOptional() @IsString() customTimeSlot?: string;
  @ApiProperty() @IsString() customerName!: string;
  @ApiProperty() @Matches(/^[6-9]\d{9}$/) primaryPhone!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() alternatePhone?: string;
  @ApiProperty() @IsString() pickupAddress!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() landmark?: string;
  @ApiProperty() @IsString() city!: string;
  @ApiProperty() @IsString() postalCode!: string;
  @ApiPropertyOptional() @IsOptional() latitude?: number;
  @ApiPropertyOptional() @IsOptional() longitude?: number;
  @ApiProperty() @IsString() vehicleRegistrationNumber!: string;
  @ApiProperty() @IsString() vehicleManufacturer!: string;
  @ApiProperty() @IsString() vehicleModel!: string;
  @ApiProperty() @IsInt() @Min(1990) @Max(2100) vehicleYear!: number;
  @ApiProperty() @IsString() fuelType!: string;
  @ApiProperty() @IsString() transmissionType!: string;
  @ApiProperty() @IsString() serviceComplaint!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pickupInstructions?: string;
  @ApiProperty() @IsUUID() destinationBranchId!: string;
  @ApiProperty({ enum: Priority }) @IsEnum(Priority) priority!: Priority;
  @ApiProperty() @IsString() bookingSource!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() internalNotes?: string;
}

export class AssignDriverDto {
  @ApiProperty() @IsUUID() driverProfileId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

export class TransitionDto {
  @ApiProperty({ enum: BookingStatus }) @IsEnum(BookingStatus) status!: BookingStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ReasonDto {
  @ApiProperty() @IsString() reason!: string;
}

export class InspectionDto {
  @ApiProperty() @IsInt() @Min(0) odometerReading!: number;
  @ApiProperty() @IsString() fuelLevel!: string;
  @ApiProperty() @IsString() exteriorCondition!: string;
  @ApiProperty() @IsString() interiorCondition!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() existingScratches?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() existingDents?: string;
  @ApiProperty() @IsString() windshieldCondition!: string;
  @ApiProperty() @IsString() tyreCondition!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() warningLights?: string;
  @ApiProperty() @IsInt() @Min(0) numberOfKeysReceived!: number;
  @ApiProperty() @IsBoolean() rcBookReceived!: boolean;
  @ApiProperty() @IsBoolean() insuranceCopyReceived!: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() accessoriesReceived?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() customerBelongings?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() additionalNotes?: string;
  @ApiProperty() @IsString() customerAcknowledgementName!: string;
  @ApiProperty() @IsBoolean() customerAcknowledged!: boolean;
}

export class HandoverDto {
  @ApiProperty() @IsInt() @Min(0) confirmedOdometer!: number;
  @ApiProperty() @IsInt() @Min(0) confirmedKeys!: number;
  @ApiProperty() @IsDateString() receivedAt!: string;
  @ApiProperty() @IsString() receivingEmployee!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() discrepancyNotes?: string;
}
