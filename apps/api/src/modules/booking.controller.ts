import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { BookingService } from './booking.service';
import { AssignDriverDto, CreateBookingDto, HandoverDto, InspectionDto, ReasonDto, TransitionDto } from './dto';
import { CurrentUser, RequestUser, Roles } from './security';
import { StorageService } from './storage.service';
import { PrismaService } from './prisma.service';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookings: BookingService,
    private readonly storage: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(@Query() query: Record<string, string>, @CurrentUser() user: RequestUser) {
    return { data: await this.bookings.list(query, user) };
  }

  @Post()
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.CUSTOMER_SERVICE, RoleName.DISPATCHER)
  async create(@Body() dto: CreateBookingDto, @CurrentUser() user: RequestUser) {
    return { data: await this.bookings.create(dto, user) };
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return { data: await this.bookings.get(id, user) };
  }

  @Patch(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.CUSTOMER_SERVICE, RoleName.DISPATCHER)
  async update(@Param('id') id: string, @Body() dto: Partial<CreateBookingDto>) {
    return { data: await this.prisma.pickupBooking.update({ where: { id }, data: dto as any }) };
  }

  @Post(':id/assign')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.DISPATCHER)
  async assign(@Param('id') id: string, @Body() dto: AssignDriverDto, @CurrentUser() user: RequestUser) {
    return { data: await this.bookings.assign(id, dto, user) };
  }

  @Post(':id/reject')
  @Roles(RoleName.DRIVER)
  async reject(@Param('id') id: string, @Body() dto: ReasonDto, @CurrentUser() user: RequestUser) {
    return { data: await this.bookings.reject(id, dto.reason, user) };
  }

  @Post(':id/status')
  async transition(@Param('id') id: string, @Body() dto: TransitionDto, @CurrentUser() user: RequestUser) {
    return { data: await this.bookings.transition(id, dto.status, user, dto.notes) };
  }

  @Post(':id/reschedule')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.CUSTOMER_SERVICE, RoleName.DISPATCHER)
  async reschedule(@Param('id') id: string, @Body() dto: { scheduledPickupAt: string; reason: string }, @CurrentUser() user: RequestUser) {
    return { data: await this.bookings.reschedule(id, dto.scheduledPickupAt, dto.reason, user) };
  }

  @Post(':id/cancel')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.CUSTOMER_SERVICE, RoleName.DISPATCHER)
  async cancel(@Param('id') id: string, @Body() dto: ReasonDto, @CurrentUser() user: RequestUser) {
    return { data: await this.bookings.cancel(id, dto.reason, user) };
  }

  @Post(':id/inspection')
  @Roles(RoleName.DRIVER, RoleName.SUPER_ADMIN)
  async inspection(@Param('id') id: string, @Body() dto: InspectionDto, @CurrentUser() user: RequestUser) {
    return { data: await this.bookings.inspection(id, dto, user) };
  }

  @Post(':id/inspection-image')
  @Roles(RoleName.DRIVER, RoleName.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadInspectionImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const saved = await this.storage.saveInspectionImage(file);
    const inspection = await this.prisma.vehicleInspection.findUnique({ where: { bookingId: id } });
    if (!inspection) return { data: saved };
    return { data: await this.prisma.inspectionImage.create({ data: { ...saved, inspectionId: inspection.id } }) };
  }

  @Post(':id/handover')
  @Roles(RoleName.WORKSHOP, RoleName.SUPER_ADMIN, RoleName.ADMIN)
  async acceptHandover(@Param('id') id: string, @Body() dto: HandoverDto, @CurrentUser() user: RequestUser) {
    return { data: await this.bookings.acceptHandover(id, dto, user) };
  }
}
