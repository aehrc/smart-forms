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
import { LAUNCH_PARAM_WITH_Q, PLAYWRIGHT_APP_URL, PLAYWRIGHT_EHR_URL } from './globals';

const questionnaireTitle = 'Aboriginal and Torres Strait Islander Health Check';

test.beforeEach(async ({ page }) => {
  // Open first MBS715 questionnaire via launch context
  const populatePromise = page.waitForResponse(
    new RegExp(/^https:\/\/proxy\.smartforms\.io\/v\/r4\/fhir\/(Observation|Condition)\?.+$/)
  );
  const launchUrl = `${PLAYWRIGHT_APP_URL}/launch?iss=https%3A%2F%2Fproxy.smartforms.io%2Fv%2Fr4%2Ffhir&launch=${LAUNCH_PARAM_WITH_Q}`;
  await page.goto(launchUrl);
  const populateResponse = await populatePromise;
  expect(populateResponse.status()).toBe(200);
});

test('Saving a response as draft then final', async ({ page }) => {
  // Go to Consent tab and click on a boolean item
  await page
    .getByTestId('renderer-tab-list')
    .locator('.MuiButtonBase-root')
    .getByText('Consent')
    .click();
  await page.getByTestId('q-item-boolean-box').first().locator('input').first().click();

  // Save as draft
  const saveDraftPromise = page.waitForResponse(`${PLAYWRIGHT_EHR_URL}/QuestionnaireResponse`);
  await page.getByTestId('renderer-operation-item').getByText('Save Progress').click();
  const saveDraftResponse = await saveDraftPromise;
  expect(saveDraftResponse.status()).toBe(201);
  await expect(page.getByText('Response saved')).toBeInViewport();

  // Select response in responses page
  await page.getByTestId('renderer-operation-item').getByText('View Existing Responses').click();
  await page.getByTestId('response-list-row').getByText('in-progress').first().click();
  await expect(page.getByTestId('button-open-response')).toBeEnabled();
  await page.getByTestId('button-open-response').click();

  // View response in viewer
  await expect(page).toHaveURL(`${PLAYWRIGHT_APP_URL}/viewer`);
  await expect(page.getByTestId('response-preview-box')).toContainText(questionnaireTitle);

  // Re-open the response
  await page.getByTestId('renderer-operation-item').getByText('Edit Response').click();
  await expect(page).toHaveURL(`${PLAYWRIGHT_APP_URL}/renderer`);

  // Save as final
  const saveFinalPromise = page.waitForResponse((response) =>
    response.url().startsWith(`${PLAYWRIGHT_EHR_URL}/QuestionnaireResponse/`)
  );
  await page.getByTestId('renderer-operation-item').getByText('Save as Final').click();
  await page.getByTestId('save-as-final-button').click();
  const saveFinalResponse = await saveFinalPromise;
  expect(saveFinalResponse.status()).toBe(200);
  await expect(page.getByText('Response saved as final')).toBeInViewport();
  await expect(page).toHaveURL(`${PLAYWRIGHT_APP_URL}/dashboard/existing`);
});
