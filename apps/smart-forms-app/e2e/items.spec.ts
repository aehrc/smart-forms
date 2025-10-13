/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect, test } from '@playwright/test';
import { PLAYWRIGHT_APP_URL, PLAYWRIGHT_FORMS_SERVER_URL } from './globals';
import { fillBitOfEverything } from './utils/fillBitOfEverything';

const stringInput = 'Test string input';
const textInput = 'Test text input';
const dateInput = '25/12/2023';
const { dtDateInput, dtTimeInput, dtPeriodInput } = {
  dtDateInput: '25/12/2023',
  dtTimeInput: '11:30',
  dtPeriodInput: 'AM'
};
const integerInput = '123';
const decimalInput = '123.45';
const urlInput = 'https://www.google.com';

test.describe('BitOfEverything questionnaire', () => {
  test('enter inputs in /renderer', async ({ page }) => {
    // Go to Smart Forms app without launching from EHR
    await page.goto(PLAYWRIGHT_APP_URL);

    // On /dashboard/questionnaires route, search for BitOfEverything and create a new response
    const fetchQBitOfEverythingPromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(`${PLAYWRIGHT_FORMS_SERVER_URL}/Questionnaire`) &&
        response.url().includes('_sort=-date') &&
        response.url().includes('title:contains=Bit') &&
        response.request().method() === 'GET'
    );

    await page.getByTestId('search-field-questionnaires').locator('input').fill('Bit');
    const fetchQBitOfEverythingResponse = await fetchQBitOfEverythingPromise;
    expect(fetchQBitOfEverythingResponse.status()).toBe(200);

    await page.getByTestId('questionnaire-list-row').getByText('Bit of everything').first().click();
    await page.getByTestId('button-create-response').click();

    // Fill in the BitOfEverything questionnaire
    await fillBitOfEverything(page, {
      stringInput,
      textInput,
      dateInput,
      dtDateInput,
      dtTimeInput,
      dtPeriodInput,
      integerInput,
      decimalInput,
      urlInput
    });
  });
});
