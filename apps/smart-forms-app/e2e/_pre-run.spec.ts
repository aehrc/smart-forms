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
import {
  LAUNCH_PARAM_WITHOUT_Q,
  PLAYWRIGHT_APP_URL,
  PLAYWRIGHT_EHR_URL,
  PLAYWRIGHT_FORMS_SERVER_URL
} from './globals';

test('Launch without questionnaire context, select a questionnaire and create a new response', async ({
  page
}) => {
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

  // On /dashboard/questionnaires route, search for Dev715
  const fetchQDev715Promise = page.waitForResponse(
    (response) =>
      response.url().startsWith(`${PLAYWRIGHT_FORMS_SERVER_URL}/Questionnaire`) &&
      response.url().includes('_sort=-date') &&
      response.url().includes('title:contains=Dev715')
  );

  await page.getByTestId('search-field-questionnaires').locator('input').fill('Dev715');
  const fetchQDev715Response = await fetchQDev715Promise;

  expect(fetchQDev715Response.status()).toBe(200);

  // Open first Dev715 questionnaire, pre-population should be triggered
  const populatePromise = page.waitForResponse(
    new RegExp(/^https:\/\/proxy\.smartforms\.io\/v\/r4\/fhir\/(Observation|Condition)\?.+$/)
  );
  await page.getByTestId('questionnaire-list-row').getByText('Dev715').first().click();
  await page.getByTestId('button-create-response').click();
  const populateResponse = await populatePromise;

  expect(populateResponse.status()).toBe(200);

  // Test radio item to see if questionnaire is rendered correctly
  await expect(page.getByTestId('q-item-choice-radio-answer-value-set-box')).toContainText(
    'Eligible for health check'
  );
  await page.getByTestId('q-item-choice-radio-answer-value-set-box').first().click();
  await expect(page.getByTestId('updating-indicator')).toBeInViewport();

  // Save as draft
  const saveAsDraftPromise = page.waitForResponse(`${PLAYWRIGHT_EHR_URL}/QuestionnaireResponse`);
  await page.getByTestId('renderer-operation-item').getByText('Save Progress').click();
  const saveAsDraftPromiseResponse = await saveAsDraftPromise;
  expect(saveAsDraftPromiseResponse.status()).toBe(201);
  await expect(page.getByText('Response saved')).toBeInViewport();

  // Go back to /dashboard/questionnaires
  await page.getByTestId('renderer-operation-item').getByText('Back to Questionnaires').click();
});
