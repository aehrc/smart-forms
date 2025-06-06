/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import { LAUNCH_PARAM_WITHOUT_Q, PLAYWRIGHT_APP_URL, PLAYWRIGHT_FORMS_SERVER_URL } from './globals';

const questionnaireTitle = 'Dev715';

test.beforeEach(async ({ page }) => {
  // Launch from Smart EHR launcher (without questionnaire context)
  const fetchQsPromise = page.waitForResponse(
    (response) =>
      response.url().startsWith(`${PLAYWRIGHT_FORMS_SERVER_URL}/Questionnaire`) &&
      response.url().includes('_sort=-date')
  );

  const launchUrl = `${PLAYWRIGHT_APP_URL}/launch?iss=https%3A%2F%2Fproxy.smartforms.io%2Fv%2Fr4%2Ffhir&launch=${LAUNCH_PARAM_WITHOUT_Q}`;
  console.log('Playwright navigating to: ', launchUrl);
  await page.goto(launchUrl);

  const fetchQsResponse = await fetchQsPromise;
  expect(fetchQsResponse.status()).toBe(200);
});

test('Select Dev715 and view its first response', async ({ page }) => {
  // Select Dev715 and view its responses
  const fetchQROfSelectedQPromise = page.waitForResponse(
    new RegExp(/^https:\/\/proxy\.smartforms\.io\/v\/r4\/fhir\/QuestionnaireResponse\?.+$/)
  );
  await page.getByTestId('dashboard-table-pagination').locator('div').getByRole('combobox').click();
  await page.getByRole('option', { name: '50' }).click();
  await page.getByTestId('questionnaire-list-row').getByText(questionnaireTitle).first().click();

  const fetchQRResponse = await fetchQROfSelectedQPromise;
  expect(fetchQRResponse.status()).toBe(200);

  // Click on "View Responses" button
  await expect(page.getByTestId('button-view-responses')).toBeEnabled();
  await page.getByTestId('button-view-responses').click();

  // Click on the first response in the list and open it
  await expect(page.getByTestId('responses-list-toolbar')).toContainText(questionnaireTitle);
  await page.getByTestId('response-list-row').getByText(questionnaireTitle).first().click();

  await expect(page.getByTestId('button-open-response')).toBeEnabled();
  await page.getByTestId('button-open-response').click();

  // On /viewer route, the response preview should be displayed
  await expect(page).toHaveURL(`${PLAYWRIGHT_APP_URL}/viewer`);
  await expect(page.getByTestId('response-preview-box')).toContainText(questionnaireTitle);
});

test('View all responses for patient in context', async ({ page }) => {
  const responsesButton = page.locator('a[data-test="renderer-operation-item"]', {
    hasText: 'Responses'
  });
  await expect(responsesButton).toBeEnabled();
  await responsesButton.click();

  // On /responses route, the responses list should be displayed
  await expect(page).toHaveURL(`${PLAYWRIGHT_APP_URL}/dashboard/responses`);
});
