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

const questionnaireTitle = 'Aboriginal and Torres Strait Islander Health Check';

test.beforeEach(async ({ page }) => {
  // Launch app without questionnaire context
  const fetchQPromise = page.waitForResponse(
    `${PLAYWRIGHT_FORMS_SERVER_URL}/Questionnaire?_count=100&_sort=-date&`
  );
  const launchUrl = `${PLAYWRIGHT_APP_URL}/launch?iss=https%3A%2F%2Fproxy.smartforms.io%2Fv%2Fr4%2Ffhir&launch=${LAUNCH_PARAM_WITHOUT_Q}`;
  await page.goto(launchUrl);
  expect((await fetchQPromise).status()).toBe(200);

  // Wait for responses to load
  const fetchQRPromise = page.waitForResponse(
    new RegExp(/^https:\/\/proxy\.smartforms\.io\/v\/r4\/fhir\/QuestionnaireResponse\?.+$/)
  );
  await page.getByTestId('dashboard-table-pagination').locator('div').getByRole('combobox').click();
  await page.getByRole('option', { name: '50' }).click();
  await page.getByTestId('questionnaire-list-row').getByText(questionnaireTitle).first().click();
  const fetchQRResponse = await fetchQRPromise;
  expect(fetchQRResponse.status()).toBe(200);
});

test('View response from MBS715', async ({ page }) => {
  await expect(page.getByTestId('button-view-responses')).toBeEnabled();
  await page.getByTestId('button-view-responses').click();

  // Open responses page
  await expect(page.getByTestId('responses-list-toolbar')).toContainText(questionnaireTitle);
  await page.getByTestId('response-list-row').getByText(questionnaireTitle).first().click();

  // Open response
  await expect(page.getByTestId('button-open-response')).toBeEnabled();
  await page.getByTestId('button-open-response').click();

  //
  await expect(page).toHaveURL(`${PLAYWRIGHT_APP_URL}/viewer`);
  await expect(page.getByTestId('response-preview-box')).toContainText(questionnaireTitle);
});
