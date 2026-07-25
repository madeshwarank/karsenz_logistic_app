# API Specification

Base path: `/api/v1`

Swagger UI is exposed at `/api/docs`.

All protected responses use:

```json
{
  "data": {},
  "meta": {},
  "correlationId": "..."
}
```

Core endpoints:

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /users`
- `GET /branches`
- `GET /drivers`
- `GET /drivers/availability`
- `GET /customers`
- `GET /vehicles`
- `GET /bookings`
- `POST /bookings`
- `GET /bookings/:id`
- `PATCH /bookings/:id`
- `POST /bookings/:id/reschedule`
- `POST /bookings/:id/cancel`
- `POST /bookings/:id/assign`
- `POST /bookings/:id/reject`
- `POST /bookings/:id/status`
- `POST /bookings/:id/inspection`
- `POST /uploads/inspection-image`
- `GET /handovers`
- `POST /handovers/:bookingId/accept`
- `POST /handovers/:bookingId/discrepancy`
- `GET /dashboard/summary`
- `GET /reports/:name`
- `GET /reports/:name.csv`
- `GET /notifications`
- `GET /audit-logs`
