'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inspectionSchema, type InspectionInput } from '@karsenz/validation';
import { Shell } from '../../../../../components/shell';
import { Card, ErrorBox, Field, PageTitle } from '../../../../../components/ui';
import { api } from '../../../../../lib/api';

export default function InspectionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const form = useForm<InspectionInput>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      odometerReading: 45000,
      fuelLevel: 'Half',
      exteriorCondition: 'Minor scratches documented',
      interiorCondition: 'Clean',
      windshieldCondition: 'Good',
      tyreCondition: 'Good',
      numberOfKeysReceived: 2,
      rcBookReceived: true,
      insuranceCopyReceived: true,
      accessoriesReceived: 'Floor mats',
      customerAcknowledgementName: 'Demo Customer',
      customerAcknowledged: true,
    },
  });
  const submit = useMutation({
    mutationFn: async (values: InspectionInput) => {
      await api(`/bookings/${id}/inspection`, { method: 'POST', body: JSON.stringify(values) });
      await api(`/bookings/${id}/status`, { method: 'POST', body: JSON.stringify({ status: 'VEHICLE_PICKED_UP' }) });
    },
    onSuccess: () => router.push(`/driver/jobs/${id}`),
  });
  return (
    <Shell>
      <PageTitle title="Vehicle Inspection" />
      <Card className="mx-auto max-w-xl">
        {submit.error && <ErrorBox error={submit.error} />}
        <form onSubmit={form.handleSubmit((v) => submit.mutate(v))} className="grid gap-3">
          <Field label="Odometer"><input type="number" {...form.register('odometerReading', { valueAsNumber: true })} /></Field>
          <Field label="Fuel level"><input {...form.register('fuelLevel')} /></Field>
          <Field label="Exterior condition"><textarea {...form.register('exteriorCondition')} /></Field>
          <Field label="Interior condition"><textarea {...form.register('interiorCondition')} /></Field>
          <Field label="Existing scratches"><textarea {...form.register('existingScratches')} /></Field>
          <Field label="Existing dents"><textarea {...form.register('existingDents')} /></Field>
          <Field label="Windshield condition"><input {...form.register('windshieldCondition')} /></Field>
          <Field label="Tyre condition"><input {...form.register('tyreCondition')} /></Field>
          <Field label="Warning lights"><input {...form.register('warningLights')} /></Field>
          <Field label="Keys received"><input type="number" {...form.register('numberOfKeysReceived', { valueAsNumber: true })} /></Field>
          <label className="flex items-center gap-2"><input type="checkbox" {...form.register('rcBookReceived')} /> RC book received</label>
          <label className="flex items-center gap-2"><input type="checkbox" {...form.register('insuranceCopyReceived')} /> Insurance copy received</label>
          <Field label="Accessories"><textarea {...form.register('accessoriesReceived')} /></Field>
          <Field label="Customer belongings"><textarea {...form.register('customerBelongings')} /></Field>
          <Field label="Additional notes"><textarea {...form.register('additionalNotes')} /></Field>
          <Field label="Customer acknowledgement name"><input {...form.register('customerAcknowledgementName')} /></Field>
          <label className="flex items-center gap-2"><input type="checkbox" {...form.register('customerAcknowledged')} /> Customer acknowledged pickup condition</label>
          <button className="min-h-12 rounded-md bg-slate-900 px-4 font-semibold text-white">Submit inspection and mark picked up</button>
        </form>
      </Card>
    </Shell>
  );
}
