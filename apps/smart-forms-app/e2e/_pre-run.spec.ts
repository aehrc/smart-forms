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

test('launch without questionnaire context, select a questionnaire and create a new response', async ({
  page
}) => {
  // Launch app without questionnaire context
  const fetchQPromise = page.waitForResponse(
    `${PLAYWRIGHT_FORMS_SERVER_URL}/Questionnaire?_count=100&_sort=-date&`
  );

  const launchUrl = `${PLAYWRIGHT_APP_URL}/launch?iss=https%3A%2F%2Fproxy.smartforms.io%2Fv%2Fr4%2Ffhir&launch=${LAUNCH_PARAM_WITHOUT_Q}`;
  await page.goto(launchUrl);
  expect((await fetchQPromise).status()).toBe(200);

  // Search MBS715 title
  const fetchQByTitlePromise = page.waitForResponse(
    `${PLAYWRIGHT_FORMS_SERVER_URL}/Questionnaire?_count=100&_sort=-date&title:contains=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
  );
  await page
    .getByTestId('search-field-questionnaires')
    .locator('input')
    .fill('Aboriginal and Torres Strait Islander Health Check');
  await fetchQByTitlePromise;

  // Open first MBS715 questionnaire
  const populatePromise = page.waitForResponse(
    new RegExp(/^https:\/\/proxy\.smartforms\.io\/v\/r4\/fhir\/(Observation|Condition)\?.+$/)
  );
  await page
    .getByTestId('questionnaire-list-row')
    .getByText('Aboriginal and Torres Strait Islander Health Check')
    .first()
    .click();
  await page.getByTestId('button-create-response').click();
  expect((await populatePromise).status()).toBe(200);

  // Test radio item
  await expect(page.getByTestId('q-item-choice-radio-answer-value-set-box')).toContainText(
    'Eligible for health check'
  );
  await page.getByTestId('q-item-choice-radio-answer-value-set-box').first().click();
  await expect(page.getByTestId('updating-indicator')).toBeInViewport();

  // Save progress
  const savePromise = page.waitForResponse(`${PLAYWRIGHT_EHR_URL}/QuestionnaireResponse`);
  await page.getByTestId('renderer-operation-item').getByText('Save Progress').click();
  const saveResponse = await savePromise;
  expect(saveResponse.status()).toBe(201);
  await expect(page.getByText('Response saved')).toBeInViewport();

  // Go back to questionnaires
  await page.getByTestId('renderer-operation-item').getByText('Back to Questionnaires').click();
});
