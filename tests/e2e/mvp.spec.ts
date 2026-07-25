import { test, expect } from '@playwright/test';

const password = 'Karsenz@123';

async function login(page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').selectOption(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/');
}

test('future booking to completed handover workflow', async ({ page }) => {
  await login(page, 'customer.service@karsenz.local');
  await page.goto('/bookings/new');
  await page.getByLabel('Destination branch').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create booking' }).click();
  await expect(page.getByText(/KPL-/)).toBeVisible();
  const bookingUrl = page.url();

  await login(page, 'dispatcher@karsenz.local');
  await page.goto('/dispatch');
  await expect(page.getByText('Unassigned and future pickups')).toBeVisible();
  const firstSelect = page.locator('select').first();
  await firstSelect.selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Assign' }).first().click();

  await login(page, 'driver1@karsenz.local');
  await page.goto('/driver/jobs');
  await expect(page.getByText(/Demo Customer|New Demo Customer/)).toBeVisible();

  await page.goto(bookingUrl.replace('/bookings/', '/driver/jobs/'));
  for (const action of ['DRIVER ACCEPTED', 'TRIP STARTED', 'ARRIVED AT CUSTOMER']) {
    await page.getByRole('button', { name: action }).click();
  }
  await page.getByRole('link', { name: 'Complete inspection' }).click();
  await page.getByRole('button', { name: 'Submit inspection and mark picked up' }).click();
  for (const action of ['EN ROUTE TO BRANCH', 'ARRIVED AT BRANCH', 'HANDOVER PENDING']) {
    await page.getByRole('button', { name: action }).click();
  }

  await login(page, 'workshop@karsenz.local');
  await page.goto('/handovers');
  await page.getByRole('button', { name: 'Accept handover' }).first().click();

  await login(page, 'manager@karsenz.local');
  await expect(page.getByText('completed')).toBeVisible();
});
