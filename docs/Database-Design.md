# Database Design

The PostgreSQL schema is normalized around customers, vehicles, bookings, assignments, inspections and handovers. UUIDs are used for primary keys. Frequently filtered fields such as booking reference, scheduled date, status, branch, assigned driver and vehicle registration are indexed.

Core entities:

- `User`, `Role`, `Permission`, `UserRole`
- `Branch`
- `DriverProfile`, `DriverAvailability`
- `Customer`, `CustomerAddress`, `Vehicle`
- `PickupBooking`
- `DriverAssignment`
- `BookingStatusHistory`
- `VehicleInspection`, `InspectionImage`, `PickupConfirmation`
- `WorkshopHandover`
- `Notification`
- `AuditLog`
- `ApplicationSetting`

Transactions are used by the service layer for assignment, reassignment, status transition, inspection completion, cancellation, rescheduling and handover.

`PickupBooking.version` supports optimistic concurrency for later UI conflict handling.
