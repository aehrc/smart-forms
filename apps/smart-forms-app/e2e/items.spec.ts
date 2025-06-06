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
import { PLAYWRIGHT_APP_URL, PLAYWRIGHT_FORMS_SERVER_URL } from './globals';
import { fillBitOfEverything } from './utils/fillBitOfEverything';
import { goToPlayground, selectQuestionnaireInPlayground } from './utils/playground';

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
const choiceAnswerOptionInput = 'option A';
const choiceAnswerValueSetInput = 'Tasmania';

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

  test('enter inputs in /playground', async ({ page }) => {
    // Select and build BitOfEverything questionnaire in playground
    await goToPlayground(page);
    await selectQuestionnaireInPlayground(page, {
      pickerInput: 'bitofeverything',
      questionnaireId: 'BitOfEverything',
      questionnaireUrl: 'http://fhir.telstrahealth.com/fast-forms/Questionnaire/bit-of-everything'
    });

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

    // Check QR if our inputs are valid
    await page.getByTestId('see-store-state-button-playground').click();

    // Assuming debug viewer is already on "updatableResponse" tab
    const debugViewerText = await page.getByTestId('debug-viewer').innerText();
    expect(debugViewerText.includes(`"valueString": "${stringInput}"`)).toBeTruthy();
    expect(debugViewerText.includes(`"valueString": "${textInput}"`)).toBeTruthy();
    expect(debugViewerText.includes(`"valueBoolean": true`)).toBeTruthy();

    expect(debugViewerText.includes(`"valueDate": "2023-12-25"`)).toBeTruthy();
    expect(debugViewerText.includes(`"valueDateTime": "2023-12-25T11:30:00`)).toBeTruthy();

    expect(debugViewerText.includes(`"valueInteger": ${integerInput}`)).toBeTruthy();
    expect(debugViewerText.includes(`"valueDecimal": ${decimalInput}`)).toBeTruthy();
    expect(debugViewerText.includes(`"valueUri": "${urlInput}"`)).toBeTruthy();

    expect(debugViewerText.includes(`"system": "http://example.org/coding-test"`)).toBeTruthy();
    expect(debugViewerText.includes(`"code": "a"`)).toBeTruthy();
    expect(debugViewerText.includes(`"display": "${choiceAnswerOptionInput}"`)).toBeTruthy();

    expect(
      debugViewerText.includes(`"system": "http://fhir.telstrahealth.com/tcm/CodeSystem/ARE_local"`)
    ).toBeTruthy();
    expect(debugViewerText.includes(`"code": "6"`)).toBeTruthy();
    expect(debugViewerText.includes(`"display": "${choiceAnswerValueSetInput}"`)).toBeTruthy();
  });
});

test.describe('OpenChoiceCheckboxAVS questionnaire', () => {
  test('enter inputs in /playground', async ({ page }) => {
    // Select and build OpenChoiceCheckboxAVS questionnaire in playground
    await goToPlayground(page);
    await selectQuestionnaireInPlayground(page, {
      pickerInput: 'OpenChoiceCheckboxAVS',
      questionnaireId: 'OpenChoiceCheckboxAVS',
      questionnaireUrl:
        'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/open-choice-checkbox-avs'
    });

    const openChoiceCheckboxLinkId = 'state-multi';

    // Test multi-select checkbox
    // Check on a defined option followed by the open label and see if it removes the initial option
    // Check two checkboxes
    await page
      .locator(
        `div[data-test="q-item-open-choice-checkbox-answer-value-set-box"][data-linkid="${openChoiceCheckboxLinkId}"]`
      )
      .locator('label:has-text("Australian Capital Territory")')
      .check();

    await page
      .locator(
        `div[data-test="q-item-open-choice-checkbox-answer-value-set-box"][data-linkid="${openChoiceCheckboxLinkId}"]`
      )
      .locator('label:has-text("Queensland")')
      .check();

    // Assert that both checkboxes are checked
    const isACTChecked = await page
      .locator(
        `div[data-test="q-item-open-choice-checkbox-answer-value-set-box"][data-linkid="${openChoiceCheckboxLinkId}"]`
      )
      .locator('label:has-text("Australian Capital Territory")')
      .locator('input[type="checkbox"]') // Assuming the checkbox is the input element inside the label
      .isChecked();

    const isQueenslandChecked = await page
      .locator(
        `div[data-test="q-item-open-choice-checkbox-answer-value-set-box"][data-linkid="${openChoiceCheckboxLinkId}"]`
      )
      .locator('label:has-text("Queensland")')
      .locator('input[type="checkbox"]')
      .isChecked();

    expect(isACTChecked).toBe(true);
    expect(isQueenslandChecked).toBe(true);

    // Check Open Label checkbox
    await page
      .locator(
        `div[data-test="q-item-open-choice-checkbox-answer-value-set-box"][data-linkid="${openChoiceCheckboxLinkId}"]`
      )
      .locator('label:has-text("Overseas state, please specify")')
      .check();

    // Assert that both checkboxes are checked once more, to verify the open label checkbox did not affect the other checkboxes
    const isACTCheckedAgain = await page
      .locator(
        `div[data-test="q-item-open-choice-checkbox-answer-value-set-box"][data-linkid="${openChoiceCheckboxLinkId}"]`
      )
      .locator('label:has-text("Australian Capital Territory")')
      .locator('input[type="checkbox"]')
      .isChecked();

    const isQueenslandCheckedAgain = await page
      .locator(
        `div[data-test="q-item-open-choice-checkbox-answer-value-set-box"][data-linkid="${openChoiceCheckboxLinkId}"]`
      )
      .locator('label:has-text("Queensland")')
      .locator('input[type="checkbox"]')
      .isChecked();

    expect(isACTCheckedAgain).toBe(true);
    expect(isQueenslandCheckedAgain).toBe(true);
  });
});

test.describe('EnableWhenMultiCheckbox questionnaire (also test repeating items)', () => {
  test('enter inputs in /playground', async ({ page }) => {
    // Select and build OpenChoiceCheckboxAVS questionnaire in playground
    await goToPlayground(page);
    await selectQuestionnaireInPlayground(page, {
      pickerInput: 'EnableWhenMultiCheckbox',
      questionnaireId: 'EnableWhenMultiCheckbox',
      questionnaireUrl: 'https://smartforms.csiro.au/docs/behavior/other/enable-when-multi-checkbox'
    });

    const openChoiceCheckboxLinkId = 'select-conditions-list';

    // Check on a single option, then check for displayed enableWhen display question
    await page
      .locator(
        `div[data-test="q-item-open-choice-checkbox-answer-option-box"][data-linkid="${openChoiceCheckboxLinkId}"]`
      )
      .locator('label:has-text("Condition A (Displays Clinical guidance: Condition A question)")')
      .check();

    await expect(page.getByTestId('q-item-display-box')).toContainText(
      'Clinical guidance: Condition A'
    );

    // Check on options A. B. C, then check for all displayed enableWhen display questions
    await page
      .locator(
        `div[data-test="q-item-open-choice-checkbox-answer-option-box"][data-linkid="${openChoiceCheckboxLinkId}"]`
      )
      .locator('label:has-text("Condition B (Displays Clinical guidance: Condition B question)")')
      .check();

    await page
      .locator(
        `div[data-test="q-item-open-choice-checkbox-answer-option-box"][data-linkid="${openChoiceCheckboxLinkId}"]`
      )
      .locator('label:has-text("Condition C (Displays Clinical guidance: Condition C question)")')
      .check();

    await expect(page.getByTestId('q-item-display-box').first()).toContainText(
      'Clinical guidance: Condition A'
    );
    await expect(page.getByTestId('q-item-display-box').nth(1)).toContainText(
      'Clinical guidance: Condition B'
    );
    await expect(page.getByTestId('q-item-display-box').nth(2)).toContainText(
      'Clinical guidance: Condition C'
    );
  });
});
