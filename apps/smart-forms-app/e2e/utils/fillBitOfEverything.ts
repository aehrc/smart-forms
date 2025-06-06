import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface BitOfEverythingInputData {
  stringInput: string;
  textInput: string;
  dateInput: string;
  dtDateInput: string;
  dtTimeInput: string;
  dtPeriodInput: string;
  integerInput: string;
  decimalInput: string;
  urlInput: string;
}

export async function fillBitOfEverything(page: Page, inputData: BitOfEverythingInputData) {
  const {
    stringInput,
    textInput,
    dateInput,
    dtDateInput,
    dtTimeInput,
    dtPeriodInput,
    integerInput,
    decimalInput,
    urlInput
  } = inputData;

  // Enter/Check inputs into BitOfEverything questionnaire
  // Display
  await expect(page.getByTestId('q-item-display-box')).toContainText('display label');

  // String
  const stringItemLinkId = 'string-Item-string';
  await page
    .getByTestId('q-item-string-box')
    .getByTestId('q-item-string-field')
    .locator(`#${stringItemLinkId}`)
    .fill(stringInput);

  // Text
  const textItemLinkId = 'text-Item-text';
  await page
    .getByTestId('q-item-text-box')
    .getByTestId('q-item-text-field')
    .locator(`#${textItemLinkId}`)
    .fill(textInput);

  // Boolean
  const booleanItemLinkId = 'boolean-Item-bool';
  await page
    .getByTestId('q-item-boolean-box')
    .locator(`#${booleanItemLinkId}`)
    .locator('input')
    .first()
    .click();

  // Date
  const dateItemLinkId = 'date-Item-date';
  await page
    .getByTestId('q-item-date-box')
    .locator(`#${dateItemLinkId}`)
    .pressSequentially(dateInput, { delay: 100 });

  // DateTime
  const dateTimeItemLinkId = 'dateTime-Item-datetime';
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
  const integerItemLinkId = 'integer-Item-integer';
  await page.getByTestId('q-item-integer-box').locator(`#${integerItemLinkId}`).fill(integerInput);

  // Decimal
  const decimalItemLinkId = 'decimal-Item-decimal';
  await page.getByTestId('q-item-decimal-box').locator(`#${decimalItemLinkId}`).fill(decimalInput);
  await expect(page.getByTestId('q-item-decimal-box').first()).toContainText('meters'); // first() is hacky

  // Url
  const urlItemLinkId = 'url-Item-url';
  await page.getByTestId('q-item-url-box').locator(`#${urlItemLinkId}`).fill(urlInput);

  // Skipping Reference for now

  // Skipping Attachment for now

  // Skipping Quantity for now

  // Choice answerOption - option A
  const choiceItemAnswerOptionLinkId = 'choice-Item-rb-local';
  await page.getByTestId('q-item-choice-select-answer-option-box').first().scrollIntoViewIfNeeded();
  await page
    .getByTestId('q-item-choice-select-answer-option-box')
    .locator(`#${choiceItemAnswerOptionLinkId}`)
    .pressSequentially('option a', { delay: 100 });
  await page.keyboard.press('Enter');

  // Choice answerValueSet - Tasmania
  const choiceItemAnswerValueSetLinkId = 'choice-Item10';
  await page
    .getByTestId('q-item-choice-select-answer-value-set-box')
    .locator(`#${choiceItemAnswerValueSetLinkId}`)
    .pressSequentially('tasmania', { delay: 100 });
  await page.keyboard.press('Enter');
}
