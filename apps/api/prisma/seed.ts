import { PrismaClient, RoleName, TimeSlot, Priority, BookingStatus, DriverState } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEV_PASSWORD = 'Karsenz@123';

async function main() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.workshopHandover.deleteMany(),
    prisma.pickupConfirmation.deleteMany(),
    prisma.inspectionImage.deleteMany(),
    prisma.vehicleInspection.deleteMany(),
    prisma.bookingStatusHistory.deleteMany(),
    prisma.driverAssignment.deleteMany(),
    prisma.pickupBooking.deleteMany(),
    prisma.driverAvailability.deleteMany(),
    prisma.vehicle.deleteMany(),
    prisma.customerAddress.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.driverProfile.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.role.deleteMany(),
    prisma.user.deleteMany(),
    prisma.branch.deleteMany(),
    prisma.applicationSetting.deleteMany(),
  ]);

  const roles = new Map<RoleName, string>();
  for (const name of Object.values(RoleName)) {
    const role = await prisma.role.create({ data: { name, description: `${name} role` } });
    roles.set(name, role.id);
  }

  const branches = await Promise.all([
    prisma.branch.create({ data: { name: 'Karsenz Anna Nagar', code: 'ANN', address: '2nd Avenue, Anna Nagar, Chennai', phone: '9000000101', dailyCapacity: 8 } }),
    prisma.branch.create({ data: { name: 'Karsenz Velachery', code: 'VEL', address: '100 Feet Road, Velachery, Chennai', phone: '9000000102', dailyCapacity: 7 } }),
    prisma.branch.create({ data: { name: 'Karsenz OMR', code: 'OMR', address: 'Rajiv Gandhi Salai, Thoraipakkam, Chennai', phone: '9000000103', dailyCapacity: 9 } }),
  ]);

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  async function user(email: string, name: string, role: RoleName, branchId = branches[0].id) {
    return prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        branchId,
        roles: { create: { roleId: roles.get(role)! } },
      },
    });
  }

  await user('superadmin@karsenz.local', 'Super Admin', RoleName.SUPER_ADMIN);
  await user('admin@karsenz.local', 'Admin User', RoleName.ADMIN);
  const cs = await user('customer.service@karsenz.local', 'Customer Service', RoleName.CUSTOMER_SERVICE);
  await user('dispatcher@karsenz.local', 'Dispatch Coordinator', RoleName.DISPATCHER);
  await user('workshop@karsenz.local', 'Workshop Receiver', RoleName.WORKSHOP);
  await user('manager@karsenz.local', 'Operations Manager', RoleName.MANAGER);

  const drivers = [];
  for (let i = 1; i <= 6; i++) {
    const driverUser = await user(`driver${i}@karsenz.local`, `Driver ${i}`, RoleName.DRIVER, branches[i % branches.length].id);
    drivers.push(
      await prisma.driverProfile.create({
        data: {
          userId: driverUser.id,
          branchId: branches[i % branches.length].id,
          licenseNumber: `TN-DL-2026-00${i}`,
          phone: `98765000${10 + i}`,
          currentState: i === 6 ? DriverState.OFFLINE : DriverState.AVAILABLE,
        },
      }),
    );
  }

  const today = new Date();
  today.setHours(10, 0, 0, 0);
  for (const driver of drivers) {
    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + offset);
      const shiftStart = new Date(date);
      shiftStart.setHours(9, 0, 0, 0);
      const shiftEnd = new Date(date);
      shiftEnd.setHours(18, 0, 0, 0);
      await prisma.driverAvailability.create({
        data: { driverProfileId: driver.id, branchId: driver.branchId, date, shiftStart, shiftEnd, state: driver.currentState },
      });
    }
  }

  const areas = ['Adyar', 'Mylapore', 'T Nagar', 'Porur', 'Tambaram', 'Guindy', 'Perungudi', 'Nungambakkam', 'Chromepet', 'Besant Nagar'];
  const makes = ['Hyundai', 'Maruti Suzuki', 'Honda', 'Toyota', 'Tata', 'Mahindra'];
  const statuses: BookingStatus[] = [
    'UNASSIGNED',
    'ASSIGNED',
    'DRIVER_ACCEPTED',
    'TRIP_STARTED',
    'ARRIVED_AT_CUSTOMER',
    'INSPECTION_IN_PROGRESS',
    'VEHICLE_PICKED_UP',
    'EN_ROUTE_TO_BRANCH',
    'ARRIVED_AT_BRANCH',
    'HANDOVER_PENDING',
    'COMPLETED',
    'CANCELLED',
    'RESCHEDULED',
  ];

  for (let i = 1; i <= 24; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: `Demo Customer ${i}`,
        primaryPhone: `98765${String(10000 + i).slice(-5)}`,
        alternatePhone: `91234${String(20000 + i).slice(-5)}`,
      },
    });
    const area = areas[i % areas.length];
    await prisma.customerAddress.create({
      data: {
        customerId: customer.id,
        line1: `${12 + i}, ${area} Main Road`,
        landmark: `${area} Signal`,
        city: 'Chennai',
        postalCode: `6000${String(10 + (i % 80)).padStart(2, '0')}`,
        latitude: 13.02 + i / 1000,
        longitude: 80.2 + i / 1000,
      },
    });
    const vehicle = await prisma.vehicle.create({
      data: {
        customerId: customer.id,
        registrationNumber: `TN${String(10 + (i % 20)).padStart(2, '0')}AB${String(3000 + i)}`,
        manufacturer: makes[i % makes.length],
        model: ['i20', 'Swift', 'City', 'Innova', 'Nexon', 'XUV300'][i % 6],
        year: 2016 + (i % 8),
        fuelType: i % 3 === 0 ? 'Diesel' : 'Petrol',
        transmissionType: i % 2 === 0 ? 'Manual' : 'Automatic',
      },
    });
    const schedule = new Date(today);
    schedule.setDate(today.getDate() + (i % 8) - 2);
    schedule.setHours(9 + (i % 8), i % 2 ? 30 : 0, 0, 0);
    const status = statuses[i % statuses.length];
    const driver = status === 'UNASSIGNED' || status === 'CANCELLED' || status === 'RESCHEDULED' ? null : drivers[i % drivers.length];
    const booking = await prisma.pickupBooking.create({
      data: {
        referenceNumber: `KPL-2026-${String(1000 + i)}`,
        scheduledPickupAt: schedule,
        preferredTimeSlot: (['MORNING', 'AFTERNOON', 'EVENING'] as TimeSlot[])[i % 3],
        customerId: customer.id,
        vehicleId: vehicle.id,
        customerName: customer.name,
        primaryPhone: customer.primaryPhone,
        alternatePhone: customer.alternatePhone,
        pickupAddress: `${12 + i}, ${area} Main Road`,
        landmark: `${area} Signal`,
        city: 'Chennai',
        postalCode: `6000${String(10 + (i % 80)).padStart(2, '0')}`,
        latitude: 13.02 + i / 1000,
        longitude: 80.2 + i / 1000,
        vehicleRegistrationNumber: vehicle.registrationNumber,
        vehicleManufacturer: vehicle.manufacturer,
        vehicleModel: vehicle.model,
        vehicleYear: vehicle.year,
        fuelType: vehicle.fuelType,
        transmissionType: vehicle.transmissionType,
        serviceComplaint: i % 2 ? 'Periodic service pickup' : 'Engine noise and general checkup',
        pickupInstructions: 'Call customer 20 minutes before arrival',
        destinationBranchId: branches[i % branches.length].id,
        assignedDriverId: driver?.id,
        priority: (['NORMAL', 'HIGH', 'LOW', 'URGENT'] as Priority[])[i % 4],
        bookingSource: i % 2 ? 'WHATSAPP' : 'PHONE',
        currentStatus: status,
        createdById: cs.id,
        cancellationReason: status === 'CANCELLED' ? 'Customer unavailable' : null,
        rescheduleReason: status === 'RESCHEDULED' ? 'Customer requested another slot' : null,
      },
    });
    await prisma.bookingStatusHistory.create({ data: { bookingId: booking.id, fromStatus: null, toStatus: status, changedById: cs.id, notes: 'Seed status' } });
    if (driver) {
      await prisma.driverAssignment.create({ data: { bookingId: booking.id, driverProfileId: driver.id, assignedById: cs.id, active: !['COMPLETED'].includes(status) } });
    }
    if (['INSPECTION_IN_PROGRESS', 'VEHICLE_PICKED_UP', 'EN_ROUTE_TO_BRANCH', 'ARRIVED_AT_BRANCH', 'HANDOVER_PENDING', 'COMPLETED'].includes(status)) {
      await prisma.vehicleInspection.create({
        data: {
          bookingId: booking.id,
          odometerReading: 42000 + i * 100,
          fuelLevel: 'Half',
          exteriorCondition: 'Minor scratches recorded',
          interiorCondition: 'Clean',
          windshieldCondition: 'Good',
          tyreCondition: 'Good',
          numberOfKeysReceived: 2,
          rcBookReceived: true,
          insuranceCopyReceived: true,
          accessoriesReceived: 'Floor mats',
          customerAcknowledgementName: customer.name,
          customerAcknowledged: true,
          customerAcknowledgementAt: new Date(),
        },
      });
      await prisma.pickupConfirmation.create({ data: { bookingId: booking.id, name: customer.name } });
    }
    if (status === 'COMPLETED') {
      await prisma.workshopHandover.create({
        data: {
          bookingId: booking.id,
          confirmedOdometer: 42000 + i * 100,
          confirmedKeys: 2,
          receivedAt: new Date(),
          receivingEmployee: 'Workshop Receiver',
          accepted: true,
          acceptedById: cs.id,
        },
      });
    }
  }

  await prisma.applicationSetting.create({
    data: {
      key: 'notification.providers',
      value: { console: true, whatsappLink: true, whatsappBusinessApi: 'placeholder' },
    },
  });

  console.log(`Seed complete. Development password for all demo users: ${DEV_PASSWORD}`);
}

main().finally(async () => prisma.$disconnect());
