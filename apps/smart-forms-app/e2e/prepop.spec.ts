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
import { PLAYWRIGHT_EHR_URL } from './globals';
import { goToPlayground, selectQuestionnaireInPlayground } from './utils/playground';

test.beforeEach(async ({ page }) => {
  // Go to playground
  await goToPlayground(page);

  // Configure launch settings
  await page.getByTestId('launch-settings-button-playground').click();
  await page.getByTestId('source-fhir-server-url-field-playground').locator('input').fill('');
  await page
    .getByTestId('source-fhir-server-url-field-playground')
    .locator('input')
    .fill(PLAYWRIGHT_EHR_URL);

  // Validate source FHIR server url
  const metadataPromise = page.waitForResponse(
    (response) =>
      response.url() === `${PLAYWRIGHT_EHR_URL}/metadata` && response.request().method() === 'GET'
  );
  await page.getByTestId('validate-url-button-playground').click();
  const metadataResponse = await metadataPromise;
  expect(metadataResponse.status()).toBe(200);
  await expect(page.getByTestId('source-fhir-server-url-field-playground')).toContainText(
    'URL validated'
  );

  // Set source FHIR server url
  const patientPromise = page.waitForResponse(
    (response) =>
      response.url().startsWith(`${PLAYWRIGHT_EHR_URL}/Patient`) &&
      response.request().method() === 'GET'
  );

  const practitionerPromise = page.waitForResponse(
    (response) =>
      response.url().startsWith(`${PLAYWRIGHT_EHR_URL}/Practitioner`) &&
      response.request().method() === 'GET'
  );
  await page.getByTestId('set-fhir-server-button-playground').click();
  const patientResponse = await patientPromise;
  expect(patientResponse.status()).toBe(200);
  const practitionerResponse = await practitionerPromise;
  expect(practitionerResponse.status()).toBe(200);

  // Set patient and user
  await page.getByTestId('patient-picker-playground').click();
  await page.getByRole('option', { name: 'Mrs. Smart Form', exact: true }).click();

  await page.getByTestId('user-picker-playground').click();
  await page.getByRole('option', { name: 'Dr Peter Primary', exact: true }).click();
  await page.getByTestId('save-launch-settings-button-playground').click();
});

test('Pre-pop into CVDRiskCalculator questionnaire', async ({ page }) => {
  // Select and build CVDRiskCalculator questionnaire in playground
  await selectQuestionnaireInPlayground(page, {
    pickerInput: 'calculatedexpressioncvdriskcalculatorprepop',
    questionnaireId: 'CalculatedExpressionCvdRiskCalculatorPrepop',
    questionnaireUrl: 'https://smartforms.csiro.au/docs/sdc/population/calculated-expression-2'
  });

  // Ensure questionnaire is built
  await expect(page.getByTestId('q-item-display-box')).toContainText(
    'NOTE: The Australian guideline for assessing and managing cardiovascular disease risk recommends the use of the online Australian CVD risk calculator.'
  );

  // Perform pre-population
  const populatePromise = page.waitForResponse(
    (response) =>
      /^https:\/\/proxy\.smartforms\.io\/v\/r4\/fhir\/(Observation|Condition)\?.+$/.test(
        response.url()
      ) && response.request().method() === 'GET'
  );
  await page.getByTestId('prepop-button-playground').click();
  const populateResponse = await populatePromise;
  expect(populateResponse.status()).toBe(200);

  // Check calculated value
  const cvdRiskValueLinkId = 'integer-cvd-result';
  await expect(
    page.getByTestId('q-item-integer-box').locator(`#${cvdRiskValueLinkId}`)
  ).toHaveValue('23');
});

test('Pre-pop to test terminology resolving logic', async ({ page }) => {
  // Select and build SelectivePrePopTester questionnaire in playground
  await selectQuestionnaireInPlayground(page, {
    pickerInput: 'selectiveprepoptester',
    questionnaireId: 'SelectivePrePopTester',
    questionnaireUrl: 'https://smartforms.csiro.au/docs/tester/prepop-1'
  });

  // Ensure questionnaire is built
  await expect(page.getByTestId('q-item-display-box')).toContainText(
    'This questionnaire is used by Playwright to do regression testing'
  );

  // Perform pre-population
  const expandPromise = page.waitForResponse(
    (response) =>
      /^https:\/\/tx\.ontoserver\.csiro\.au\/fhir\/ValueSet\/\$expand\?.+$/.test(response.url()) &&
      response.request().method() === 'GET'
  );

  await page.getByTestId('prepop-button-playground').click();
  const expandResponse = await expandPromise;
  expect(expandResponse.status()).toBe(200);

  // Check pre-populated values
  const genderAvsUrlValueLinkId = 'choice-gender-avs-url';
  await expect(
    page
      .getByTestId('q-item-choice-select-answer-value-set-box')
      .locator(`#${genderAvsUrlValueLinkId}`)
  ).toHaveValue('Female');

  const genderAvsContainedValueLinkId = 'choice-gender-avs-contained';
  await expect(
    page
      .getByTestId('q-item-choice-select-answer-value-set-box')
      .locator(`#${genderAvsContainedValueLinkId}`)
  ).toHaveValue('Female');

  const medicalHistoryConditionValueLinkId = 'open-choice-medical-history-condition';

  const elements = await page.locator(`#${medicalHistoryConditionValueLinkId}`).all();
  for (const element of elements) {
    const inputValue = await element.inputValue();

    // Test if the input values contains at least one alphabetic character
    // If it's fully numeric, it means the valueCoding.code is pre-populated instead of valueCoding.display
    // the logic in sdc-populate, automatically $lookup and assigns display to codings that lack them, which means that part is failing in this case
    expect(/^\d+$/.test(inputValue)).toBeFalsy();
  }
});
