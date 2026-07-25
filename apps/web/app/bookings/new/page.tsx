'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingCreateSchema, type BookingCreateInput } from '@karsenz/validation';
import { Shell } from '../../../components/shell';
import { Card, ErrorBox, Field, PageTitle } from '../../../components/ui';
import { api } from '../../../lib/api';

export default function NewBookingPage() {
  const router = useRouter();
  const branches = useQuery({ queryKey: ['branches'], queryFn: () => api<any[]>('/branches') });
  const form = useForm<BookingCreateInput>({
    resolver: zodResolver(bookingCreateSchema) as any,
    defaultValues: {
      scheduledPickupAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16) as any,
      preferredTimeSlot: 'MORNING',
      customerName: 'New Demo Customer',
      primaryPhone: '9876501234',
      pickupAddress: '45, Adyar Main Road',
      city: 'Chennai',
      postalCode: '600020',
      vehicleRegistrationNumber: `TN09ZZ${Math.floor(1000 + Math.random() * 8000)}`,
      vehicleManufacturer: 'Hyundai',
      vehicleModel: 'i20',
      vehicleYear: 2021,
      fuelType: 'Petrol',
      transmissionType: 'Manual',
      serviceComplaint: 'Future pickup for periodic service',
      priority: 'NORMAL',
      bookingSource: 'PHONE',
    },
  });
  const create = useMutation({
    mutationFn: (values: BookingCreateInput) =>
      api<any>('/bookings', {
        method: 'POST',
        body: JSON.stringify({ ...values, scheduledPickupAt: new Date(values.scheduledPickupAt).toISOString() }),
      }),
    onSuccess: (booking) => router.push(`/bookings/${booking.id}`),
  });
  return (
    <Shell>
      <PageTitle title="Create Future Pickup Booking" />
      <Card>
        {create.error && <ErrorBox error={create.error} />}
        <form onSubmit={form.handleSubmit((v) => create.mutate(v as BookingCreateInput))} className="grid gap-4 md:grid-cols-2">
          <Field label="Scheduled pickup"><input type="datetime-local" {...form.register('scheduledPickupAt')} /></Field>
          <Field label="Time slot"><select {...form.register('preferredTimeSlot')}><option>MORNING</option><option>AFTERNOON</option><option>EVENING</option><option>CUSTOM</option></select></Field>
          <Field label="Customer name"><input {...form.register('customerName')} /></Field>
          <Field label="Primary phone"><input {...form.register('primaryPhone')} /></Field>
          <Field label="Alternate phone"><input {...form.register('alternatePhone')} /></Field>
          <Field label="Pickup address"><input {...form.register('pickupAddress')} /></Field>
          <Field label="Landmark"><input {...form.register('landmark')} /></Field>
          <Field label="City"><input {...form.register('city')} /></Field>
          <Field label="Postal code"><input {...form.register('postalCode')} /></Field>
          <Field label="Vehicle registration"><input {...form.register('vehicleRegistrationNumber')} /></Field>
          <Field label="Manufacturer"><input {...form.register('vehicleManufacturer')} /></Field>
          <Field label="Model"><input {...form.register('vehicleModel')} /></Field>
          <Field label="Year"><input type="number" {...form.register('vehicleYear', { valueAsNumber: true })} /></Field>
          <Field label="Fuel type"><input {...form.register('fuelType')} /></Field>
          <Field label="Transmission"><input {...form.register('transmissionType')} /></Field>
          <Field label="Destination branch"><select {...form.register('destinationBranchId')}><option value="">Select branch</option>{branches.data?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
          <Field label="Priority"><select {...form.register('priority')}><option>NORMAL</option><option>HIGH</option><option>URGENT</option><option>LOW</option></select></Field>
          <Field label="Source"><select {...form.register('bookingSource')}><option>PHONE</option><option>WHATSAPP</option><option>WALK_IN</option></select></Field>
          <Field label="Service complaint"><textarea {...form.register('serviceComplaint')} /></Field>
          <Field label="Pickup instructions"><textarea {...form.register('pickupInstructions')} /></Field>
          <div className="md:col-span-2">
            {Object.values(form.formState.errors).length > 0 && <p className="mb-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">Please correct the highlighted booking details.</p>}
            <button disabled={create.isPending} className="min-h-11 rounded-md bg-slate-900 px-4 font-semibold text-white">{create.isPending ? 'Creating...' : 'Create booking'}</button>
          </div>
        </form>
      </Card>
    </Shell>
  );
}
