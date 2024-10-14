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

test.beforeEach(async ({ page }) => {
  // Go to playground
  const fetchQPromise = page.waitForResponse(
    `${PLAYWRIGHT_FORMS_SERVER_URL}/Questionnaire?_count=100&_sort=-date&`
  );
  const launchUrl = `${PLAYWRIGHT_APP_URL}/playground`;
  await page.goto(launchUrl);
  const fetchQResponse = await fetchQPromise;
  expect(fetchQResponse.status()).toBe(200);
});

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

test('enter inputs into BitOfEverything questionnaire', async ({ page }) => {
  // Select BitOfEverything questionnaire
  await page
    .getByTestId('questionnaire-picker-playground')
    .locator('input')
    .fill('bitofeverything');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('questionnaire-details-playground')).toContainText(
    'BitOfEverything'
  );
  await expect(page.getByTestId('questionnaire-details-playground')).toContainText(
    'http://fhir.telstrahealth.com/fast-forms/Questionnaire/bit-of-everything'
  );

  // Build BitOfEverything questionnaire
  await page.getByTestId('picker-build-form-button-playground').click();
  await expect(page.getByText('"resourceType": "Questionnaire"')).toBeInViewport();
  await expect(page.getByText('"id": "BitOfEverything"')).toBeInViewport();

  // Enter inputs
  // Display
  await expect(page.getByTestId('q-item-display-box')).toContainText('display label');

  // String
  const stringItemLinkId = 'Item-string';
  await page
    .getByTestId('q-item-string-box')
    .getByTestId('q-item-string-field')
    .locator(`#${stringItemLinkId}`)
    .fill(stringInput);

  // Text
  const textItemLinkId = 'Item-text';
  await page
    .getByTestId('q-item-text-box')
    .getByTestId('q-item-text-field')
    .locator(`#${textItemLinkId}`)
    .fill(textInput);

  // Boolean
  const booleanItemLinkId = 'Item-bool';
  await page
    .getByTestId('q-item-boolean-box')
    .locator(`#${booleanItemLinkId}`)
    .locator('input')
    .first()
    .click();

  // Date
  const dateItemLinkId = 'Item-date';
  await page
    .getByTestId('q-item-date-box')
    .locator(`#${dateItemLinkId}-date`)
    .pressSequentially(dateInput, { delay: 100 });

  // DateTime
  const dateTimeItemLinkId = 'Item-datetime';
  await page
    .getByTestId('q-item-datetime-box')
    .locator(`#${dateTimeItemLinkId}-date`)
    .pressSequentially(dtDateInput, { delay: 100 });

  await page
    .getByTestId('q-item-datetime-box')
    .locator(`#${dateTimeItemLinkId}-time`)
    .fill(dtTimeInput);
  await page.getByTestId('q-item-datetime-box').locator(`#${dateTimeItemLinkId}-period`).click();
  await page.getByRole('option', { name: dtPeriodInput, exact: true }).click();

  // Skipping Time for now

  // Integer
  const integerItemLinkId = 'Item-integer';
  await page.getByTestId('q-item-integer-box').locator(`#${integerItemLinkId}`).fill(integerInput);

  // Decimal
  const decimalItemLinkId = 'Item-decimal';
  await page.getByTestId('q-item-decimal-box').locator(`#${decimalItemLinkId}`).fill(decimalInput);
  await expect(page.getByTestId('q-item-decimal-box').first()).toContainText('meters'); // first() is hacky

  // Url
  const urlItemLinkId = 'Item-url';
  await page.getByTestId('q-item-url-box').locator(`#${urlItemLinkId}`).fill(urlInput);

  // Skipping Reference for now

  // Skipping Attachment for now

  // Skipping Quantity for now

  // Choice answerOption - option A
  const choiceItemAnswerOptionLinkId = 'Item-rb-local';
  await page.getByTestId('q-item-choice-select-answer-option-box').first().scrollIntoViewIfNeeded();
  await page
    .getByTestId('q-item-choice-select-answer-option-box')
    .locator(`#${choiceItemAnswerOptionLinkId}`)
    .pressSequentially('option a', { delay: 100 });
  await page.keyboard.press('Enter');

  // Choice answerValueSet - Tasmania
  const choiceItemAnswerValueSetLinkId = 'Item10';
  await page
    .getByTestId('q-item-choice-select-answer-value-set-box')
    .locator(`#${choiceItemAnswerValueSetLinkId}`)
    .pressSequentially('tasmania', { delay: 100 });
  await page.keyboard.press('Enter');

  // Check QR if our inputs are valid
  await page.getByTestId('see-store-state-button-playground').click();
  await page
    .getByTestId('specific-state-picker-playground')
    .locator('button[value="updatableResponse"]')
    .click();

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

test('enter inputs into OpenChoiceCheckboxAVS questionnaire', async ({ page }) => {
  // Select OpenChoiceCheckboxAVS questionnaire
  await page
    .getByTestId('questionnaire-picker-playground')
    .locator('input')
    .fill('OpenChoiceCheckboxAVS');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('questionnaire-details-playground')).toContainText(
    'Open Choice Checkbox - Answer Value Set'
  );
  await expect(page.getByTestId('questionnaire-details-playground')).toContainText(
    'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/open-choice-checkbox-avs'
  );

  // Build OpenChoiceCheckboxAVS questionnaire
  await page.getByTestId('picker-build-form-button-playground').click();
  await expect(page.getByText('"resourceType": "Questionnaire"')).toBeInViewport();
  await expect(page.getByText('"id": "OpenChoiceCheckboxAVS"')).toBeInViewport();

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

test('enableWhen multi-checkbox (also for repeating items)', async ({ page }) => {
  // Select EnableWhenMultiCheckbox questionnaire
  await page
    .getByTestId('questionnaire-picker-playground')
    .locator('input')
    .fill('EnableWhenMultiCheckbox');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('questionnaire-details-playground')).toContainText(
    'EnableWhen Multi-select Checkbox'
  );
  await expect(page.getByTestId('questionnaire-details-playground')).toContainText(
    'https://smartforms.csiro.au/docs/behavior/other/enable-when-multi-checkbox'
  );

  // Build OpenChoiceCheckboxAVS questionnaire
  await page.getByTestId('picker-build-form-button-playground').click();
  await expect(page.getByText('"resourceType": "Questionnaire"')).toBeInViewport();
  await expect(page.getByText('"id": "EnableWhenMultiCheckbox"')).toBeInViewport();

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
