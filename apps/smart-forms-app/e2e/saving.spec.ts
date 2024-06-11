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
import { PLAYWRIGHT_APP_URL, PLAYWRIGHT_EHR_URL } from './globals';

const questionnaireTitle = 'Aboriginal and Torres Strait Islander Health Check';

test.beforeEach(async ({ page }) => {
  // Open first MBS715 questionnaire via launch context
  const populatePromise = page.waitForResponse(
    new RegExp(/^https:\/\/proxy\.smartforms\.io\/v\/r4\/fhir\/(Observation|Condition)\?.+$/)
  );
  const launchUrl = `${PLAYWRIGHT_APP_URL}/launch?iss=https%3A%2F%2Fproxy.smartforms.io%2Fv%2Fr4%2Ffhir&launch=WzAsInBhdC1zZiIsInByaW1hcnktcGV0ZXIiLCJBVVRPIiwwLDAsMCwiZmhpclVzZXIgb25saW5lX2FjY2VzcyBvcGVuaWQgcHJvZmlsZSBwYXRpZW50L0NvbmRpdGlvbi5ycyBwYXRpZW50L09ic2VydmF0aW9uLnJzIGxhdW5jaCBwYXRpZW50L0VuY291bnRlci5ycyBwYXRpZW50L1F1ZXN0aW9ubmFpcmVSZXNwb25zZS5jcnVkcyBwYXRpZW50L1BhdGllbnQucnMiLCJodHRwOi8vbG9jYWxob3N0OjQxNzMvIiwiYTU3ZDkwZTMtNWY2OS00YjkyLWFhMmUtMjk5MjE4MDg2M2MxIiwiIiwiIiwiIiwiIiwwLDEsIntcInJvbGVcIjpcInF1ZXN0aW9ubmFpcmUtcmVuZGVyLW9uLWxhdW5jaFwiLFwiY2Fub25pY2FsXCI6XCJodHRwOi8vd3d3LmhlYWx0aC5nb3YuYXUvYXNzZXNzbWVudHMvbWJzLzcxNXwwLjEuMC1hc3NlbWJsZWRcIixcInR5cGVcIjpcIlF1ZXN0aW9ubmFpcmVcIn0iLGZhbHNlXQ`;
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
